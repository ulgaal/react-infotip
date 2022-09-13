/*
Copyright 2019 Ulrich Gaal

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
// sourceReducer
// =============
import { toRect, getElement, corner, surface, overlap, log } from '../utils'

const LEFT = new Set([
  'top-left',
  'center-left',
  'bottom-left',
  'top-center',
  'bottom-center'
])
const RIGHT = new Set([
  'top-right',
  'center-right',
  'bottom-right',
  'top-center',
  'bottom-center'
])
const TOP = new Set([
  'top-left',
  'top-center',
  'top-right',
  'center-right',
  'center-left'
])
const BOTTOM = new Set([
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'center-right',
  'center-left'
])

export const MOUSE_OVER = 'MOUSE_OVER'
export const MOUSE_MOVE = 'MOUSE_MOVE'
export const MOUSE_OUT = 'MOUSE_OUT'
export const GEOMETRY = 'GEOMETRY'
export const VISIBILITY = 'VISIBILITY'
export const PIN = 'PIN'
export const RESET = 'RESET'
export const DISABLE = 'DISABLE'
export const UNMOUNT = 'UNMOUNT'

export const sourceInit = params => {
  const state = {
    my: 'top-left',
    ...params,
    showTimeoutId: undefined,
    hideTimeoutId: undefined
  }
  return state
}

/**
 * A reducer function to transform DOM events into Source state updates
 */
export const sourceReducer = (state, action) => {
  log('sourceReducer', 0, { type: action.type, state, action })
  const { type, ...params } = action
  switch (type) {
    case MOUSE_OVER: {
      const { pinned, visible } = state
      if (pinned) {
        return state
      }
      const { hideTimeoutId } = state
      if (hideTimeoutId) {
        clearInterval(hideTimeoutId)
      }
      // If the tip is already visible, no need to schedule
      // an event to show it
      if (visible) {
        return { ...state, hideTimeoutId: undefined }
      }
      const { config, id } = state
      const {
        show: { delay },
        position: { target }
      } = config
      const { dispatch, position, ref } = action
      const showTimeoutId = setTimeout(() => {
        dispatch({
          type: VISIBILITY,
          id,
          visible: true,
          config,
          showTimeoutId: undefined
        })
      }, delay)
      const updates =
        target === 'mouse'
          ? {
              target: {
                left: position.x,
                top: position.y,
                width: 1,
                height: 1
              }
            }
          : null
      return {
        ...state,
        ref,
        showTimeoutId,
        hideTimeoutId: undefined,
        ...updates
      }
    }

    case MOUSE_OUT: {
      const { pinned } = state
      if (pinned) {
        return state
      }
      const { showTimeoutId } = state
      if (showTimeoutId) {
        clearInterval(showTimeoutId)
      }
      const { config, id } = state
      const {
        hide: { delay }
      } = config
      const { dispatch } = action
      const hideTimeoutId = setTimeout(() => {
        dispatch({
          type: VISIBILITY,
          id,
          visible: false,
          config,
          hideTimeoutId: undefined
        })
      }, delay)
      return { ...state, hideTimeoutId, showTimeoutId: undefined }
    }

    case UNMOUNT: {
      const { showTimeoutId, hideTimeoutId } = state
      if (showTimeoutId) {
        clearInterval(showTimeoutId)
      }
      if (hideTimeoutId) {
        clearInterval(hideTimeoutId)
      }
      return { ...state, hideTimeoutId: undefined, showTimeoutId: undefined }
    }

    case MOUSE_MOVE: {
      const { config } = state
      const {
        position: {
          adjust: { mouse }
        }
      } = config
      const { position } = action
      const transform =
        typeof mouse === 'function'
          ? mouse
          : event => ({
              x: position.x,
              y: position.y
            })
      const { x, y } = transform(position)
      const updates = layout(state, {
        mouse: {
          left: x,
          top: y,
          width: 1,
          height: 1
        }
      })
      return updates ? { ...state, ...updates } : state
    }

    case GEOMETRY: {
      const updates = layout(state, { geometry: action.geometry })
      return updates ? { ...state, ...updates } : state
    }

    case VISIBILITY: {
      let { containerElt, viewportElt, location, ...rest } = state
      if (action.visible && !containerElt) {
        const { container, viewport } = state.config.position
        containerElt = getElement(container)
        viewportElt =
          viewport === container || !viewport
            ? containerElt
            : getElement(viewport)
      }
      return {
        ...rest,
        ...params,
        containerElt,
        viewportElt,
        ...(action.visible && location ? { location } : {})
      }
    }

    case PIN: {
      const { visible, containerElt, config } = state
      const updates = {}
      if (action.pinned && !visible) {
        updates.visible = true
        if (!containerElt) {
          const { container, viewport } = config.position
          updates.containerElt = getElement(container)
          updates.viewportElt =
            viewport === container || !viewport
              ? updates.containerElt
              : getElement(viewport)
        }
      }
      return { ...state, ...params, ...updates }
    }

    case RESET: {
      // Forget previous location
      const { showTimeoutId, hideTimeoutId, ...rest } = state
      const { config } = action
      state = { ...rest, config }
      const {
        position: {
          adjust: { location }
        }
      } = config
      if (location) {
        const updates = layout(state, {})
        return updates ? { ...state, ...updates } : state
      } else {
        if (showTimeoutId) {
          clearInterval(showTimeoutId)
        }
        if (hideTimeoutId) {
          clearInterval(hideTimeoutId)
        }  
      }
      return state
    }
  }
}

// The layout function computes the actual tip placement, taking into account
// the target, tip and viewport rects.
const layout = (state, params) => {
  log('sourceReducer', 1, 'layout', state, params)
  const { config, ref, viewportElt, containerElt } = state
  let { target, geometry, viewport, container } = state
  const updates = {}
  const {
    position: {
      target: targetConf,
      at,
      my,
      adjust: { method, x, y, location }
    }
  } = config
  if (location) {
    params.mouse = {
      ...location,
      width: 1,
      height: 1
    }
  }
  if (params.mouse) {
    updates.target = target = params.mouse
  }
  if (!target) {
    let targetElt = null
    if (targetConf === false) {
      targetElt = ref.firstChild
    }
    if (typeof targetConf === 'string') {
      // The `target` key of the `config` property enables the tip
      // to appear at a location different from the source
      targetElt = document.querySelector(targetConf)
    }
    if (Array.isArray(targetConf)) {
      updates.target = target = {
        left: targetConf[0],
        top: targetConf[1],
        width: 1,
        height: 1
      }
    } else {
      updates.target = target = toRect(targetElt)
    }
  }
  if (params.geometry) {
    updates.geometry = geometry = params.geometry
  }

  if (containerElt) {
    if (!container) {
      updates.container = container = toRect(containerElt)
    }
  }

  if (viewportElt) {
    if (!viewport) {
      updates.viewport = viewport = toRect(viewportElt)
    }
    if (target && geometry) {
      const { size, corners } = geometry
      const targetCorner = corner(target, at)
      const computeRect = my => {
        const myCorner = corners[my]
        return {
          left: target.left + targetCorner.left - myCorner.left + x,
          top: target.top + targetCorner.top - myCorner.top + y,
          ...size
        }
      }
      updates.my = my
      updates.location = computeRect(my)
      if (typeof method === 'object') {
        let area = surface(overlap(viewport, updates.location))
        if (area < surface(updates.location)) {
          if (method.flip) {
            for (const my of method.flip) {
              const location = computeRect(my)
              const area_ = surface(overlap(viewport, location))
              if (area_ - area > 0.0001) {
                updates.location = location
                updates.my = my
                area = area_
              }
            }
          } else if (method.shift) {
            if (method.shift.indexOf('horizontal') !== -1) {
              if (LEFT.has(my)) {
                if (
                  updates.location.left + updates.location.width >
                  viewport.left + viewport.width
                ) {
                  updates.location.left =
                    viewport.left + viewport.width - updates.location.width
                }
              }
              if (RIGHT.has(my)) {
                if (updates.location.left < viewport.left) {
                  updates.location.left = viewport.left
                }
              }
            }
            if (method.shift.indexOf('vertical') !== -1) {
              if (BOTTOM.has(my)) {
                if (updates.location.top < viewport.top) {
                  updates.location.top = viewport.top
                }
              }
              if (TOP.has(my)) {
                if (
                  updates.location.top + updates.location.height >
                  viewport.top + viewport.height
                ) {
                  updates.location.top =
                    viewport.top + viewport.height - updates.location.height
                }
              }
            }
          }
        }
      }
      updates.location.left -= container.left
      updates.location.top -= container.top
    }
  }
  return Object.keys(updates).length > 0 ? updates : null
}
