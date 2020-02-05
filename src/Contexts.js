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
// Contexts
// ========
import React from 'react'
import Balloon from './Balloon'

// The default value of the `config` property used by `Source` and  `Storage`
export const defaultConfig = {
  position: {
    my: 'top-left',
    at: 'bottom-right',
    target: false,
    adjust: {
      mouse: false,
      x: 0,
      y: 0,
      method: 'none'
    },
    container: null
  },
  show: {
    delay: 0
  },
  hide: {
    delay: 0
  },
  wrapper: Balloon,
  wrapperProps: {}
}

// The library uses the `ConfigContext` to define configuration
// globally for a whole range of `Source` elements.
export const ConfigContext = React.createContext(defaultConfig)

// This context is used internally for communication between
// `Storage` and its `Source` elements.
export const StorageContext = React.createContext(null)
