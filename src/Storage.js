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
// Storage
// =======
import React, {
  useReducer,
  useRef,
  useCallback,
  useEffect,
  useMemo
} from 'react'
import ReactDOM from 'react-dom'
import Location from './Location'
import Engine, { LAYOUT, VISIBILITY } from './Engine'
import { StorageTip } from './prop-types'
import PropTypes from 'prop-types'
import { eqSet, diffSet, getElement } from './utils'
import { StorageContext } from './Contexts'

const INIT = 'INIT'
const TOGGLE = 'TOGGLE'
const MOVE = 'MOVE'

const storageReducer = (state, action) => {
  console.log('storageReducer', { state, action })
  const { storage, onTipChange } = state
  const doNotify = tips => {
    if (typeof onTipChange === 'function') {
      onTipChange(
        Object.entries(tips)
          .filter(([, { pinned }]) => pinned)
          .map(([id, { my, location, config }]) => ({
            id,
            my,
            location,
            config
          }))
      )
    }
  }

  const { type } = action
  switch (type) {
    case INIT: {
      const { storedTips } = action
      const tips = (storedTips || []).reduce((tips, tip) => {
        const { id, ...rest } = tip
        tips[id] = {
          id,
          ...rest,
          visible: true,
          pinned: true
        }

        storage.deref(id).pinned = true
        return tips
      }, {})
      return { ...state, tips }
    }
    // This action is invoked by `Engine` when the tip location changes.
    case LAYOUT: {
      const { id, my, location, config } = action
      const tip = state.tips[id]
      if (!tip.pinned) {
        return {
          ...state,
          tips: {
            ...state.tips,
            [id]: { ...tip, my, location, config }
          }
        }
      }
      return state
    }
    // This action is invoked by `Engine` when the tip visibility changes.
    case VISIBILITY: {
      const { id, visible, config } = action
      const newTips = { ...state.tips }
      if (visible) {
        newTips[id] = {
          my: 'top-left',
          location: {
            left: 0,
            top: 0
          },
          visible,
          config
        }
        storage.getEngine({ id, config })
      } else {
        delete newTips[id]
        storage.release(id)
      }
      return {
        ...state,
        tips: newTips
      }
    }

    // This action is invoked when the push pin of the `Pinnable` wrapper is clicked
    case TOGGLE: {
      const { id } = action
      const tip = state.tips[id]
      storage.deref(id).pin(!tip.pinned)
      const tips = {
        ...state.tips,
        [id]: { ...tip, pinned: !tip.pinned }
      }
      doNotify(tips)
      return { ...state, tips }
    }

    // This action is invoked when the `Pinnable` wrapper is dragged
    case MOVE: {
      const { id, delta, notify = false } = action
      const tip = state.tips[id]
      const tips = {
        ...state.tips,
        [id]: {
          ...tip,
          location: {
            left: tip.location.left + delta.x,
            top: tip.location.top + delta.y
          }
        }
      }
      if (notify) {
        doNotify(tips)
      }
      return { ...state, tips }
    }

    default:
      throw new Error(`Unknown action: ${type}`)
  }
}

/**
 * The `Storage` component is in charge of persisting tips for all the
 * `Source`s of the React subtree of which it is the root.
 * A `Storage` invokes the handler specified in the `onTipChange` property
 *  when its list of persistent tips changes.
 * Using `Storage` usually implies that:
 * * a `Pinnable` wrapper component is used for the tips, so that
 * the user can pin them down them and drag them around.
 * * `Source`s do not provide their tips as usual using the `tip` config key.
 * Instead they provide an `id` key to uniquely identify themselves.
 * * the `tip` config key of `Storage` provides all the tips
 * for the subtree. It must be defined as a function which receives as
 * input a `Source` `id` and outputs the corresponding tip.
 */

const Storage = props => {
  // console.log('Storage', props)
  const { children, tip, tips: storedTips, onTipChange } = props

  // `engines` is a hash of `Source` `id` to `Engine` references.
  // An `Engine` reference has the form { refCount: <number>, value: <Engine> }.
  // A `Source` in the React subtree or a pinned tip increase the refCount
  // of the `Engine` reference. If it reaches 0, the reference is purged.
  const enginesRef = useRef({})

  const storage = useMemo(() => {
    const engines = enginesRef.current
    return {
      getEngine: ({ id, config }) => {
        if (id == 0) {
          try {
            throw new Error()
          } catch (e) {
            console.log(e.stack)
          }
        }
        // Create a new `Engine` which will be shared by `Storage` and `Source`
        const ref = engines[id]
        if (ref) {
          ref.refCount++
          console.log(`getEngine(${id})`, engines)
          return ref.value
        }
        const engine = new Engine({
          id,
          config,
          dispatch
        })
        engines[id] = {
          refCount: 1,
          value: engine
        }
        console.log(`getEngine(${id})`, engines)
        return engine
      },
      release: id => {
        const engines = enginesRef.current
        const ref = engines[id]
        if (!ref) {
          throw new Error(`Invalid release ${id}`)
        }
        ref.refCount--
        if (ref.refCount === 0) {
          delete engines[id]
        }
        console.log(`release(${id})`, engines)
      },
      deref: id => {
        const engines = enginesRef.current
        return engines[id].value
      }
    }
  }, [enginesRef])

  // `updateEngines` is invoked when the `tips` prop
  // changes (for instance when a persistent tip needs to be
  // displayed but its `Source` is not attached to the subtree yet).
  const updateEngines = useCallback((tips, prevTips) => {
    const ids = new Set(tips.map(({ id }) => id))
    const prevIds = new Set(prevTips.map(({ id }) => id))
    if (!eqSet(ids, prevIds)) {
      // Create engines for new ids
      for (const id of diffSet(ids, prevIds)) {
        const { config } = tips.find(tip => tip.id === id)
        storage.getEngine({ id, config })
      }
    }
  }, [])

  // A `Storage` keeps track of one state variable:
  // a hash of `Source` `id` to tip state. Each tip state consists in four fields:
  // * `pinned`: true if the tip is currently pinned
  // * `my`: the position which provides optimal placement of the tip as computed by its `Engine`.
  // * `location`: the actual coordinates of the tip.
  // * `visible`: whether the tip is currently visible.
  const [state, dispatch] = useReducer(storageReducer, null, () => {
    return {
      storage,
      onTipChange,
      tips: {},
      engines: {}
    }
  })
  console.log('Storage', { state, props })

  useEffect(() => {
    // componentDidMount
    dispatch({ type: INIT, storedTips })
  }, [])

  const prevStoredTipsRef = useRef()
  useEffect(() => {
    prevStoredTipsRef.current = storedTips
  })
  const prevStoredTips = prevStoredTipsRef.current
  useEffect(() => {
    updateEngines(storedTips, prevStoredTips || [])
  }, [storedTips])

  const handleToggle = useCallback((id, event) => {
    event.stopPropagation()
    event.preventDefault()
    dispatch({ type: TOGGLE, id })
  }, [])

  const handleMouseDown = useCallback((id, event) => {
    const p0 = { x: event.clientX, y: event.clientY }
    event.stopPropagation()
    event.preventDefault()
    const handlers = {}
    // Position mouse handlers to create a modal drag loop
    handlers.handleMouseMove = event => {
      event.preventDefault()
      event.stopPropagation()
      dispatch({
        type: 'MOVE',
        id,
        delta: { x: event.clientX - p0.x, y: event.clientY - p0.y }
      })
      p0.x = event.clientX
      p0.y = event.clientY
    }
    handlers.handleMouseUp = event => {
      event.preventDefault()
      event.stopPropagation()
      window.removeEventListener('mousemove', handlers.handleMouseMove, true)
      window.removeEventListener('mouseup', handlers.handleMouseUp, true)
      dispatch({
        type: 'MOVE',
        id,
        delta: { x: event.clientX - p0.x, y: event.clientY - p0.y },
        notify: true
      })
    }
    window.addEventListener('mousemove', handlers.handleMouseMove, true)
    window.addEventListener('mouseup', handlers.handleMouseUp, true)
  }, [])

  return (
    // Configure `Source`s in the React subtree so that
    // they have a `storage` property pointing to the `Storage`.
    <div style={{ display: 'contents' }}>
      <StorageContext.Provider value={storage}>
        {
          // Render the React subtree
          children
        }
      </StorageContext.Provider>
      {Object.entries(state.tips)
        .filter(([, { visible }]) => visible)
        .map(([id, value]) => {
          const { my, location, pinned, config } = value
          const { wrapper, wrapperProps, position } = config
          const container = getElement(position.container)

          // Retrieve the tip for the specified id.
          const tipContent = tip(id, pinned)
          if (tipContent) {
            // Retrieve the `Engine` for the specified id.
            // `Engine` will handle mouseover and mouseout events as well as
            // changes to the tip geometry, whereas `Storage` will handle
            // mousedown and push pin click events
            const engine = storage.deref(id)
            const tip = React.createElement(wrapper, {
              ...wrapperProps,
              my,
              pinned,
              onGeometryChange: geometry => engine.update({ geometry }),
              onToggle: event => handleToggle(id, event),
              onMouseDown: event => handleMouseDown(id, event),
              children: [tipContent]
            })
            // A portal is used to attach the tip to another DOM parent (so that it
            // naturally floats above other DOM nodes it the DOM tree). The additional
            // benefit of the portal is that DOM events are still channeled through
            // the `Engine`, which is required not to break timers used to show and hide tip.
            return ReactDOM.createPortal(
              <Location
                key={id}
                location={location}
                onMouseOver={event => engine.handleMouseOver(event)}
                onMouseOut={event => engine.handleMouseOut(event)}
              >
                {tip}
              </Location>,
              container
            )
          }
          return null
        })}
    </div>
  )
}

Storage.propTypes = {
  /**
   * The list of persisted tips. Each entry of the list is an object with
   * the following keys:
   *
   * | Key | Type             | Description                                                |
   * | --- | ---------------- | ---------------------------------------------------------- |
   * | id  | `<string>`       | The id property of the `<Source>` to which the tip belongs |
   * | my  | `<CornerType>`   | The corner of the tip to which the tail attaches           |
   * | location  | `<LocationType>` | The current tip location                                   |
   * | config  | `<ConfigType>` | The tip config (see Source for details on `<ConfigType>`)           |
   *
   * `<LocationType>` is an object, which contains the following keys:
   *
   * | Key  | Type       | Description                                                         |
   * | ---- | ---------- | ------------------------------------------------------------------- |
   * | left | `<number>` | The x coordinate of the tip in the tip-container coordinate system. |
   * | top  | `<number>` | The y coordinate of the tip in the tip-container coordinate system. |
   */
  tips: PropTypes.arrayOf(StorageTip),
  /**
   * A function which receives as input a `Source` `id` and outputs the corresponding React tip
   * element.
   */
  tip: PropTypes.func,
  /**
   * A callback function invoked when the list of persistent tip changes.
   * The function receives an array of
   */
  onTipChange: PropTypes.func
}

export default Storage
