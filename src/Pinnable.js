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
import Pin from './svg/Pin'
import PropTypes from 'prop-types'
import { log } from './utils'

/**
 * A `Pinnable` component adds an inner decorator between
 * the wrapper component and the content component. This decorator
 * provides the ability to pin down a tip and to drag it around.
 */
const Pinnable = props => {
  log('Pinnable', 0, props)
  const {
    pinned,
    wrapper: Wrapper = Balloon,
    onPin,
    onPointerDown,
    children,
    ...rest
  } = props
  const { className } = props
  return (
    <Wrapper pinned={pinned} {...rest}>
      <div className='pinnable' onPointerDown={onPointerDown}>
        <Pin className={className} pinned={pinned} onPointerDown={onPin} />
        {children}
      </div>
    </Wrapper>
  )
}

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
  onPin: PropTypes.func,
  /**
   * A callback function to invoke the component is clicked (used to implement tip dragging)
   */
  onPointerDown: PropTypes.func
}
export default Pinnable
