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
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { CornerType } from './prop-types'
import isEqual from 'lodash.isequal'
import { styles } from './styles'
import ResizeObserver from 'resize-observer-polyfill'
import { pixelize } from './utils'
import { BalloonTail } from './svg/BalloonTail'

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
export default class Balloon extends Component {
  constructor (props) {
    super(props)
    // A ResizeObserver is tied to the bubble `<span>` of the
    // `Balloon` to measure it precisely.
    this.ref = React.createRef()
    this.observer = new ResizeObserver(this.measure.bind(this))

    // A `Balloon` keeps track of a `metrics` state variable
    // which contains info extracted by processing the CSS style of
    // the `Balloon` and info extracted by measuring its bubble `<span>`.
    this.state = {
      metrics: {
        size: {
          width: 0,
          height: 0
        },
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#000',
        borderRadius: 0,
        corners: {
          'top-left': {
            left: 0,
            top: 0
          },
          'top-center': {
            left: 0,
            top: 0
          },
          'top-right': {
            left: 0,
            top: 0
          },
          'center-left': {
            left: 0,
            top: 0
          },
          'center-right': {
            left: 0,
            top: 0
          },
          'bottom-left': {
            left: 0,
            top: 0
          },
          'bottom-center': {
            left: 0,
            top: 0
          },
          'bottom-right': {
            left: 0,
            top: 0
          }
        },
        tail: {
          width: 0,
          height: 0
        }
      }
    }
  }

  componentDidMount () {
    this.observe(this.ref.current)
  }

  componentDidUpdate (prevProps) {
    this.observe(this.ref.current)
    if (
      !isEqual(this.props.tail, prevProps.tail) ||
      !isEqual(this.props.style, prevProps.style)
    ) {
      this.measure([{ target: this.ref.current }])
    }
  }

  componentWillUnmount () {
    this.observer.disconnect()
  }

  observe (target) {
    if (target !== this.target) {
      if (this.target) {
        this.observer.unobserve(this.target)
      }
      this.observer.observe(target)
      this.target = target
    }
  }

  measure (entries) {
    const { tail } = this.props
    const { width: aw, height: ah } = tail
    for (const { target } of entries) {
      // Retrieve the dimensions of the bubble `<span>`
      // from the `ResizeObserver`
      const boundingClientRect = target.getBoundingClientRect()
      const size = {
        width: boundingClientRect.width,
        height: boundingClientRect.height
      }

      // Extact CSS value from the computed CSS style
      const styles = window.getComputedStyle(target)
      const margin = {
        top: parseInt(styles.marginTop, 10),
        right: parseInt(styles.marginRight, 10),
        bottom: parseInt(styles.marginBottom, 10),
        left: parseInt(styles.marginLeft, 10)
      }
      const borderWidth = Math.round(parseFloat(styles.borderTopWidth))
      const borderRadius = Math.round(parseFloat(styles.borderTopLeftRadius))
      const metrics = {
        size,
        margin,
        borderWidth,
        borderRadius,
        borderStyle: styles.borderTopStyle,
        borderColor: styles.borderTopColor,
        backgroundColor: styles.backgroundColor,
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
      if (!isEqual(metrics, this.state.metrics)) {
        const { onGeometryChange } = this.props
        this.setState({ metrics })
        if (typeof onGeometryChange === 'function') {
          const { corners, size } = metrics
          onGeometryChange({ corners, size })
        }
      }
    }
  }

  render () {
    const { children, my, style, className } = this.props
    const { metrics } = this.state
    return (
      <span
        className='rit-balloon'
        style={{
          visibility:
            metrics.size.width === 0 && metrics.size.height === 0
              ? 'hidden'
              : 'visible',
          position: 'relative',
          display: 'inline-block',
          ...pixelize({
            width:
              metrics.size.width + metrics.margin.left + metrics.margin.right,
            height:
              metrics.size.height + metrics.margin.top + metrics.margin.bottom
          })
        }}
      >
        <span
          ref={this.ref}
          style={{
            display: 'inline-block',
            ...(className ? {} : style)
          }}
          className={className}
        >
          {children}
        </span>
        <BalloonTail my={my} metrics={metrics} />
      </span>
    )
  }
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
