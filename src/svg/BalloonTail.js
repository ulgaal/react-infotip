import React from 'react'
import PropTypes from 'prop-types'
import { CornerType } from '../prop-types'
import { pixelize } from '../utils'

/**
 * `BalloonTail` is an internal SVG component used to display a tail
 * on the `Balloon`
 */
export const BalloonTail = props => {
  // console.log('BalloonTail', props)
  if (!props.metrics) {
    return null
  }
  const {
    my,
    metrics: {
      size,
      tail: { width: aw, height: ah }
    },
    style: {
      margin,
      borderWidth,
      borderColor,
      backgroundColor,
      borderRadius,
      borderStyle
    },
    className
  } = props
  const pathProps = {}
  switch (borderStyle) {
    case 'dotted':
      pathProps.strokeDasharray = `${borderWidth} ${borderWidth}`
      break
    case 'dashed':
      pathProps.strokeDasharray = `${3 * borderWidth} ${3 * borderWidth}`
      break
    default:
  }
  let pos = null // coordinate of the tail svg, not the same as the tail tip
  switch (my) {
    case 'top-left':
      pathProps.d = `M 0 ${ah} V 0 L ${aw * 0.5} ${ah}`
      pos = {
        left: margin.left + borderWidth + Math.max(borderRadius, 4),
        top: margin.top - ah + borderWidth
      }
      break
    case 'top-center':
      pathProps.d = `M 0 ${ah} L ${aw * 0.5} ${0} L ${aw} ${ah}`
      pos = {
        left: margin.left + 0.5 * (size.width - aw),
        top: margin.top - ah + borderWidth
      }
      break
    case 'top-right':
      pathProps.d = `M 0 ${ah} L ${aw * 0.5} ${0} V ${ah}`
      pos = {
        left: margin.left + size.width - Math.max(borderRadius, 4) - aw * 0.5,
        top: margin.top - ah + borderWidth
      }
      break
    case 'center-left':
      pathProps.d = `M ${aw} 0 L 0 ${ah * 0.5} L ${aw} ${ah}`
      pos = {
        left: margin.left - aw + borderWidth,
        top: margin.top + 0.5 * (size.height - ah)
      }
      break
    case 'center-right':
      pathProps.d = `M 0 0 L ${aw} ${ah * 0.5} L 0 ${ah}`
      pos = {
        left: margin.left + size.width - borderWidth,
        top: margin.top + 0.5 * (size.height - ah)
      }
      break
    case 'bottom-left':
      pathProps.d = `M 0 0 V ${ah} L ${aw * 0.5} 0`
      pos = {
        left: margin.left + borderWidth + Math.max(borderRadius, 4),
        top: margin.top + size.height - borderWidth
      }
      break
    case 'bottom-center':
      pathProps.d = `M 0 0 L ${aw * 0.5} ${ah} L ${aw} 0`
      pos = {
        left: margin.left + 0.5 * (size.width - aw),
        top: margin.top + size.height - borderWidth
      }
      break
    default:
    case 'bottom-right':
      pathProps.d = `M 0 0 L ${aw * 0.5} ${ah} V 0`
      pos = {
        left: margin.left + size.width - Math.max(borderRadius, 4) - aw * 0.5,
        top: margin.top + size.height - borderWidth
      }
      break
  }
  if (className) {
    pathProps.className = className
  } else {
    pathProps.fill = backgroundColor
    pathProps.stroke = borderColor
    pathProps.strokeWidth = borderWidth
  }
  return (
    <svg
      className='rit-svg-tail'
      width={`${aw}px`}
      height={`${ah}px`}
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        ...pixelize(pos)
      }}
    >
      {React.createElement('path', pathProps)}
    </svg>
  )
}

BalloonTail.propTypes = {
  my: CornerType,
  metrics: PropTypes.object,
  style: PropTypes.object,
  className: PropTypes.string
}

export const areEqual = (prev, next) => {
  return (
    prev.metrics === next.metrics &&
    prev.my === next.my &&
    prev.Style === next.style
  )
}

export default React.memo(BalloonTail, areEqual)
