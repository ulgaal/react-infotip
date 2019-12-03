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
// prop-types.js
// =============
import PropTypes from 'prop-types'

export const LocationType = PropTypes.shape({
  left: PropTypes.number,
  top: PropTypes.number
})

export const positions = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right'
]

export const CornerType = PropTypes.oneOf(positions)

const NoneType = PropTypes.oneOf(['none'])

export const SourceConfig = PropTypes.shape({
  position: PropTypes.shape({
    my: PropTypes.oneOf(positions),
    at: PropTypes.oneOf(positions),
    target: PropTypes.oneOfType([
      PropTypes.string /* 'mouse' or a CSS selector */,
      PropTypes.bool,
      PropTypes.arrayOf(PropTypes.number)
    ]),
    adjust: PropTypes.shape({
      mouse: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
      x: PropTypes.number,
      y: PropTypes.number,
      method: PropTypes.oneOfType([NoneType, PropTypes.object])
    }),
    container: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
  }),
  show: PropTypes.shape({
    delay: PropTypes.number,
    onShow: PropTypes.func
  }),
  hide: PropTypes.shape({
    delay: PropTypes.number,
    onShow: PropTypes.func
  }),
  wrapper: PropTypes.func,
  wrapperProps: PropTypes.object
})

export const StorageTip = PropTypes.shape({
  id: PropTypes.string,
  my: CornerType,
  location: LocationType,
  config: SourceConfig
})
