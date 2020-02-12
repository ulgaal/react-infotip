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
// index.js
// ========
import Source from './Source'
import { ConfigContext, defaultConfig } from './Contexts'
import MergingConfigProvider from './MergingConfigProvider'
import Location from './Location'
import Storage from './Storage'
import Balloon from './Balloon'
import Pinnable from './Pinnable'
import Cloud from './Cloud'
import { mergeObjects, seq, LOGS } from './utils'
import { positions } from './prop-types'
import { styles } from './styles'

// Define exported library constructs
export {
  Source,
  ConfigContext,
  MergingConfigProvider,
  styles,
  defaultConfig,
  Location,
  Storage,
  Balloon,
  Pinnable,
  Cloud,
  mergeObjects,
  seq,
  positions,
  LOGS
}
