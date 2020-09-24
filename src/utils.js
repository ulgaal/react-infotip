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
// utils.js
// ========

import deepmerge from 'deepmerge'
/**
 * Returns the corner position of a rect
 */
export const corner = (dimensions, position) => {
  const { width = 0, height = 0 } = dimensions
  switch (position) {
    case 'top-left':
      return {
        left: 0,
        top: 0
      }
    case 'top-center':
      return {
        left: width * 0.5,
        top: 0
      }
    case 'top-right':
      return {
        left: width,
        top: 0
      }
    case 'center-left':
      return {
        left: 0,
        top: height * 0.5
      }
    case 'center-right':
      return {
        left: width,
        top: height * 0.5
      }
    case 'bottom-left':
      return {
        left: 0,
        top: height
      }
    case 'bottom-center':
      return {
        left: width * 0.5,
        top: height
      }
    case 'bottom-right':
      return {
        left: width,
        top: height
      }
    default:
      throw Error(`Unknown position ${position}`, position)
  }
}

/**
 * Compute the overlap of two rects
 */
export const overlap = (r1, r2) => ({
  width: Math.max(
    0,
    Math.min(r1.left + r1.width, r2.left + r2.width) -
      Math.max(r1.left, r2.left)
  ),
  height: Math.max(
    0,
    Math.min(r1.top + r1.height, r2.top + r2.height) - Math.max(r1.top, r2.top)
  )
})

/**
 * Compute the surface of a rect
 */
export const surface = ({ width, height }) => width * height

/**
 * Read a property from an object
 */
export const getProperty = (obj, path) =>
  path
    .split('.')
    .reduce(
      (obj, prop) =>
        obj && Object.prototype.hasOwnProperty.call(obj, prop)
          ? obj[prop]
          : null,
      obj
    )

/**
 * Appends the `px` suffix to the values of an object
 */
export const pixelize = obj =>
  Object.entries(obj || {}).reduce((obj, [key, value]) => {
    obj[key] = `${value}px`
    return obj
  }, {})

/**
 * Merge two objects
 */
export const mergeObjects = (obj1, obj2) => {
  if (obj1) {
    if (obj2) {
      return deepmerge(obj1, obj2)
    } else {
      return obj1
    }
  } else {
    if (obj2) {
      return obj2
    } else {
      return {}
    }
  }
}

/**
 * Compute the bounding rect of a DOMElement
 */
export const toRect = element => {
  const rect = element
    ? element.getBoundingClientRect()
    : { left: 0, top: 0, width: 0, height: 0 }
  const { left, top, width, height } = rect
  return {
    left: left + window.scrollX,
    top: top + window.scrollY,
    width,
    height
  }
}

/**
 * Returns the DOMElement specified by the value (or the document `<body>` if no value is specified)
 */
export const getElement = value => {
  if (!value) {
    return document.body
  }
  if (typeof value === 'string') {
    return document.querySelector(value)
  }
  return value
}

/**
 * Returns true if two Sets are equal
 */
export const eqSet = (as, bs) => {
  if (as.size !== bs.size) {
    return false
  }
  for (var a of as) {
    if (!bs.has(a)) {
      return false
    }
  }
  return true
}

/**
 * Substracts two Sets.
 */
export const diffSet = (as, bs) => new Set([...as].filter(obj => !bs.has(obj)))

/**
 * A sequence generator function
 */
export function * seq (start, end) {
  if (start < end) {
    for (let current = start; current < end; current++) {
      yield current
    }
  } else {
    for (let current = start; current > end; current--) {
      yield current
    }
  }
}

export const LOGS = {}

export const log = (facility, severity, ...args) => {
  const sev = LOGS[facility]
  if (typeof sev === 'number' && severity >= sev) {
    console.log(facility, ...args)
  }
}
