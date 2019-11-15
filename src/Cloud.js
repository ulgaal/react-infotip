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
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { CornerType } from './prop-types'
import { pixelize, seq } from './utils'
import isEqual from 'lodash.isequal'
import ResizeObserver from 'resize-observer-polyfill'
import { styles } from './styles'
import { parseBorder, parseBoxShadow } from './css'

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
export default class Cloud extends Component {
  constructor (props) {
    super(props)

    // A ResizeObserver is tied to the content `<span>` of the
    // `Cloud` to measure it precisely.
    this.ref = React.createRef()
    this.observer = new ResizeObserver(this.measure.bind(this))

    // A `Cloud` keeps track of a `metrics` state variable
    // which contains info extracted by processing the CSS style of
    // the `Cloud` and info extracted by measuring its content `<span>`.
    this.state = {
      metrics: {
        size: {
          width: 0,
          height: 0
        },
        innerSize: {
          width: 0,
          height: 0
        },
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
          width: 25,
          height: 25
        },
        folds: props.folds,
        delta: 0
      },
      // Generate a set of random coefficients which
      // determine the cloud shape
      coefs: randomCoefs(props.folds),
      // Because SVG `<defs>` elements are used internally,
      // generate a new id to uniquely identify that set of `<defs>`.
      shapeid: shapeid++
    }
  }

  componentDidMount () {
    this.observe(this.ref.current)
  }

  componentDidUpdate (prevProps) {
    this.observe(this.ref.current)
    if (
      !isEqual(this.props.tail, prevProps.tail) ||
      !isEqual(this.props.style, prevProps.style) ||
      this.props.folds !== prevProps.folds
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
    const { tail, folds } = this.props
    for (const { target } of entries) {
      // Retrieve the dimensions of the content `<span>`
      // from the `ResizeObserver`
      const boundingClientRect = target.getBoundingClientRect()
      const innerSize = {
        width: boundingClientRect.width,
        height: boundingClientRect.height
      }

      const length = 2 * (innerSize.width + innerSize.height)
      const delta = (0.5 * length) / folds

      const size = {
        width: innerSize.width + delta,
        height: innerSize.height + delta
      }
      const metrics = {
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
        delta
      }
      if (!isEqual(metrics, this.state.metrics)) {
        const { onGeometryChange } = this.props
        this.setState({
          metrics,
          coefs: randomCoefs(folds),
          shapeid: shapeid++
        })
        if (typeof onGeometryChange === 'function') {
          const { corners, size } = metrics
          onGeometryChange({ corners, size })
        }
      }
    }
  }

  render () {
    const { children, my, style, className } = this.props
    const { metrics, coefs, shapeid } = this.state
    const {
      size: { width, height },
      delta
    } = metrics
    return (
      <div
        className='rit-cloud'
        style={{
          visibility: width === 0 && height === 0 ? 'hidden' : 'visible',
          position: 'relative',
          ...pixelize({
            width,
            height
          })
        }}
      >
        <SvgCloud
          my={my}
          metrics={metrics}
          coefs={coefs}
          shapeid={shapeid}
          style={{ ...(className ? {} : style) }}
          className={className}
        />
        <span
          ref={this.ref}
          style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            position: 'absolute',
            left: 0.5 * delta,
            top: 0.5 * delta,
            color: style.color,
            padding: style.padding
          }}
        >
          {children}
        </span>
      </div>
    )
  }
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

// Define a few 2D-vector helper functions
const add = (p1, p2) => ({
  x: p1.x + p2.x,
  y: p1.y + p2.y
})
const subst = (p1, p2) => ({
  x: p1.x - p2.x,
  y: p1.y - p2.y
})
const scale = (p, f) => ({
  x: f * p.x,
  y: f * p.y
})
const mid = (p1, p2) => scale(add(p1, p2), 0.5)
const norm2 = p => p.x * p.x + p.y * p.y
const norm = p => Math.sqrt(norm2(p))
const randomCoefs = count => ({
  l: [...seq(0, count)].map(() => Math.random()),
  f1: [...seq(0, count)].map(() => Math.random()),
  f3: [...seq(0, count)].map(() => Math.random())
})

let shapeid = 0

/**
 * `SvgCloud` is an internal SVG component used to display the outline
 * of the `Cloud` component
 */
const SvgCloud = props => {
  const {
    my,
    metrics: { innerSize, size, tail, folds },
    style,
    coefs,
    shapeid
  } = props
  const id = `cloud_${shapeid}`
  const center = {
    x: innerSize.width / 2,
    y: innerSize.height / 2
  }
  const tail_ = { x: tail.width, y: tail.height }

  // Extact CSS value from the CSS style
  const border = parseBorder(style.border)
  const backgroundColor = style.backgroundColor
  const dash = {}
  switch (border.style) {
    case 'dotted':
      dash.strokeDasharray = `${border.width} ${border.width}`
      break
    case 'dashed':
      dash.strokeDasharray = `${3 * border.width} ${3 * border.width}`
      break
    default:
  }
  const shadow = parseBoxShadow(style.boxShadow)

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  const length = 2 * (innerSize.width + innerSize.height)
  const delta = length / folds
  path.setAttribute(
    'd',
    `M 0 0 h ${innerSize.width} v ${innerSize.height} h ${-innerSize.width} z`
  )
  let p = null
  let v = null
  switch (my) {
    case 'top-left':
      p = { x: 0, y: 0 }
      v = { x: -1, y: -1 }
      break
    case 'top-center':
      p = { x: 0.5 * innerSize.width, y: 0 }
      v = { x: 0, y: -1 }
      break
    case 'top-right':
      p = { x: innerSize.width, y: 0 }
      v = { x: 1, y: -1 }
      break
    case 'center-left':
      p = { x: 0, y: 0.5 * innerSize.height }
      v = { x: -1, y: 0 }
      break
    case 'center-right':
      p = { x: innerSize.width, y: 0.5 * innerSize.height }
      v = { x: 1, y: 0 }
      break
    case 'bottom-left':
      p = { x: 0, y: innerSize.height }
      v = { x: -1, y: 1 }
      break
    case 'bottom-center':
      p = { x: 0.5 * innerSize.width, y: innerSize.height }
      v = { x: 0, y: 1 }
      break
    default:
    case 'bottom-right':
      p = { x: innerSize.width, y: innerSize.height }
      v = { x: 1, y: 1 }
      break
  }
  return (
    <svg
      width={`${size.width + 2 * tail.width}px`}
      height={`${size.height + 2 * tail.height}px`}
      viewBox={`${-tail.width} -${tail.height} ${size.width +
        2 * tail.width} ${size.height + 2 * tail.height}`}
      style={{
        position: 'absolute',
        left: `${-tail.width}px`,
        top: `${-tail.height}px`
      }}
    >
      <defs>
        <filter id='shadow' x='-10%' y='-10%' width='120%' height='120%'>
          <feGaussianBlur stdDeviation='2 2' result='shadow' />
          <feOffset dx={shadow.dx} dy={shadow.dy} />
        </filter>
        <g id={id} transform={`translate(${0.25 * delta},${0.25 * delta})`}>
          {// Draw the cloud tail
            [...seq(0, 3)].map(i => {
              const c = add(p, scale(v, norm(tail_) * (0.25 + (0.5 * i) / 2)))
              const r = norm(tail_) * 0.15 * Math.pow(0.6, i)
              return (
                <circle
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  r={r}
                  stroke={border.color}
                  strokeWidth={border.width}
                  {...dash}
                />
              )
            })}
          <path
            d={
              // Draw the cloud folds
              [...seq(0, folds)]
                .map(i => i * delta + coefs.l[i] * delta * 0.2)
                .reduce((d, l, i, ls) => {
                  const p1 = path.getPointAtLength(Math.min(length, l))
                  const p2 = path.getPointAtLength(
                    Math.min(length, ls[(i + 1) % folds])
                  )
                  const p3 = mid(p1, p2)
                  const v = subst(p2, p1)
                  const na = { x: v.y, y: -v.x }
                  const nb = { x: -v.y, y: v.x }
                  const n =
                    norm2(subst(add(p1, na), center)) >
                    norm2(subst(add(p1, nb), center))
                      ? na
                      : nb
                  const f1 = 0.25 + coefs.f1[i] * 0.25
                  const f2 = f1 * 0.8
                  const f3 = coefs.f3[i] * 0.1
                  const p4 = add(p3, scale(n, f1))
                  const rp4 = subst(p4, p1)
                  const rp2 = subst(p2, p4)
                  const n0 = add(scale(n, f2), scale(v, f3))
                  const n1 = add(rp4, scale({ x: n.y, y: -n.x }, f2))
                  const n2 = scale({ x: -n.y, y: n.x }, f2)
                  const n3 = add(rp2, add(scale(n, f2), scale(v, -f3)))
                  if (i === 0) {
                    d.push(`M ${p1.x} ${p1.y}`)
                  }
                  d.push(`c ${n0.x} ${n0.y} ${n1.x} ${n1.y} ${rp4.x} ${rp4.y}`)
                  d.push(`c ${n2.x} ${n2.y} ${n3.x} ${n3.y} ${rp2.x} ${rp2.y}`)
                  return d
                }, [])
                .join(' ')
            }
            stroke={border.color}
            strokeWidth={border.width}
            {...dash}
          />
          <rect
            x={-0.25 * delta}
            y={-0.25 * delta}
            width={innerSize.width + 0.5 * delta}
            height={innerSize.height + 0.5 * delta}
            fill='none'
            stroke='none'
          />
        </g>
      </defs>
      {shadow.color ? (
        <use href={`#${id}`} filter='url(#shadow)' fill={shadow.color} />
      ) : null}
      <use href={`#${id}`} fill={backgroundColor} />
    </svg>
  )
}
