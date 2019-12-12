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
// Engine
// ======
import { toRect, getElement, corner, surface, overlap } from './utils'
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

/**
 * The `Engine` class provides common tip logic for the `Source`
 * and `Storage` class. It is responsible for tip timers and tip placement.
 * It is not a React component.
 * It receives DOM events from `Source` and `Storage` and transforms them into
 * higher level events that propagate to the engine output (either
 * a `Source` or a `Storage`):
 * * `onLayoutChange` when the location of the tip changes.
 * * `onVisibilityChange` when the visibility of the tip changes.
 */
export default class Engine {
  constructor (params) {
    // Params has the following shape: { id, config, output }
    Object.assign(this, params)
  }

  // The `handleMouseOver` and `handleMouseOut` methods use
  // timers to determine when a tip should be made visible or hidden.
  handleMouseOver (event) {
    if (!this.pinned) {
      event.stopPropagation()
      const {
        show: { delay },
        position: { target }
      } = this.config
      if (this.hideTimeoutId) {
        clearInterval(this.hideTimeoutId)
        this.hideTimeoutId = undefined
      } else {
        this.showTimeoutId = setTimeout(() => {
          this.showTimeoutId = undefined
          this.visible = true
          this.output.onVisibilityChange({
            id: this.id,
            visible: this.visible,
            config: this.config
          })
        }, delay)
        if (target === 'mouse') {
          this.update({
            target: {
              left: event.clientX + window.scrollX,
              top: event.clientY + window.scrollY,
              width: 1,
              height: 1
            }
          })
        }
      }
    }
  }

  handleMouseOut (event) {
    if (!this.pinned) {
      if (event) {
        event.stopPropagation()
      }
      const {
        hide: { delay }
      } = this.config
      if (this.showTimeoutId) {
        clearInterval(this.showTimeoutId)
        this.showTimeoutId = undefined
      } else {
        this.hideTimeoutId = setTimeout(() => {
          this.hideTimeoutId = undefined
          this.visible = false
          this.output.onVisibilityChange({
            id: this.id,
            visible: this.visible,
            config: this.config
          })
          delete this.geometry
        }, delay)
      }
    }
  }

  // The `handleMouseMove` method handles tip placements
  // when the mouse tracking config key is set.
  handleMouseMove (event) {
    const {
      position: {
        adjust: { mouse }
      }
    } = this.config
    const transform =
      typeof mouse === 'function'
        ? mouse
        : event => ({
          x: event.clientX + window.scrollX,
          y: event.clientY + window.scrollY
        })
    const { x, y } = transform(event)
    this.update({
      target: {
        left: x,
        top: y,
        width: 1,
        height: 1
      }
    })
  }

  // The `pin` method is used to force tip visibility or hiding.
  pin (pinned) {
    if (pinned === this.pinned) {
      return
    }
    if (this.showTimeoutId) {
      clearInterval(this.showTimeoutId)
      this.showTimeoutId = undefined
    }
    if (this.hideTimeoutId) {
      clearInterval(this.hideTimeoutId)
      this.hideTimeoutId = undefined
    }
    if (pinned) {
      if (!this.visible) {
        this.visible = true
        this.output.onVisibilityChange({
          id: this.id,
          visible: this.visible,
          config: this.config
        })
      }
    } else {
      if (this.visible) {
        this.handleMouseOut()
      }
    }
    this.pinned = pinned
  }

  // The update method is invoked by `Source`, `Storage` or `Engine` itself
  // when a change occurs, which may have an impact on tip position.
  // There are three main possible changes:
  // * `target` the source or its target changes.
  // * `geometry` the shape of the tip changes.
  // * `config` the config property changes.
  update ({ target, geometry, config }) {
    const { position } = this.config
    const updated = {}

    const container = toRect(getElement(position.container))
    if (!isEqual(container, this.container)) {
      updated.container = container
    }

    if (
      target &&
      ((target.nodeType === 1 && this.target !== target) ||
        !isEqual(target, this.target))
    ) {
      updated.target = target
    }

    if (config) {
      if (!isEqual(config, this.config)) {
        updated.config = config
      }
    }

    if (geometry && !isEqual(geometry, this.geometry)) {
      updated.geometry = geometry
    }

    if (Object.keys(updated).length > 0) {
      Object.assign(this, updated)
      this.layout()
    }
  }

  // The layout method computes the actual tip placement, taking into account
  // the target shape, the tip shape and the container shape.
  layout () {
    const { target, geometry, container } = this
    if (target && geometry && container) {
      const {
        position: {
          at,
          my,
          adjust: { method, x, y }
        }
      } = this.config
      const { size, corners } = geometry
      const target_ = target.nodeType === 1 ? toRect(target) : target
      const targetCorner = corner(target_, at)
      const computeRect = my => {
        const myCorner = corners[my]
        return {
          left: target_.left + targetCorner.left - myCorner.left + x,
          top: target_.top + targetCorner.top - myCorner.top + y,
          ...size
        }
      }
      const result = { my, location: computeRect(my) }
      if (typeof method === 'object') {
        let area = surface(overlap(container, result.location))
        if (area < surface(result.location)) {
          if (method.flip) {
            for (const my of method.flip) {
              const location = computeRect(my)
              const area_ = surface(overlap(container, location))
              if (area_ > area) {
                result.location = location
                result.my = my
                area = area_
              }
            }
          } else if (method.shift) {
            if (method.shift.indexOf('horizontal') !== -1) {
              if (LEFT.has(my)) {
                if (
                  result.location.left + result.location.width >
                  container.left + container.width
                ) {
                  result.location.left =
                    container.left + container.width - result.location.width
                }
              }
              if (RIGHT.has(my)) {
                if (result.location.left < container.left) {
                  result.location.left = container.left
                }
              }
            }
            if (method.shift.indexOf('vertical') !== -1) {
              if (BOTTOM.has(my)) {
                if (result.location.top < container.top) {
                  result.location.top = container.top
                }
              }
              if (TOP.has(my)) {
                if (
                  result.location.top + result.location.height >
                  container.top + container.height
                ) {
                  result.location.top =
                    container.top + container.height - result.location.height
                }
              }
            }
          }
        }
      }
      result.location.left -= container.left
      result.location.top -= container.top
      this.output.onLayoutChange({
        id: this.id,
        ...result,
        config: this.config
      })
    }
  }
}
