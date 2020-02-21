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
import React, {
  useRef,
  useCallback,
  useEffect,
  useReducer,
  useMemo,
  useContext
} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { SourceConfig } from './prop-types'
import { mergeObjects, LOGS } from './utils'
import Location from './Location'
import { ConfigContext, StorageContext } from './Contexts'
import {
  sourceInit,
  sourceReducer,
  MOUSE_OVER,
  MOUSE_MOVE,
  MOUSE_OUT,
  PIN,
  RESET
} from './reducers/sourceReducer'

/**
 * The `Source` component acts as a wrapper for other components and enables them
 * to provide tips.
 */
const Source = props => {
  // Merge the context and local configs and extract relevant
  // properties from it
  const { id, config: localConfig, pinned } = props
  const contextConfig = useContext(ConfigContext)
  const config = useMemo(() => {
    return mergeObjects(contextConfig, localConfig)
  }, [contextConfig, localConfig])

  // A `Source` can exist either in isolation (in which case it has
  // its own `Engine`), or within a `Storage` (in which case it shares
  // an `Engine` with its `Storage`).
  const useStorageReducer = useContext(StorageContext)

  // Most computations are delegated to a reducer.
  // The source transforms DOM events into actions and the
  // reducer computes changes to the state of the `Source`
  // (updates on position, location or visibility)
  const [state, dispatch] = useStorageReducer
    ? useStorageReducer({ id, config })
    : useReducer(sourceReducer, { config }, sourceInit)
  if (LOGS.source > 0) {
    console.log('Source', props, state)
  }

  // Keep a reference to the actual `Source` DOM element,
  // used for tip positionning when target === false
  const ref = useRef(null)

  // Reinitialize the source if the config changes
  useEffect(() => {
    if (config !== state.config) {
      dispatch({ type: RESET, config })
    }
  }, [config])

  // Make the source visible if the pinned property is set
  useEffect(() => {
    if (state.pinned !== undefined || pinned) {
      dispatch({
        type: PIN,
        id,
        pinned,
        ref: ref.current
      })
    }
  }, [pinned])

  // Tranform DOM events into reducer actions:
  // * mouseout events.
  // * mouseover events.
  // * mousemove events.
  const handleMouseOut = useCallback(
    event => {
      event.stopPropagation()
      dispatch({ type: MOUSE_OUT, id, dispatch })
    },
    [dispatch, id]
  )

  const handleMouseOver = useCallback(
    event => {
      event.stopPropagation()
      dispatch({
        type: MOUSE_OVER,
        id,
        config,
        position: {
          x: event.clientX + window.scrollX,
          y: event.clientY + window.scrollY
        },
        dispatch,
        ref: ref.current
      })
    },
    [dispatch, id, config]
  )

  const handleMouseMove = useCallback(
    event => {
      event.stopPropagation()
      dispatch({
        type: MOUSE_MOVE,
        id,
        position: {
          x: event.clientX + window.scrollX,
          y: event.clientY + window.scrollY
        }
      })
    },
    [dispatch, id]
  )

  const { tip, children, svg } = props

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
    ref,
    onMouseOut: handleMouseOut,
    onMouseOver: handleMouseOver,
    onMouseMove:
      config.position.adjust.mouse && !useStorageReducer
        ? handleMouseMove
        : null,
    // This is mostly transparent (the `<span>` uses the CSS `display: 'contents'` property)
    // but there may be edge cases where one wants to be aware of this.
    ...(svg ? {} : { style: { display: 'contents' } })
  }
  const tagChildren = [...React.Children.toArray(children)]
  if (useStorageReducer) {
    tagProps['data-rit-id'] = id
  } else {
    // A `Source` keeps track of four state variables
    // * `my`: the position which provides optimal placement of the tip as computed by its `Engine`.
    // * `location`: the actual coordinates of the tip.
    // * `visible`: whether the tip is currently visible.
    const {
      my,
      location = {
        left: 0,
        top: 0
      },
      visible
    } = state
    if (visible) {
      // The tip itself consists of a wrapper component (`Balloon` by default)
      // which provides the user-supplied tip component with a tip appearance.
      const { wrapper, wrapperProps } = config
      const wrappedTip = React.createElement(wrapper, {
        ...wrapperProps,
        my,
        dispatch,
        children: tip
      })
      // A portal is used to attach the tip to another DOM parent (so that it
      // naturally floats above other DOM nodes it the DOM tree). The additional
      // benefit of the portal is that DOM events are still channeled through
      // the `Source`, which is required not to break timers used to show and hide tip.
      tagChildren.push(
        ReactDOM.createPortal(
          <Location location={location}>{wrappedTip}</Location>,
          state.containerElt
        )
      )
    }
  }
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
  id: PropTypes.string
}

Source.defaultProps = {
  pinned: false,
  svg: false
}

export const areEqual = (prev, next) => {
  return (
    prev.id === next.id &&
    prev.config === next.config &&
    prev.tip === next.tip &&
    prev.pinned === next.pinned &&
    prev.children === next.children
  )
}

export default React.memo(Source, areEqual)
