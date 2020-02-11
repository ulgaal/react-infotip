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
import React, { useReducer, useCallback, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import Location from './Location'
import { StorageTip } from './prop-types'
import PropTypes from 'prop-types'
import { StorageContext } from './Contexts'
import { LOGS } from './utils'
import {
  storageInit,
  storageReducer,
  UPDATE_PINNED,
  MOVE
} from './reducers/storageReducer'
import { MOUSE_OVER, MOUSE_OUT, PIN } from './reducers/sourceReducer'

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

  // A `Storage` keeps track of one state variable:
  // a hash of `Source` `id` to refcounted source state.
  const [state, dispatch] = useReducer(
    storageReducer,
    { storedTips, onTipChange },
    storageInit
  )
  if (LOGS.storage > 0) {
    console.log('Storage', props, state)
  }

  // Notify the reducer if the list of persisted tips
  // changes
  const prevStoredTipsRef = useRef()
  useEffect(() => {
    prevStoredTipsRef.current = storedTips
  })
  const prevStoredTips = prevStoredTipsRef.current
  useEffect(() => {
    dispatch({ type: UPDATE_PINNED, storedTips, prevStoredTips })
  }, [storedTips])

  // This callback is passed to sources so that they
  // get access to the dispatch of the storageReducer
  const storage = useCallback(params => {
    return [params, dispatch]
  }, [])

  // Tranform DOM events into reducer actions (events
  // actually come from sources and bubble to the storage):
  // * click events.
  // * mousedown events.
  // * mouseout events.
  // * mouseover events.
  // * mousemove events.

  const handlePin = useCallback(event => {
    const target = event.target.closest('[data-rit-id]')
    if (target) {
      const id = target.dataset.ritId
      event.stopPropagation()
      event.preventDefault()
      dispatch({ type: PIN, id, ref: target })
    }
  }, [])

  const handleMouseDown = useCallback(
    event => {
      const target = event.target.closest('[data-rit-id]')
      if (target) {
        const id = target.dataset.ritId
        const p0 = { x: event.clientX, y: event.clientY }
        event.stopPropagation()
        event.preventDefault()
        const handlers = {}
        // Position mouse handlers to create a modal drag loop
        handlers.handleMouseMove = event => {
          event.preventDefault()
          event.stopPropagation()
          dispatch({
            type: MOVE,
            id,
            delta: { x: event.clientX - p0.x, y: event.clientY - p0.y }
          })
          p0.x = event.clientX
          p0.y = event.clientY
        }
        handlers.handleMouseUp = event => {
          event.preventDefault()
          event.stopPropagation()
          window.removeEventListener(
            'mousemove',
            handlers.handleMouseMove,
            true
          )
          window.removeEventListener('mouseup', handlers.handleMouseUp, true)
          dispatch({
            type: MOVE,
            id,
            delta: { x: event.clientX - p0.x, y: event.clientY - p0.y },
            notify: true
          })
        }
        window.addEventListener('mousemove', handlers.handleMouseMove, true)
        window.addEventListener('mouseup', handlers.handleMouseUp, true)
      }
    },
    [dispatch]
  )

  const handleMouseOut = useCallback(
    event => {
      const target = event.target.closest('[data-rit-id]')
      if (target) {
        const id = target.dataset.ritId
        dispatch({ type: MOUSE_OUT, id, dispatch })
      }
    },
    [dispatch]
  )

  const handleMouseOver = useCallback(
    event => {
      const target = event.target.closest('[data-rit-id]')
      if (target) {
        const id = target.dataset.ritId
        dispatch({
          type: MOUSE_OVER,
          id,
          position: { x: event.clientX, y: event.clientY },
          dispatch,
          ref: target
        })
      }
    },
    [dispatch]
  )

  return (
    // Configure `Source`s in the React subtree so that
    // they have a `storage` property pointing to the `Storage`.
    <div
      style={{ display: 'contents' }}
      onMouseOut={handleMouseOut}
      onMouseOver={handleMouseOver}
    >
      <StorageContext.Provider value={storage}>
        {
          // Render the React subtree (which contains the `Source`s)
          children
        }
      </StorageContext.Provider>
      {Object.values(state.sources)
        .filter(({ source: { visible } }) => visible)
        .map(({ source }) => {
          const {
            id,
            my,
            location = {
              left: 0,
              top: 0
            },
            pinned,
            config,
            containerElt
          } = source
          const { wrapper, wrapperProps } = config

          // Retrieve the tip for the specified id.
          const tipContent = tip(id, pinned)
          if (tipContent) {
            const tip = React.createElement(wrapper, {
              ...wrapperProps,
              my,
              pinned,
              id,
              dispatch,
              onPin: handlePin,
              onMouseDown: handleMouseDown,
              children: [tipContent]
            })
            // A portal is used to attach the tip to another DOM parent (so that it
            // naturally floats above other DOM nodes it the DOM tree). The additional
            // benefit of the portal is that DOM events are still channeled through
            // the reducer, which is required not to break timers used to show and hide tip.
            return ReactDOM.createPortal(
              <Location key={id} location={location}>
                {tip}
              </Location>,
              containerElt
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
