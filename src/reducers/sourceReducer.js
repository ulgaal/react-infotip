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
import { toRect, getElement, corner, surface, overlap, LOGS } from '../utils'
import isEqual from 'lodash.isequal'

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
export const TARGET = 'TARGET'
export const GEOMETRY = 'GEOMETRY'
export const VISIBILITY = 'VISIBILITY'
export const RESET = 'RESET'
export const ATTACH_OBSERVER = 'ATTACH_OBSERVER'
export const DETACH_OBSERVER = 'DETACH_OBSERVER'

export const sourceInit = props => {
  const { config, pinned } = props
  const {
    position: {
      target,
      adjust: { mouse },
      container
    }
  } = config
  const containerElt = getElement(container)
  const state = {
    my: 'top-left',
    ...props,
    visible: pinned === true,
    showTimeoutId: undefined,
    hideTimeoutId: undefined,
    containerElt
  }

  if (!mouse && Array.isArray(target)) {
    state.target = { left: target[0], top: target[1], width: 1, height: 1 }
  }

  return state
}

/**
 * A reducer function to transform DOM events into Source state updates
 */
export const sourceReducer = (state, action) => {
  if (LOGS.source > 1) {
    console.log('sourceReducer', { type: action.type, state, action })
  }
  const { type, ...params } = action
  switch (type) {
    case MOUSE_OVER: {
      const { pinned } = state
      if (pinned) {
        return state
      }
      const { hideTimeoutId } = state
      if (hideTimeoutId) {
        clearInterval(hideTimeoutId)
        return { ...state, hideTimeoutId: undefined }
      }
      const { config, id } = state
      const {
        show: { delay },
        position: { target }
      } = config
      const { dispatch, position } = action
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
          ? layout(state, {
              target: {
                left: position.x + window.scrollX,
                top: position.y + window.scrollY,
                width: 1,
                height: 1
              }
            })
          : null
      return {
        ...state,
        showTimeoutId,
        ...updates
      }
    }

    case MOUSE_OUT: {
      const { pinned } = state
      if (pinned) {
        return state
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
      return { ...state, hideTimeoutId }
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
              x: position.x + window.scrollX,
              y: position.y + window.scrollY
            })
      const { x, y } = transform(position)
      const updates = layout(state, {
        target: {
          left: x,
          top: y,
          width: 1,
          height: 1
        }
      })
      return updates ? { ...state, ...updates } : state
    }

    case TARGET: {
      const updates = layout(state, { target: action.target })
      return updates ? { ...state, ...updates } : state
    }

    case GEOMETRY: {
      const updates = layout(state, { geometry: action.geometry })
      return updates ? { ...state, ...updates } : state
    }

    case VISIBILITY: {
      return { ...state, ...params }
    }

    case RESET: {
      const { showTimeoutId, hideTimeoutId } = state
      if (showTimeoutId) {
        clearInterval(showTimeoutId)
      }
      if (hideTimeoutId) {
        clearInterval(hideTimeoutId)
      }
      return sourceInit(params)
    }
  }
}

// The layout function computes the actual tip placement, taking into account
// the target shape, the tip shape and the container shape.
const layout = (state, params) => {
  const { target, geometry, config, pinned, location } = { ...state, ...params }
  const updates = {}
  if (!pinned || !location) {
    if (!isEqual(target, state.target)) {
      updates.target = target
    }
    if (!isEqual(geometry, state.geometry)) {
      updates.geometry = geometry
    }
    const containerElt =
      state.containerElt || getElement(config.position.container)
    if (!state.containerElt) {
      updates.containerElt = containerElt
    }
    const container = state.container || toRect(containerElt)
    if (!state.container) {
      updates.container = container
    }
    if (target && geometry) {
      const {
        position: {
          at,
          my,
          adjust: { method, x, y }
        }
      } = config
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
        let area = surface(overlap(container, updates.location))
        if (area < surface(updates.location)) {
          if (method.flip) {
            for (const my of method.flip) {
              const location = computeRect(my)
              const area_ = surface(overlap(container, location))
              if (area_ > area) {
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
                  container.left + container.width
                ) {
                  updates.location.left =
                    container.left + container.width - updates.location.width
                }
              }
              if (RIGHT.has(my)) {
                if (updates.location.left < container.left) {
                  updates.location.left = container.left
                }
              }
            }
            if (method.shift.indexOf('vertical') !== -1) {
              if (BOTTOM.has(my)) {
                if (updates.location.top < container.top) {
                  updates.location.top = container.top
                }
              }
              if (TOP.has(my)) {
                if (
                  updates.location.top + updates.location.height >
                  container.top + container.height
                ) {
                  updates.location.top =
                    container.top + container.height - updates.location.height
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
