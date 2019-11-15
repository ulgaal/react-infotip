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
import { StorageTip, SourceConfig } from './prop-types'
import PropTypes from 'prop-types'
import { autobind, eqSet, diffSet, getElement, createWrapper } from './utils'
import { ConfigContext, StorageContext } from './Contexts'

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
export class Storage extends Component {
  constructor (props) {
    super(props)
    autobind(['handleToggle', 'handleMouseDown'], this)
    // `engines` is a hash of `Source` `id` to `Engine` for all the `Source`
    // in the React subtree
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

  // `register` and `unregister` are invoked by the `Source`s
  // in the subtree. These methods ensure that the `Source` and
  // the `Storage` use the same engine
  register (id, source) {
    const { config } = this.props
    let engine = this.engines[id]
    if (!engine) {
      engine = this.engines[id] = new Engine({ id, config })
    }
    engine.subscribe(source)
    engine.subscribe(this)
    return engine
  }

  unregister (id, source) {
    const { tips } = this.props
    const engine = this.engines[id]
    if (engine) {
      engine.unsubscribe(source)
      if (tips.findIndex(tip => tip.id === id) === -1) {
        // Source with no persistent tip unmounts
        engine.unsubscribe(this)
        delete this.engines[id]
      }
    }
  }

  // `updateEngines` is invoked when the `tips` state variable
  // changes (for instance when a persistent tip needs to be
  // displayed but its `Source` is not attached to the subtree yet).
  updateEngines (tips, prevTips) {
    const ids = new Set(tips.map(({ id }) => id))
    const prevIds = new Set(prevTips.map(({ id }) => id))
    if (!eqSet(ids, prevIds)) {
      // Create engines for new ids
      const { config } = this.props
      for (const id of diffSet(ids, prevIds)) {
        let engine = this.engines[id]
        if (!engine) {
          engine = this.engines[id] = new Engine({ id, config })
        }
        engine.subscribe(this)
      }
    }
  }

  componentDidMount () {
    const { tips, config } = this.props
    this.updateEngines(this.props.tips, [])
    this.setState({
      tips: (tips || []).reduce((tips, { id, my, location }) => {
        tips[id] = {
          visible: true,
          pinned: true,
          my,
          location
        }
        this.engines[id].pinned = true
        return tips
      }, {})
    })
    this.container = getElement(config.position.container)
  }

  componentDidUpdate (prevProps) {
    this.updateEngines(this.props.tips, prevProps.tips)
  }

  componentWillUnmount () {
    // Stop receiving onLayoutChange and onVisibilityChange events.
    Object.values(this.engines).forEach(engine => {
      engine.unsubscribe(this)
    })
  }

  // This method is invoked by `Engine` when the tip location changes.
  onLayoutChange ({ id, my, location }) {
    const { pinned } = this.getTip(id)
    if (!pinned) {
      this.updateTip(id, { my, location })
    }
  }

  // This method is invoked by `Engine` when the tip visibility changes.
  onVisibilityChange ({ id, visible }) {
    const tips = { ...this.state.tips }
    if (visible) {
      tips[id] = {
        my: 'top-left',
        location: {
          left: 0,
          top: 0
        },
        visible
      }
    } else {
      delete tips[id]
      const engine = this.engines[id]
      if (engine.subscribers.size === 1) {
        // Persistent tip closes, no associated source
        engine.unsubscribe(this)
        delete this.engines[id]
      }
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
          .map(([id, { my, location }]) => ({ id, my, location }))
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
    this.engines[id].pin(!tip.pinned)
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
    const {
      children,
      tip,
      config: { wrapper, wrapperProps }
    } = this.props
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
          .map(([id, { my, location, pinned }]) => {
            // Retrieve the tip for the specified id.
            const tipContent = tip(id, pinned)
            if (tipContent) {
              // Retrieve the `Engine` for the specified id.
              // `Engine` will handle mouseover and mouseout events as well as
              // changes to the tip geometry, whereas `Storage` will handle
              // mousedown and push pin click events
              const engine = this.engines[id]
              const tip = createWrapper(wrapper, {
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
                this.container
              )
            }
            return null
          })}
      </div>
    )
  }
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
   * A callback function invoked when the list of persistent tip changes
   */
  onTipChange: PropTypes.func,
  /**
   * The tip `config`, as an object which contains the following keys:
   *
   * | Key           | Type             | Description                                         |
   * |---------------|------------------|-----------------------------------------------------|
   * | position      | `<PositionType>` | sub-configuration describing the tip position       |
   * | show          | `<ShowType>`     | sub-configuration describing how the tip is shown   |
   * | hide          | `<HideType>`     | sub-configuration describing how the tip is hidden  |
   * | wrapper       | `<component>`    | The component to instantiate to wrap the tip        |
   * | wrapperProps  | `<object>`       | The React properties for the wrapper component      |
   *
   * `<PositionType>` is an object, which contains the following keys:
   *
   * | Key           | Type                   | Description                                                   |
   * |---------------|------------------------|---------------------------------------------------------------|
   * | my            | `<CornerType>`         | The corner of the tip to position in relation to the `at` key |
   * | at            | `<CornerType>`         | The corner of `target` element to position the tip corner at  |
   | target        | `<target-spec>`        | The element the tip will be positioned in relation to. Can be one of <dl><dt>false</dt><dd>the source itself (default)</dd><dt>[&lt;number&gt;, &lt;number&gt;]</dt><dd>an array of x, y coordinates</dd><dt>'mouse'</dt><dd>the mouse coordinates for the event which triggered the tip to show</dd><dt>&lt;string&gt; \| DOMElement</dt><dd>CSS selector or React ref for another DOMElement</dd></dl>   |
  | adjust        | `<AdjustType>`         | sub-configuration describing how the tip position should be adjusted |
  | container     | `<string> \| DOMElement` | CSS selector or React ref to the DOMElement under which tips will attached.      |
  *
  * `<CornerType>` is one of the following enumeration value:
  * * top-left
  * * top-center
  * * top-right
  * * center-left
  * * center-right
  * * bottom-left
  * * bottom-center
  * * bottom-right
  *
  * `<AdjustType>` is an object, which contains the following keys:
  *
  * | Key           | Type                   | Description                                                   |
  * |---------------|------------------------|---------------------------------------------------------------|
  | mouse         | `<mouse-spec>`         | Describes how mouse movement affects the tip placement. Can be one of <dl><dt>false</dt><dd>do not adjust to mouse move (default)</dd><dt>true</dt><dd>adjust to mouse move</dd><dt><pre>function: event =&gt; ({ x, y })</pre></dt><dd>compute the position of the tip using a function which receives mouse move event as input</dd></dl>
  * | x             | `<number>`             | x-translation the tip (0 by default)
  * | y             | `<number>`             | y-translation the tip (0 by default)
  | method        | `<method-spec>`        | Decribes the method to use to optimize tip placement inside its container. Can be one of <dl><dt>none</dt><dd>no placement adjustment (default)</dd><dt>{ flip: [&lt;CornerType&gt; (, &lt;CornerType&gt;)\* ] }</dt><dd>pick the corner which maximizes overlap between the tip and its container</dd><dt>{ shift: [&lt;AxisType&gt; (, &lt;AxisType&gt;)\*]}</dt><dd>keep the tip inside its container for the specified axis</dd></dl>
  *
  * `<AxisType>` is one of the following enumeration value:
  * * horizontal
  * * vertical
  *
  * `<ShowType>` is an object, which contains the following keys:
  *
  * | Key        | Type         | Description                                                                        |
  * |------------|--------------|------------------------------------------------------------------------------------|
  * | delay      | `<number>`   | Delay between mouse enter event in the source and the tip display (0ms by default) |
  *
  * `<HideType>` is an object, which contains the following keys:
  *
  * | Key        | Type         | Description                                                                        |
  * |------------|--------------|------------------------------------------------------------------------------------|
  * | delay      | `<number>`   | Delay between mouse leave event from the source or the tip and removal of the tip (0ms by default) |
  */
  config: SourceConfig
}

// Read the config property from the `ConfigContext` React context
export default props => (
  <ConfigContext.Consumer>
    {config => <Storage config={config} {...props} />}
  </ConfigContext.Consumer>
)
