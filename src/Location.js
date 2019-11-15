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
// Location
// ========
import React from 'react'
import PropTypes from 'prop-types'
import { LocationType } from './prop-types'

/**
 * `Location` is an internal component used to
 * position a tooltip with respect to its target. It uses
 * absolute positioning and a CSS `translate()` transform.
 */
const Location = props => {
  const {
    location: { left, top },
    children,
    onMouseDown,
    onMouseOver,
    onMouseOut
  } = props
  return (
    <span
      onMouseDown={onMouseDown}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      className='rit-location'
      style={{
        position: 'absolute',
        display: 'inline-block',
        zIndex: 100,
        transform: `translate(${left}px, ${top}px)`,
        left: 0,
        top: 0
      }}
    >
      {children}
    </span>
  )
}

Location.propTypes = {
  location: LocationType,
  onMouseDown: PropTypes.func
}

export default Location
