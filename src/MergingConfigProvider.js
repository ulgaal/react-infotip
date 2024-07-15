import React, { useContext, useRef, useMemo, useEffect } from 'react'
import { mergeObjects, log } from './utils'
import { ConfigContext } from './Contexts'
import { isEqual } from 'lodash-es'

// To avoid redefining the value of the `config` property, use
// this component instead of a `<ConfigContext.Provider>`. The
// component will merge the value of its englobing context with
// the supplied value.
export const MergingConfigProvider = props => {
  log('MergingConfigProvider', 0, props)
  const { value, children } = props
  const contextConfig = useContext(ConfigContext)
  const prevConfigRef = useRef()
  // Keep config as stable as possible
  const config = useMemo(() => {
    const prevConfig = prevConfigRef.current
    const nextConfig = mergeObjects(contextConfig, value)
    return isEqual(prevConfig, nextConfig) ? prevConfig : nextConfig
  }, [contextConfig, value])
  useEffect(() => {
    prevConfigRef.current = config
  })
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  )
}

export default MergingConfigProvider
