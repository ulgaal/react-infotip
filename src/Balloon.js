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
import { CornerType } from './prop-types'
import isEqual from 'lodash.isequal'
import { styles } from './styles'
import { BalloonTail } from './svg/BalloonTail'
import useResizeObserver from './useResizeObserver'

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
  const { children, my, tail, className, onGeometryChange } = props

  // A ResizeObserver is tied to the bubble `<span>` of the
  // `Balloon` to measure it precisely.
  const ref = useRef(null)

  // A `Balloon` keeps track of a `metrics` state variable
  // which contains info extracted by processing the CSS style of
  // the `Balloon` and info extracted by measuring its bubble `<span>`.
  const [metrics, setMetrics] = useState(null)

  const [nodeProps, setNodeProps] = useState(null)
  const measure = useCallback(entry => {
    const { target } = entry
    const boundingClientRect = target.getBoundingClientRect()
    const styles = window.getComputedStyle(target)

    setNodeProps({
      size: {
        width: boundingClientRect.width,
        height: boundingClientRect.height
      },
      margin: {
        top: parseInt(styles.marginTop, 10),
        right: parseInt(styles.marginRight, 10),
        bottom: parseInt(styles.marginBottom, 10),
        left: parseInt(styles.marginLeft, 10)
      },
      borderStyle: styles.borderTopStyle,
      borderColor: styles.borderTopColor,
      backgroundColor: styles.backgroundColor,
      borderWidth: Math.round(parseFloat(styles.borderTopWidth)),
      borderRadius: Math.round(parseFloat(styles.borderTopLeftRadius))
    })
  }, [])
  useResizeObserver(ref, measure)

  // Update the metrics if tail or size change
  useEffect(() => {
    if (nodeProps) {
      const newMetrics = computeMetrics(tail, nodeProps)
      if (!isEqual(newMetrics, metrics)) {
        setMetrics(newMetrics)
        if (typeof onGeometryChange === 'function') {
          const { corners, size } = newMetrics
          onGeometryChange({ corners, size })
        }
      }
    }
  }, [tail, nodeProps])

  let containerStyle
  if (metrics) {
    const { size, margin } = metrics
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
    <span className='rit-balloon' style={containerStyle}>
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
      <BalloonTail my={my} metrics={metrics} />
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
  tail: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  }),
  /**
   * A callback function invoked when the geometry of the balloon changes.
   * The function receives a hash with the following keys:
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
  onGeometryChange: PropTypes.func,
  /**
   * The CSS style to use to render the balloon
   */
  style: PropTypes.object,
  /**
   * A CSS class specification to use to render the ballon (if used, will replace `style`)
   */
  className: PropTypes.string
}

Balloon.defaultProps = {
  my: 'top-left',
  tail: { width: 8, height: 8 },
  onGeometryChange: null,
  style: styles.defaultStyle
}

const computeMetrics = (tail, nodeProps) => {
  const {
    size,
    margin,
    borderWidth,
    borderRadius,
    borderStyle,
    borderColor,
    backgroundColor
  } = nodeProps
  const { width: aw, height: ah } = tail

  // Extact CSS value from the computed CSS style
  return {
    size,
    margin,
    borderWidth,
    borderRadius,
    borderStyle,
    borderColor,
    backgroundColor,
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

export default Balloon
