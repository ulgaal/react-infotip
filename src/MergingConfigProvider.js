import React, { useContext, useMemo } from 'react'
import { mergeObjects } from './utils'
import { ConfigContext } from './Contexts'
import isEqual from 'lodash.isequal'

// To avoid redefining the value of the `config` property, use
// this component instead of a `<ConfigContext.Provider>`. The
// component will merge the value of its englobing context with
// the supplied value.
export const MergingConfigProvider = props => {
  // console.log('MergingConfigProvider', props)
  const { value, children } = props
  const contextConfig = useContext(ConfigContext)
  const config = useMemo(() => {
    const newConfig = mergeObjects(contextConfig, value)
    return isEqual(config, newConfig) ? config : newConfig
  }, [contextConfig, value])
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  )
}

export default MergingConfigProvider
