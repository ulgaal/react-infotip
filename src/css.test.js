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
/* global describe, it, expect */

import { parseBorder, parseBoxShadow, parseBorderRadius } from './css'
describe('css', () => {
  describe('parseBorder', () => {
    ;[
      {
        expr: ' 1px solid black',
        value: {
          width: 1,
          style: 'solid',
          color: 'black'
        }
      },
      {
        expr: 'none',
        value: {
          width: undefined,
          style: 'none',
          color: undefined
        }
      },
      {
        expr: 'dotted red',
        value: {
          width: undefined,
          style: 'dotted',
          color: 'red'
        }
      },
      {
        expr: ' 20px dotted #abcdef  ',
        value: {
          width: 20,
          style: 'dotted',
          color: '#abcdef'
        }
      }
    ].map(({ expr, value }) => {
      it(`parses ${expr}`, () => {
        expect(parseBorder(expr)).toStrictEqual(value)
      })
    })
  })
  describe('parseBoxShadow', () => {
    ;[
      {
        expr: '3px 3px #ddd ',
        value: {
          dx: 3,
          dy: 3,
          color: '#ddd'
        }
      }
    ].map(({ expr, value }) => {
      it(`parses ${expr}`, () => {
        expect(parseBoxShadow(expr)).toStrictEqual(value)
      })
    })
  })
  describe('parseBorderRadius', () => {
    ;[
      {
        expr: '3px ',
        value: {
          top: 3,
          right: 3,
          bottom: 3,
          left: 3
        }
      },
      {
        expr: '0px ',
        value: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      },
      {
        expr: ' 3px 2px',
        value: {
          top: 2,
          right: 3,
          bottom: 2,
          left: 3
        }
      },
      {
        expr: ' 3px 2px 4px 1px',
        value: {
          top: 3,
          right: 2,
          bottom: 4,
          left: 1
        }
      }
    ].map(({ expr, value }) => {
      it(`parses ${expr}`, () => {
        expect(parseBorderRadius(expr)).toStrictEqual(value)
      })
    })
  })
})
