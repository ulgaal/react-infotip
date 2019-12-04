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
import {
  mergeObjects,
  eqSet,
  diffSet,
  getProperty,
  corner,
  overlap,
  surface,
  pixelize,
  seq,
  autobind
} from './utils'
import { styles } from './styles'
import { defaultConfig } from './Contexts'
/* global describe, it, expect */

describe('utils', () => {
  describe('mergeObjects', () => {
    it('merges two configs', () => {
      expect(
        mergeObjects(
          {
            a: {
              b: 1,
              c: 2
            }
          },
          {
            a: {
              b: 2,
              d: 4
            }
          }
        )
      ).toEqual({
        a: {
          b: 2,
          c: 2,
          d: 4
        }
      })
      expect(
        mergeObjects({ wrapperProps: styles.defaultStyle }, defaultConfig)
      ).toEqual({ ...defaultConfig, wrapperProps: styles.defaultStyle })
    })
    it('accepts undefined', () => {
      const o1 = { a: { b: 2 }, c: 3 }
      expect(mergeObjects(o1, undefined)).toEqual(o1)
    })
    it('does nothing for null configs', () => {
      expect(
        mergeObjects(
          {
            a: {
              b: 1,
              c: 2
            }
          },
          null
        )
      ).toEqual({
        a: {
          b: 1,
          c: 2
        }
      })
    })
    it('does not overwrite objects', () => {
      const foo = { foo: '' }
      const bar = {}
      const bazz = mergeObjects(bar, foo)
      expect(foo === bazz).toBe(false)
      expect(bar === bazz).toBe(false)
    })
  })

  describe('eqSet', () => {
    it('compares two sets', () => {
      expect(eqSet(new Set(['A', 'B', 'C']), new Set(['C', 'B', 'A']))).toBe(
        true
      )
      expect(eqSet(new Set(['A', 'B', 'C']), new Set(['C', 'B']))).toBe(false)
      expect(eqSet(new Set(['A', 'B', 'C']), new Set(['C', 'B', 'E']))).toBe(
        false
      )
    })
  })

  describe('diffSet', () => {
    it('subtracts two sets', () => {
      expect(
        eqSet(
          diffSet(new Set(['A', 'B', 'C', 'D']), new Set(['A', 'C'])),
          new Set(['B', 'D'])
        )
      ).toBe(true)
    })
  })

  describe('getProperty', () => {
    it('retrieves property from an object', () => {
      const a = {
        b: 1,
        c: {
          d: 'DDD'
        }
      }
      expect(getProperty(a, 'b')).toEqual(1)
      expect(getProperty(a, 'c.d')).toEqual('DDD')
      expect(getProperty(null, 'b')).toEqual(null)
    })
  })

  describe('corner', () => {
    it('computes the proper corner of a box', () => {
      const dimensions = { width: 20, height: 14 }
      expect(corner(dimensions, 'top-left')).toEqual({ left: 0, top: 0 })
      expect(corner(dimensions, 'top-center')).toEqual({ left: 10, top: 0 })
      expect(corner(dimensions, 'top-right')).toEqual({ left: 20, top: 0 })
      expect(corner(dimensions, 'bottom-left')).toEqual({ left: 0, top: 14 })
      expect(corner(dimensions, 'bottom-center')).toEqual({ left: 10, top: 14 })
      expect(corner(dimensions, 'bottom-right')).toEqual({ left: 20, top: 14 })
      expect(corner(dimensions, 'center-left')).toEqual({ left: 0, top: 7 })
      expect(corner(dimensions, 'center-right')).toEqual({ left: 20, top: 7 })
    })
  })

  describe('overlap', () => {
    it('computes the overlap of two rects', () => {
      expect(
        overlap(
          { left: 0, top: 0, width: 10, height: 5 },
          { left: 7, top: 1, width: 10, height: 5 }
        )
      ).toEqual({ width: 3, height: 4 })
      expect(
        overlap(
          { left: 7, top: 1, width: 10, height: 5 },
          { left: 0, top: 0, width: 10, height: 5 }
        )
      ).toEqual({ width: 3, height: 4 })
      expect(
        overlap(
          { left: 0, top: 0, width: 10, height: 5 },
          { left: 0, top: 0, width: 10, height: 5 }
        )
      ).toEqual({ width: 10, height: 5 })
      expect(
        overlap(
          { left: 0, top: 0, width: 10, height: 5 },
          { left: 50, top: 50, width: 10, height: 5 }
        )
      ).toEqual({ width: 0, height: 0 })
    })
  })

  describe('surface', () => {
    it('computes the surface of a rect', () => {
      expect(surface({ width: 6, height: 7 })).toEqual(42)
    })
  })

  describe('pixelize', () => {
    it('should add proper suffix to properties', () => {
      expect(pixelize({ width: 6, height: 7 })).toEqual({
        width: '6px',
        height: '7px'
      })
    })
  })

  describe('seq', () => {
    it('generates ascending sequences', () => {
      expect([...seq(0, 3)]).toEqual([0, 1, 2])
    })
    it('generates descending sequences', () => {
      expect([...seq(2, -1)]).toEqual([2, 1, 0])
    })
    it('handles degenerate cases', () => {
      expect([...seq(0, 0)]).toEqual([])
    })
  })

  describe('autobind', () => {
    it('binds method names to supplied this', () => {
      const a = {
        value: 1,
        foo () {
          return this.value
        }
      }
      autobind(['foo'], a)
      const foo = a.foo
      expect(foo()).toEqual(1)
    })
  })
})
