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
// Balloon
// =======
import React, { useEffect, useState, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { CornerType, TailType } from './prop-types'
import isEqual from 'lodash.isequal'
import { styles } from './styles'
import BalloonTail from './svg/BalloonTail'
import useResizeObserver from './hooks/useResizeObserver'
import useComputedStyle from './hooks/useComputedStyle'
import { GEOMETRY } from './reducers/sourceReducer'
import { log } from './utils'

/**
 * A `Balloon` component wraps another React component in
 * a balloon-shaped styleable wrapper.
 *
 * Graphically a `Balloon` is composed of a bubble and a tail which points towards
 * the elements from which the balloon originates.
 *
 * It has the following structure:
 * ```html
 * <span> // Span to position the bubble and the tail using absolute positioning
 *  <span> // Bubble span
 *   ... tip content
 *  </span>
 *  <SvgTail/> // Tail (overlaps the border of the bubble)
 * </span>
 * ```
 */
const Balloon = props => {
  log('Balloon', 0, props)
  const { children, my, tail, style, className, id, dispatch } = props

  // A ResizeObserver is tied to the bubble `<span>` of the
  // `Balloon` to measure it precisely.
  const ref = useRef(null)

  // A `Balloon` keeps track of a `metrics` state variable
  // which contains info extracted by processing the CSS style of
  // the `Balloon` and info extracted by measuring its bubble `<span>`.
  const [metrics, setMetrics] = useState(null)

  // Extract relevant style props from the DOM
  const computedStyle = useComputedStyle(style, className)

  const measure = useCallback(entry => {
    const { target } = entry
    const boundingClientRect = target.getBoundingClientRect()
    const size = {
      width: boundingClientRect.width,
      height: boundingClientRect.height
    }
    const newMetrics = computeMetrics(tail, computedStyle, size)
    if (!isEqual(metrics, newMetrics)) {
      setMetrics(newMetrics)
      if (typeof dispatch === 'function') {
        const { corners, size } = newMetrics
        dispatch({ type: GEOMETRY, id, geometry: { corners, size } })
      }
    }
  }, [])
  useResizeObserver(ref, measure)

  // Update the metrics if tail or style change
  useEffect(() => {
    if (metrics) {
      const newMetrics = computeMetrics(tail, computedStyle, metrics.size)
      if (!isEqual(metrics, newMetrics)) {
        setMetrics(newMetrics)
        if (typeof dispatch === 'function') {
          const { corners, size } = newMetrics
          dispatch({ type: GEOMETRY, id, geometry: { corners, size } })
        }
      }
    }
  }, [tail, computedStyle, metrics])

  let containerStyle
  if (metrics) {
    const { size } = metrics
    const { margin } = computedStyle
    containerStyle = {
      display: 'inline-block',
      position: 'relative',
      visibility: 'visible',
      width: `${size.width + margin.left + margin.right}px`,
      height: `${size.height + margin.top + margin.bottom}px`
    }
  } else {
    containerStyle = {
      position: 'relative',
      visibility: 'hidden'
    }
  }

  return (
    <span className='rit-balloon' style={containerStyle} data-rit-id={id}>
      <span
        ref={ref}
        style={{
          display: 'inline-block',
          ...(className ? {} : props.style)
        }}
        className={className}
      >
        {children}
      </span>
      <BalloonTail
        my={my}
        metrics={metrics}
        style={computedStyle}
        className={className}
      />
    </span>
  )
}

Balloon.propTypes = {
  /**
   * The corner of the balloon to which the tail attaches
   */
  my: CornerType,
  /**
   * The size of the ballon tail
   */
  tail: TailType,
  /**
   * A dispatch function invoked when the geometry of the balloon changes.
   * The function receives a GEOMETRY action with the following keys:
   *
   * | Key  | Type            | Description                                                                    |
   * | ---- | --------------- | ------------------------------------------------------------------------------ |
   * | corners  | `<CornersType>` | The position of the `Balloon`'s tail end for all possible tail configurations. |
   * | size | `<SizeType>`    | The size of the `Balloon`.                                                     |
   *
   * CornersType
   *
   * `<CornersType>` is an object, which contains the following keys:
   *
   * | Key  | Type            | Description                                                                    |
   * | ---- | --------------- | ------------------------------------------------------------------------------ |
   * | top-left  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to top-left. |
   * | top-center  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to top-center. |
   * | top-right  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to top-right. |
   * | center-left  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to center-left. |
   * | center-right  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to center-right. |
   * | bottom-left  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to top-left. |
   * | bottom-left  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to bottom-center. |
   * | bottom-center  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to top-left. |
   * | bottom-right  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to bottom-right. |
   *
   * `<SizeType>` is an object, which contains the following keys:
   *
   * | Key  | Type            | Description                                                                    |
   * | ---- | --------------- | ------------------------------------------------------------------------------ |
   * | width  | `<number>` | Width of the wrapper. |
   * | height  | `<number>` | height of the wrapper. |
   *
   */
  dispatch: PropTypes.func,
  /**
   * The CSS style to use to render the balloon
   */
  style: PropTypes.object,
  /**
   * A CSS class specification to use to render the ballon (if used, will replace `style`)
   */
  className: PropTypes.string,
  /**
   * `true` if the balloon is pinned to the screen
   */
  pinned: PropTypes.bool,
  /**
   * If the balloon is contained in a `Storage`, an id which uniquely identifies
   * the `Source` to which this balloon belongs
   */
  id: PropTypes.string
}

Balloon.defaultProps = {
  my: 'top-left',
  tail: { width: 8, height: 8 },
  style: styles.defaultStyle
}

const computeMetrics = (tail, style, size) => {
  const { margin, borderWidth, borderRadius } = style
  const { width: aw, height: ah } = tail

  // Extact CSS value from the computed CSS style
  return {
    size,
    // Compute the coordinates of the tail tip for
    // all possible tail configurations, in local coordinates.
    // These coordinates must be passed to the `Engine` so that
    // precise tip placement can be computed.
    corners: {
      'top-left': {
        left: margin.left + borderWidth + Math.max(borderRadius, 4),
        top: margin.top - ah + borderWidth
      },
      'top-center': {
        left: margin.left + 0.5 * size.width,
        top: margin.top - ah + borderWidth
      },
      'top-right': {
        left: margin.left + size.width - Math.max(borderRadius, 4),
        top: margin.top - ah + borderWidth
      },
      'center-left': {
        left: margin.left - aw + borderWidth,
        top: margin.top + 0.5 * size.height
      },
      'center-right': {
        left: margin.left + size.width - borderWidth + aw,
        top: margin.top + 0.5 * size.height
      },
      'bottom-left': {
        left: margin.left + borderWidth + Math.max(borderRadius, 4),
        top: margin.top + size.height - borderWidth + ah
      },
      'bottom-center': {
        left: margin.left + 0.5 * size.width,
        top: margin.top + size.height - borderWidth + ah
      },
      'bottom-right': {
        left: margin.left + size.width - Math.max(borderRadius, 4),
        top: margin.top + size.height - borderWidth + ah
      }
    },
    tail
  }
}

const areEqual = (prev, next) => {
  return (
    prev.my === next.my &&
    prev.tail === next.tail &&
    prev.style === next.style &&
    prev.className === next.className &&
    prev.pinned === next.pinned &&
    prev.children === next.children
  )
}

export default React.memo(Balloon, areEqual)
