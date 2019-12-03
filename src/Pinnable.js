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
// Pinnable
// ========
import React from 'react'
import Balloon from './Balloon'
import PropTypes from 'prop-types'

/**
 * A `Pinnable` component adds an inner decorator between
 * the wrapper component and the content component. This decorator
 * provides the ability to pin down a tip and to drag it around.
 */
const Pinnable = ({
  pinned,
  wrapper: Wrapper = Balloon,
  onToggle,
  onMouseDown,
  children,
  ...rest
}) => (
  <Wrapper {...rest}>
    <div className='pinnable' onMouseDown={onMouseDown}>
      <Pin pinned={pinned} onClick={onToggle} />
      {children}
    </div>
  </Wrapper>
)

Pinnable.propTypes = {
  /**
   * `true` to display an pinned push-pin, `false` otherwise
   */
  pinned: PropTypes.bool,
  /**
   * The wrapper component type to use
   */
  wrapper: PropTypes.elementType,
  /**
   * A callback function to invoke when the push-pin is clicked (used to toggle the `pinned` property)
   */
  onToggle: PropTypes.func,
  /**
   * A callback function to invoke the component is clicked (used to implement tip dragging)
   */
  onMouseDown: PropTypes.func
}
export default Pinnable

/**
 * `Pin` is an internal component to draw an SVG pin symbol
 */
const Pin = ({ pinned, onClick }) => (
  <svg
    width='12px'
    height='12px'
    viewBox='-1000 -850 1000 1000'
    xmlns='http://www.w3.org/2000/svg'
    onClick={onClick}
  >
    <g transform='scale(-1,-1)'>
      {pinned ? (
        <path
          d='M966 450q0 -34 -18 -52l-36 -36q-18 -18 -52 -18q-28 0 -65 14l-138 -138q13 -45 13 -90t-14 -84t-44 -69l-28 -28q-22 -22 -62 -22q-41 0 -93 22t-108 63l58 57q45 -32 84 -47t62 -15q0 21 -10.5 49.5t-29 60.5t-44 65.5t-55.5 63.5q-36 36 -71.5 62t-67 43t-57.5 25.5
      t-43 8.5q0 -30 28 -87.5t85 -121.5l48 49q12 12 29 12t28.5 -11.5t11.5 -28.5t-12 -29l-283 -282q-12 -12 -28 -12q-17 0 -28.5 11.5t-11.5 28.5q0 16 12 28l176 178q-64 71 -99.5 140.5t-35.5 121.5q0 40 22 62l28 28q30 30 69 44.5t84 14.5q42 0 90 -14l138 138
      q-14 37 -14 66q0 33 18 51l36 36q18 18 52 18q35 0 77 -18t83.5 -48t80.5 -69t69 -80.5t48 -83.5t18 -77zM726 671q-32 24 -60 39l-226 -226q15 -8 30.5 -18t29.5 -21z'
        />
      ) : (
        <path
          d='M117 472q21 21 47.5 34.5t56.5 19.5l445 -445q-6 -30 -19.5 -56.5t-34.5 -47.5l-28 -28q-22 -22 -62 -22q-41 0 -93 22t-108 63l58 57q45 -32 84 -47t62 -15q0 21 -10.5 49.5t-29 60.5t-44 65.5t-55.5 63.5q-36 36 -71.5 62t-67 43t-57.5 25.5t-43 8.5q0 -30 28 -87.5
      t85 -121.5l48 49q12 12 29 12t28.5 -11.5t11.5 -28.5t-12 -29l-283 -282q-12 -12 -28 -12q-17 0 -28.5 11.5t-11.5 28.5q0 16 12 28l176 178q-64 71 -99.5 140.5t-35.5 121.5q0 40 22 62zM698 261l255 -255l-57 -57l-784 784l58 57l231 -232l97 97q-14 37 -14 66q0 33 18 51
      l36 36q18 18 52 18q35 0 77 -18t83.5 -48t80.5 -69t69 -80.5t48 -83.5t18 -77q0 -34 -18 -52l-36 -36q-18 -18 -52 -18q-28 0 -65 14zM458 502l49 -50l219 219q-32 24 -60 39z'
        />
      )}
    </g>
  </svg>
)
