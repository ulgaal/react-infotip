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
  toProps,
  fromProps,
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
    })
    it('merges three configs', () => {
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
          },
          {
            a: {
              c: 3
            },
            e: 5
          }
        )
      ).toEqual({
        a: {
          b: 2,
          c: 3,
          d: 4
        },
        e: 5
      })
    })
    it('accepts null', () => {
      expect(mergeObjects(null)).toEqual(null)
    })
    it('accepts undefined', () => {
      const o1 = { a: { b: 2 }, c: 3 }
      expect(mergeObjects(o1, undefined)).toEqual(o1)
    })
    it('does nothing for null configs null', () => {
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

  describe('toProps', () => {
    it('serializes objects', () => {
      expect(toProps({ a: 2 })).toEqual({ a: 2 })
    })

    it('serializes deep objects', () => {
      expect(
        toProps({
          a: {
            b: 1,
            c: {
              d: 2
            }
          },
          e: 3
        })
      ).toEqual({
        'a.b': 1,
        'a.c.d': 2,
        e: 3
      })
    })

    it('serializes empty objects', () => {
      expect(toProps({})).toEqual({ '': {} })
    })

    it('serializes empty object properties', () => {
      expect(toProps({ a: {} })).toEqual({ a: {} })
    })

    it('serializes empty array properties', () => {
      expect(toProps({ a: [] })).toEqual({ a: [] })
    })

    it('does not deep-serialize DOM element properties', () => {
      const element = document.createElement('div')
      expect(toProps({ a: element })).toEqual({ a: element })
    })

    it('serializes null object properties', () => {
      expect(toProps({ a: null })).toEqual({ a: null })
    })

    it('serializes undefined object properties', () => {
      expect(toProps({ a: undefined })).toEqual({ a: undefined })
    })

    it('serializes arrays', () => {
      expect(toProps(['a', 2, 3])).toEqual({
        '[0]': 'a',
        '[1]': 2,
        '[2]': 3
      })
    })

    it('serializes nested arrays', () => {
      expect(toProps(['a', [1, [2, 'b', 3]], 4, 'c'])).toEqual({
        '[0]': 'a',
        '[1][0]': 1,
        '[1][1][0]': 2,
        '[1][1][1]': 'b',
        '[1][1][2]': 3,
        '[2]': 4,
        '[3]': 'c'
      })
    })

    it('serializes empty arrays', () => {
      expect(toProps([])).toEqual({ '': [] })
    })

    it('serializes arrays with null references', () => {
      expect(toProps([null, 'a'])).toEqual({
        '[0]': null,
        '[1]': 'a'
      })
    })

    it('serializes arrays with undefined references', () => {
      expect(toProps([undefined, 'a'])).toEqual({
        '[0]': undefined,
        '[1]': 'a'
      })
    })

    it('serializes mix of object and arrays', () => {
      expect(
        toProps({
          a: '1',
          b: undefined,
          c: [],
          d: {},
          e: [
            'f',
            ['g'],
            undefined,
            [],
            null,
            {
              h: 2,
              i: 3
            }
          ],
          j: null
        })
      ).toEqual({
        a: '1',
        b: undefined,
        c: [],
        d: {},
        'e[0]': 'f',
        'e[1][0]': 'g',
        'e[2]': undefined,
        'e[3]': [],
        'e[4]': null,
        'e[5].h': 2,
        'e[5].i': 3,
        j: null
      })
    })
  })

  describe('fromProps', () => {
    it('deserializes objects', () => {
      expect(fromProps({ a: 2 })).toEqual({ a: 2 })
    })

    it('deserializes deep objects', () => {
      expect(
        fromProps({
          'a.b': 1,
          'a.c.d': 2,
          e: 3
        })
      ).toEqual({
        a: {
          b: 1,
          c: {
            d: 2
          }
        },
        e: 3
      })
    })

    it('deserializes empty objects', () => {
      expect(fromProps({ '': {} })).toEqual({})
    })

    it('deserializes empty object properties', () => {
      expect(fromProps({ a: {} })).toEqual({ a: {} })
    })

    it('deserializes empty array properties', () => {
      expect(fromProps({ a: [] })).toEqual({ a: [] })
    })

    it('deserializes null object properties', () => {
      expect(fromProps({ a: null })).toEqual({ a: null })
    })

    it('deserializes undefined object properties', () => {
      expect(fromProps({ a: undefined })).toEqual({ a: undefined })
    })

    it('deserializes arrays', () => {
      expect(
        fromProps({
          '[0]': 'a',
          '[1]': 2,
          '[2]': 3
        })
      ).toEqual(['a', 2, 3])
    })

    it('deserializes nested arrays', () => {
      expect(
        fromProps({
          '[0]': 'a',
          '[1][0]': 1,
          '[1][1][0]': 2,
          '[1][1][1]': 'b',
          '[1][1][2]': 3,
          '[2]': 4,
          '[3]': 'c'
        })
      ).toEqual(['a', [1, [2, 'b', 3]], 4, 'c'])
    })

    it('deserializes empty arrays', () => {
      expect(fromProps({ '': [] })).toEqual([])
    })

    it('deserializes arrays with null references', () => {
      expect(
        fromProps({
          '[0]': null,
          '[1]': 'a'
        })
      ).toEqual([null, 'a'])
    })

    it('deserializes arrays with undefined references', () => {
      expect(
        fromProps({
          '[0]': undefined,
          '[1]': 'a'
        })
      ).toEqual([undefined, 'a'])
    })

    it('deserializes mix of object and arrays', () => {
      expect(
        fromProps({
          a: '1',
          b: undefined,
          c: [],
          d: {},
          'e[0]': 'f',
          'e[1][0]': 'g',
          'e[2]': undefined,
          'e[3]': [],
          'e[4]': null,
          'e[5].h': 2,
          'e[5].i': 3,
          j: null
        })
      ).toEqual({
        a: '1',
        b: undefined,
        c: [],
        d: {},
        e: [
          'f',
          ['g'],
          undefined,
          [],
          null,
          {
            h: 2,
            i: 3
          }
        ],
        j: null
      })
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
