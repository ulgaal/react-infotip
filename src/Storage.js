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
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Location from './Location'
import Engine from './Engine'
import { StorageTip } from './prop-types'
import PropTypes from 'prop-types'
import { autobind, eqSet, diffSet, getElement } from './utils'
import { ConfigContext, StorageContext } from './Contexts'
import { mergeObjects } from '.'

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
export default class Storage extends Component {
  constructor (props) {
    super(props)
    autobind(['handleToggle', 'handleMouseDown'], this)
    // `engines` is a hash of `Source` `id` to `Engine` references.
    // An `Engine` reference has the form { refCount: <number>, value: <Engine> }.
    // A `Source` in the React subtree or a pinned tip increase the refCount
    // of the `Engine` reference. If it reaches 0, the reference is purged.
    this.engines = {}

    // A `Storage` keeps track of one state variable:
    // a hash of `Source` `id` to tip state. Each tip state consists in four fields:
    // * `pinned`: true if the tip is currently pinned
    // * `my`: the position which provides optimal placement of the tip as computed by its `Engine`.
    // * `location`: the actual coordinates of the tip.
    // * `visible`: whether the tip is currently visible.
    this.state = {
      tips: {}
    }
  }

  // Create a new `Engine` which will be shared by `Storage` and `Source`
  getEngine ({ id, config }) {
    const ref = this.engines[id]
    if (ref) {
      ref.refCount++
      return ref.value
    }
    const engine = new Engine({
      id,
      config,
      output: this
    })
    this.engines[id] = {
      refCount: 1,
      value: engine
    }
    return engine
  }

  release (id) {
    const ref = this.engines[id]
    if (!ref) {
      throw new Error(`Invalid release ${id}`)
    }
    ref.refCount--
    if (ref.refCount === 0) {
      delete this.engines[id]
    }
  }

  deref (id) {
    return this.engines[id].value
  }

  // `updateEngines` is invoked when the `tips` state variable
  // changes (for instance when a persistent tip needs to be
  // displayed but its `Source` is not attached to the subtree yet).
  updateEngines (tips, prevTips) {
    const ids = new Set(tips.map(({ id }) => id))
    const prevIds = new Set(prevTips.map(({ id }) => id))
    if (!eqSet(ids, prevIds)) {
      // Create engines for new ids
      for (const id of diffSet(ids, prevIds)) {
        const tip = tips.find(tip => tip.id === id)
        const config = mergeObjects(this.context, tip.config)
        this.getEngine({ id, config })
      }
    }
  }

  componentDidMount () {
    const { tips } = this.props
    this.updateEngines(this.props.tips, [])
    this.setState({
      tips: (tips || []).reduce((tips, { id, my, location }) => {
        tips[id] = {
          visible: true,
          pinned: true,
          my,
          location
        }
        this.deref(id).pinned = true
        return tips
      }, {})
    })
  }

  componentDidUpdate (prevProps) {
    this.updateEngines(this.props.tips, prevProps.tips)
  }

  // This method is invoked by `Engine` when the tip location changes.
  onLayoutChange ({ id, my, location, config }) {
    const { pinned } = this.getTip(id)
    if (!pinned) {
      this.updateTip(id, { my, location, config })
    }
  }

  // This method is invoked by `Engine` when the tip visibility changes.
  onVisibilityChange ({ id, visible, config }) {
    const tips = { ...this.state.tips }
    if (visible) {
      tips[id] = {
        my: 'top-left',
        location: {
          left: 0,
          top: 0
        },
        visible,
        config
      }
      this.getEngine({ id, config })
    } else {
      delete tips[id]
      this.release(id)
    }
    this.setState({ tips })
  }

  getTip (id) {
    return this.state.tips[id]
  }

  // This is method updates the state fields (`pinned`, `my`, `location` or `visible`)
  // of a tip identified by its `id`.
  updateTip (id, state) {
    const tips = this.state.tips
    const nextTips = {
      ...tips,
      [id]: {
        ...tips[id],
        ...state
      }
    }
    this.setState({
      tips: nextTips
    })
    return nextTips
  }

  // This method invokes the handler specified in the `onTipChange` property
  // when the list of persistent tips changes.
  dispatchTipChange (tips) {
    const { onTipChange } = this.props
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

  // The `handleToggle` and `handleMouseDown` methods are invoked when
  // the push pin of the `Pinnable` wrapper is clicked or the `Pinnable`
  // is dragged
  handleToggle (id, event) {
    event.preventDefault()
    event.stopPropagation()
    const tip = this.getTip(id)
    this.deref(id).pin(!tip.pinned)
    this.dispatchTipChange(this.updateTip(id, { pinned: !tip.pinned }))
  }

  handleMouseDown (id, event) {
    const p0 = { x: event.clientX, y: event.clientY }
    event.stopPropagation()
    event.preventDefault()
    const handlers = {}
    const updatePosition = event => {
      event.stopPropagation()
      event.preventDefault()
      const {
        location: { left, top }
      } = this.getTip(id)
      const tips = this.updateTip(id, {
        location: {
          left: left + event.clientX - p0.x,
          top: top + event.clientY - p0.y
        }
      })
      p0.x = event.clientX
      p0.y = event.clientY
      return tips
    }
    // Position mouse handlers to create a modal drag loop
    handlers.handleMouseMove = updatePosition
    handlers.handleMouseUp = event => {
      window.removeEventListener('mousemove', handlers.handleMouseMove, true)
      window.removeEventListener('mouseup', handlers.handleMouseUp, true)
      updatePosition(event)
      this.dispatchTipChange(updatePosition(event))
    }
    window.addEventListener('mousemove', handlers.handleMouseMove, true)
    window.addEventListener('mouseup', handlers.handleMouseUp, true)
  }

  render () {
    const { children, tip } = this.props
    const { tips } = this.state
    return (
      // Configure `Source`s in the React subtree so that
      // they have a `storage` property pointing to the `Storage`.
      <div style={{ display: 'contents' }}>
        <StorageContext.Provider value={this}>
          {
            // Render the React subtree
            children
          }
        </StorageContext.Provider>
        {Object.entries(tips)
          .filter(([, { visible }]) => visible)
          .map(([id, value]) => {
            const { my, location, pinned, config: sourceConfig } = value
            const config = mergeObjects(this.context, sourceConfig)
            const { wrapper, wrapperProps, position } = config
            const container = getElement(position.container)

            // Retrieve the tip for the specified id.
            const tipContent = tip(id, pinned)
            if (tipContent) {
              // Retrieve the `Engine` for the specified id.
              // `Engine` will handle mouseover and mouseout events as well as
              // changes to the tip geometry, whereas `Storage` will handle
              // mousedown and push pin click events
              const engine = this.deref(id)
              const tip = React.createElement(wrapper, {
                ...wrapperProps,
                my,
                pinned,
                onGeometryChange: geometry => engine.update({ geometry }),
                onToggle: event => this.handleToggle(id, event),
                onMouseDown: event => this.handleMouseDown(id, event),
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
}
Storage.contextType = ConfigContext

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
