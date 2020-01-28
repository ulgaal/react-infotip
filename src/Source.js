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
// Source
// ======
import React, { useState, useRef, useCallback, useEffect } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { SourceConfig } from './prop-types'
import { mergeObjects, getElement } from './utils'
import Location from './Location'
import Storage from './Storage'
import { ConfigContext, StorageContext } from './Contexts'
import Engine from './Engine'
import useResizeObserver from './useResizeObserver'

/**
 * The `Source` component acts as a wrapper for other components and enables them
 * to provide tips.
 */
const Source = props => {
  // console.log('Source', props)

  // A `Source` keeps track of three state variables
  // * `my`: the position which provides optimal placement of the tip as computed by its `Engine`.
  // * `location`: the actual coordinates of the tip.
  // * `visible`: whether the tip is currently visible.
  const [my, setMy] = useState('top-left')
  const [location, setLocation] = useState({
    left: 0,
    top: 0
  })
  const [visible, setVisible] = useState(false)

  // Most computations are delegated to an `Engine`.
  // The source will feed DOM events to the `Engine`, and receive
  // updates on position, location or visibility from the `Engine`.
  // A `Source` can exist either in isolation (in which case it has
  // its own `Engine`), or within a `Storage` (in which case it shares
  // an `Engine` with its `Storage`).
  const { id, config, storage } = props

  // This callback is invoked by the source `Engine` when the tip location changes,
  // unless the source is part of a Storage.
  const onLayoutChange = useCallback(({ id, my, location }) => {
    setMy(my)
    setLocation(location)
  }, [])

  // This callback is invoked by the source `Engine` when the tip visibility changes,
  // unless the source is part of a Storage.
  const onVisibilityChange = useCallback(({ id, visible }) => {
    setVisible(visible)
  }, [])
  const engineRef = useRef(
    storage
      ? storage.getEngine({ id, config })
      : new Engine({
          id,
          config,
          output: {
            onLayoutChange,
            onVisibilityChange
          }
        })
  )
  const engine = engineRef.current

  // A `Source` renders an actual DOM element, which is observed by
  // a `ResizeObserver`, so that the engine can take the geometry of
  // the source into consideration to compute tip placement.
  const ref = useRef(null)
  const measure = useCallback(
    entries => {
      engine.update({
        target: getTarget()
      })
    },
    [engine]
  )
  const update = useResizeObserver(ref, measure)

  // The `target` key of the `config` property enables the tip to appear at a location
  // different from the source. This method is used to determine the DOM element
  // used to compute the tip location, unless mouse tracking is enable in which case
  // the location is the mouse location.
  const {
    position: {
      target: targetConf,
      adjust: { mouse }
    }
  } = config
  const getTarget = useCallback(() => {
    if (!mouse) {
      if (targetConf === false) {
        return ref.current.firstChild
      }
      if (typeof targetConf === 'string' && targetConf !== 'mouse') {
        return document.querySelector(targetConf)
      }
    }
    return null
  }, [ref, targetConf, mouse])

  useEffect(() => {
    if (!mouse && Array.isArray(targetConf)) {
      engine.update({
        target: { left: targetConf[0], top: targetConf[1], width: 1, height: 1 }
      })
    }
    let target = getTarget()
    if (target) {
      if (target instanceof SVGElement) {
        // In case of an SVG `Source` the `ResizeObserver` is not triggered
        // by changes to the target `SVGElement`, so we need to observe the englobing
        // `SVGSVGElement` instead
        target = target.ownerSVGElement
      }
      update(target)
    }

    measure()
    if (props.pinned) {
      engine.pin(true)
    }
  }, [])

  // For sources which belong to a `Storage`, update their
  // engine when the source id changes
  const prevIdRef = useRef()
  useEffect(() => {
    prevIdRef.current = id
  })
  const prevId = prevIdRef.current
  useEffect(() => {
    if (storage && prevId && id !== prevId) {
      // The source belongs to a `Storage` and its id has changed
      engineRef.current = storage.getEngine({ id, config })
      storage.release(prevId.current)
    }
    engineRef.current.update({ config })
    return () => {
      if (storage) {
        storage.release(id)
      }
    }
  }, [id, config])

  // Delegate all computations triggered by DOM events to the `Engine`
  // to avoid code duplication between `Source` and `Storage`
  // * changes to the target caught by the `ResizeObserver`.
  // * mouseout events.
  // * mouseover events.
  // * mousemove events.

  const handleGeometryChange = useCallback(
    geometry => {
      engine.update({ geometry })
    },
    [engine]
  )

  const handleMouseOut = useCallback(
    event => {
      engine.handleMouseOut(event)
    },
    [engine]
  )

  const handleMouseOver = useCallback(
    event => {
      engine.handleMouseOver(event)
    },
    [engine]
  )

  const handleMouseMove = useCallback(
    event => {
      engine.handleMouseMove(event)
    },
    [engine]
  )

  const {
    tip,
    children,
    config: {
      wrapper,
      wrapperProps,
      position: { container }
    },
    svg
  } = props

  // The tip itself consists of a wrapper component (`Balloon` by default)
  // which provides the user-supplied tip component with a tip appearance.
  const wrappedTip = React.createElement(wrapper, {
    ...wrapperProps,
    my,
    onGeometryChange: handleGeometryChange,
    children: tip
  })

  // Since a `Source` needs to handle pointer events (notably it needs to
  // know when the pointer enters or leaves your component so that it
  // can trigger the tip display), it has an actual HTML tag associated to it
  // (either a `<span>` if your component renders as HTML, or a `<g>` if your component renders
  // to SVG).
  // It also needs to known if the geometry of this element changes, because this
  // will affect tip placement, hence the `ref` which is tracked by the `ResizeObserver`.

  const tagName = svg ? 'g' : 'span'
  const tagProps = {
    className: 'rit-source',
    // This is mostly transparent (the `<span>` uses the CSS `display: 'contents'` property)
    // but there may be edge cases where one wants to be aware of this.
    ...(svg ? {} : { style: { display: 'contents' } }),
    onMouseOut: handleMouseOut,
    onMouseOver: handleMouseOver,
    onMouseMove: mouse ? handleMouseMove : null,
    ref
  }

  const tagChildren = [
    ...React.Children.toArray(children),
    // For `Source`s contained in a `Storage`, let the storage take care of the rendering.
    ...(visible && !storage
      ? [
          // A portal is used to attach the tip to another DOM parent (so that it
          // naturally floats above other DOM nodes it the DOM tree). The additional
          // benefit of the portal is that DOM events are still channeled through
          // the `Source`, which is required not to break timers used to show and hide tip.
          ReactDOM.createPortal(
            <Location location={location}>{wrappedTip}</Location>,
            getElement(container)
          )
        ]
      : [])
  ]
  return React.createElement(tagName, tagProps, tagChildren)
}

Source.propTypes = {
  /**
   * The tip content as a React node
   */
  tip: PropTypes.node,
  /**
   * `true` to make the tip always visible, `false` otherwise
   */
  pinned: PropTypes.bool,
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
   | target        | `<target-spec>`        | The element the tip will be positioned in relation to. Can be one of <dl><dt>false</dt><dd>the source itself (default)</dd><dt>[&lt;number&gt;, &lt;number&gt;]</dt><dd>an array of x, y coordinates</dd><dt>'mouse'</dt><dd>the mouse coordinates for the event which triggered the tip to show</dd><dt>&lt;string&gt;</dt><dd>CSS selector for another DOMElement</dd></dl>   |
  | adjust        | `<AdjustType>`         | sub-configuration describing how the tip position should be adjusted |
  | container     | `<string>` | CSS selector to the DOMElement under which tips will attached.      |
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
  config: SourceConfig,
  /**
   * Must to set to `true` if the source wraps an SVG element, `false` otherwise
   */
  svg: PropTypes.bool,
  /**
   * If the `Source` is contained in a `Storage`, an id which uniquely identifies
   * this `Source` within its `Storage`
   */
  id: PropTypes.string,
  /**
   * If the `Source` is contained in a `Storage`, a pointer to this `Storage` (this
   * property will be automatically valued by the englobing `Storage`)
   */
  storage: PropTypes.instanceOf(Storage)
}

// Configure `Source`s which have a `Storage` ancestor in their React
// component tree so that they have a `storage` property pointing to their `Storage`.
// Also read the `config` property from the `ConfigContext` React context.
export default ({ config, ...rest }) => (
  <StorageContext.Consumer>
    {storage => {
      return (
        <ConfigContext.Consumer>
          {contextConfig => (
            <Source
              config={mergeObjects(contextConfig, config)}
              storage={storage}
              {...rest}
            />
          )}
        </ConfigContext.Consumer>
      )
    }}
  </StorageContext.Consumer>
)
