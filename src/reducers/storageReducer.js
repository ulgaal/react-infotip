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

export const UPDATE_SOURCE = 'UPDATE_SOURCE'
export const UPDATE_PINNED = 'UPDATE_PINNED'
export const RELEASE = 'RELEASE'
export const MOVE = 'MOVE'

const updateSource = (sources, id, source) => {
  if (isEqual(sources[id].source, source)) {
    return sources
  }
  return { ...sources, [id]: { ...sources[id], source } }
}

const toStoredTips = (sources, storedTips) => {
  const newStoredTips = Object.values(sources)
    .filter(({ source: { pinned } }) => pinned)
    .map(({ source: { id, my, location, config } }) => ({
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
        // Increase refcount for newly pinned tips
        for (const id of diffSet(ids, prevIds)) {
          const storedTip = storedTips.find(tip => tip.id === id)
          const newEntry = newSources[id]
            ? { ...newSources[id] }
            : {
                refCount: 0,
                source: sourceInit({
                  ...storedTip
                })
              }
          newEntry.source = {
            ...storedTip,
            pinned: true,
            visible: true,
            containerElt: getElement(storedTip.config.position.container)
          }
          newEntry.refCount++
          newSources[id] = newEntry
        }
        // Decrease refcount for newly unpinned tips
        for (const id of diffSet(prevIds, ids)) {
          const newEntry = { ...newSources[id] }
          newEntry.refCount--
          if (newEntry.refCount > 0) {
            newSources[id] = newEntry
          } else {
            delete newSources[id]
          }
        }
        return { ...state, sources: newSources }
      }
      return state
    }
    case UPDATE_SOURCE: {
      const { id, prevId, config, pinned } = action
      const newSources = { ...sources }
      if (prevId) {
        const newEntry = { ...sources[prevId] }
        newEntry.refCount--
        if (newEntry.refCount > 0) {
          newSources[prevId] = newEntry
        } else {
          delete newSources[prevId]
        }
      }
      if (id) {
        const entry = sources[id]
        const newEntry = entry
          ? { ...entry, refCount: entry.refCount + 1 }
          : { source: sourceInit({ id, config, pinned }), refCount: 1 }
        newSources[id] = newEntry
      }
      return { ...state, sources: newSources }
    }
    case RELEASE: {
      const { id } = action
      const newSources = { ...sources }
      const entry = newSources[id]
      if (!entry) {
        if (LOGS.storage > 2) {
          console.log('storageReducer.RELEASE missing id', id)
        }
        return state
      }
      if (entry.refCount === 1) {
        delete newSources[id]
      } else {
        newSources[id] = {
          ...entry,
          refCount: entry.refCount - 1
        }
      }
      return { ...state, sources: newSources }
    }
    case MOVE: {
      const { id, delta, notify = false } = action
      const source = sources[id].source
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
      const source = sources[id].source
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
    case GEOMETRY:
    case VISIBILITY:
    case MOUSE_OVER:
    case MOUSE_OUT: {
      const { id } = action
      const source = sources[id].source
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
      const source = sources[id].source
      if (!source.config.position.adjust.mouse) {
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
