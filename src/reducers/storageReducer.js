import isEqual from 'lodash.isequal'
import { getElement, eqSet, diffSet, LOGS } from '../utils'

import {
  sourceInit,
  sourceReducer,
  MOUSE_OVER,
  MOUSE_OUT,
  MOUSE_MOVE,
  GEOMETRY,
  VISIBILITY,
  PIN
} from './sourceReducer'

export const UPDATE_PINNED = 'UPDATE_PINNED'
export const MOVE = 'MOVE'

const updateSource = (sources, id, source) => {
  if (isEqual(sources[id], source)) {
    return sources
  }
  return { ...sources, [id]: source }
}

const toStoredTips = (sources, storedTips) => {
  const newStoredTips = Object.values(sources)
    .filter(({ pinned }) => pinned)
    .map(({ id, my, location, config }) => ({
      id,
      my,
      location,
      config
    }))
  return isEqual(newStoredTips, storedTips) ? null : newStoredTips
}

export const storageInit = props => {
  const { storedTips, onTipChange } = props
  return {
    storedTips,
    onTipChange,
    sources: {}
  }
}

export const storageReducer = (state, action) => {
  if (LOGS.storage > 1) {
    console.log('storageReducer', {
      type: action.type,
      id: action.id,
      state,
      action
    })
  }
  const { type } = action
  const { sources, onTipChange } = state
  switch (type) {
    case UPDATE_PINNED: {
      const { storedTips, prevStoredTips } = action
      const ids = new Set(storedTips.map(({ id }) => id))
      const prevIds = new Set((prevStoredTips || []).map(({ id }) => id))
      if (!eqSet(ids, prevIds)) {
        const newSources = { ...sources }
        // Create sources for pinned tips if needed
        for (const id of diffSet(ids, prevIds)) {
          const storedTip = storedTips.find(tip => tip.id === id)
          if (!sources[id]) {
            newSources[id] = {
              ...sourceInit({
                ...storedTip
              }),
              pinned: true,
              visible: true,
              containerElt: getElement(storedTip.config.position.container)
            }
          }
        }
        return { ...state, sources: newSources }
      }
      return state
    }
    case MOVE: {
      const { id, delta, notify = false } = action
      const source = sources[id]
      const newSource = {
        ...source,
        location: {
          left: source.location.left + delta.x,
          top: source.location.top + delta.y
        }
      }
      const newSources = updateSource(sources, id, newSource)
      const storedTips =
        notify && source.pinned
          ? toStoredTips(newSources, state.storedTips)
          : null
      if (storedTips && typeof onTipChange === 'function') {
        onTipChange(storedTips)
      }
      return storedTips || sources !== newSources
        ? {
            ...state,
            sources: newSources,
            ...(storedTips ? { storedTips } : {})
          }
        : state
    }
    case PIN: {
      const { id } = action
      const source = sources[id]
      const newSources = updateSource(
        sources,
        id,
        sourceReducer(source, { ...action, pinned: !source.pinned })
      )
      const storedTips = toStoredTips(newSources, state.storedTips)
      if (storedTips && typeof onTipChange === 'function') {
        onTipChange(storedTips)
      }
      return storedTips || sources !== newSources
        ? {
            ...state,
            sources: newSources,
            ...(storedTips ? { storedTips } : {})
          }
        : state
    }
    case MOUSE_OVER: {
      const { id, config } = action
      const source = sources[id] || sourceInit({ id, config })
      const newSources = updateSource(
        sources,
        id,
        sourceReducer(source, action)
      )
      return sources === newSources ? state : { ...state, sources: newSources }
    }
    case VISIBILITY: {
      const { id, visible } = action
      const source = sources[id]
      if (!source || source.pinned) {
        return state
      }
      const newSources = updateSource(
        sources,
        id,
        sourceReducer(source, action)
      )
      const newSource = newSources[id]
      if (!visible && newSource) {
        const { showTimeoutId, hideTimeoutId } = newSource
        if (!showTimeoutId && !hideTimeoutId) {
          delete newSources[id]
        }
      }
      return { ...state, sources: newSources }
    }
    case GEOMETRY:
    case MOUSE_OUT: {
      const { id } = action
      const source = sources[id]
      if (source.pinned) {
        return state
      }
      const newSources = updateSource(
        sources,
        id,
        sourceReducer(source, action)
      )
      return sources === newSources ? state : { ...state, sources: newSources }
    }
    case MOUSE_MOVE: {
      const { id } = action
      const source = sources[id]
      if (!source.config.position.adjust.mouse || source.pinned) {
        return state
      }
      const newSources = updateSource(
        sources,
        id,
        sourceReducer(source, action)
      )
      return sources === newSources ? state : { ...state, sources: newSources }
    }

    default:
      throw new Error(`Unknown action: ${type}`)
  }
}
