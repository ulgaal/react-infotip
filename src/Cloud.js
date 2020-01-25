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
// Cloud
// =====
import React, { useRef, useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { CornerType } from './prop-types'
import isEqual from 'lodash.isequal'
import { styles } from './styles'
import CloudShape from './svg/CloudShape'
import useResizeObserver from './useResizeObserver'

/**
 * A `Cloud` component wraps another React component in
 * a cloud-shaped styleable wrapper.
 *
 * Graphically a `Cloud` is composed of a cloud outline and a content.
 * The cloud shape is randomly computed using just a `folds` parameter
 * which indicates the number of folds the cloud `Cloud` have.
 *
 * It has the following structure:
 * ```html
 * <div> // div to position the cloud outline and the content using absolute positioning
 *  <SvgCloud/> // Cloud outline
 *  <span> // Cloud content (overlaps the outline)
 *   ... tip content
 *  </span>
 * </div>
 * ```
 */
const Cloud = props => {
  // console.log('Cloud', props)
  const {
    children,
    my,
    tail,
    folds,
    style,
    className,
    onGeometryChange
  } = props

  // A ResizeObserver is tied to the content `<span>` of the
  // `Cloud` to measure it precisely.
  const ref = useRef(null)

  // A `Cloud` keeps track of a `metrics` state variable
  // which contains info extracted by processing the CSS style of
  // the `Cloud` and info extracted by measuring its content `<span>`.
  const [metrics, setMetrics] = useState(null)

  const [innerSize, setInnerSize] = useState(null)
  const measure = useCallback(entry => {
    // Retrieve the dimensions of the content `<span>`
    // from the `ResizeObserver`
    const boundingClientRect = entry.target.getBoundingClientRect()
    const innerSize = {
      width: boundingClientRect.width,
      height: boundingClientRect.height
    }
    setInnerSize(innerSize)
  }, [])
  useResizeObserver(ref, measure)

  // Update the metrics if tail, fold or innerSize change
  useEffect(() => {
    if (innerSize) {
      const newMetrics = computeMetrics({
        tail,
        folds,
        innerSize,
        style,
        className
      })
      if (!isEqual(newMetrics, metrics)) {
        setMetrics(newMetrics)
        if (typeof onGeometryChange === 'function') {
          const { corners, size } = newMetrics
          onGeometryChange({ corners, size })
        }
      }
    }
  }, [tail, folds, innerSize, style, className])

  let containerStyle
  let contentStyle
  if (metrics) {
    const {
      size: { width, height },
      delta
    } = metrics
    containerStyle = {
      visibility: 'visible',
      width: `${width}px`,
      height: `${height}px`
    }
    contentStyle = {
      display: 'inline-block',
      whiteSpace: 'nowrap',
      position: 'absolute',
      left: 0.5 * delta,
      top: 0.5 * delta,
      color: style.color,
      padding: style.padding
    }
  } else {
    containerStyle = {
      visibility: 'hidden'
    }
    contentStyle = {
      display: 'inline-block',
      padding: style.padding
    }
  }
  return (
    <div className='rit-cloud' style={containerStyle}>
      <CloudShape my={my} metrics={metrics} />
      <span ref={ref} style={contentStyle}>
        {children}
      </span>
    </div>
  )
}

Cloud.propTypes = {
  /**
   * The corner of the cloud to which the tail attaches
   */
  my: CornerType,
  /**
   * The size of the cloud tail
   */
  tail: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  }),
  /**
   * The number of randomly generated cloud folds
   */
  folds: PropTypes.number,
  /**
   * The CSS style to use to render the cloud
   */
  style: PropTypes.object,
  /**
   * A callback function invoked when the geometry of the cloud changes.
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
  onGeometryChange: PropTypes.func
}

Cloud.defaultProps = {
  my: 'top-left',
  tail: {
    width: 25,
    height: 25
  },
  folds: 13,
  onGeometryChange: null,
  style: styles.defaultStyle
}

const computeMetrics = ({ tail, folds, innerSize, style, className }) => {
  const length = 2 * (innerSize.width + innerSize.height)
  const delta = (0.5 * length) / folds

  const size = {
    width: innerSize.width + delta,
    height: innerSize.height + delta
  }
  return {
    size,
    innerSize,
    corners: {
      // Compute the coordinates of the tail tip for
      // all possible tail configurations, in local coordinates.
      // These coordinates must be passed to the `Engine` so that
      // precise tip placement can be computed.
      'top-left': {
        left: -tail.width,
        top: -tail.height
      },
      'top-center': {
        left: 0.5 * size.width,
        top: -tail.height
      },
      'top-right': {
        left: size.width + tail.width,
        top: -tail.height
      },
      'center-left': {
        left: -tail.width,
        top: 0.5 * size.height
      },
      'center-right': {
        left: size.width + tail.width,
        top: 0.5 * size.height
      },
      'bottom-left': {
        left: -tail.width,
        top: size.height + tail.height
      },
      'bottom-center': {
        left: 0.5 * size.width,
        top: size.height + tail.height
      },
      'bottom-right': {
        left: size.width + tail.width,
        top: size.height + tail.height
      }
    },
    tail,
    folds,
    delta,
    style,
    className
  }
}

export default Cloud
