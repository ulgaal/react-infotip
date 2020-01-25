import React, { useRef } from 'react'
import { parseBorder, parseBoxShadow } from '../css'
import { seq } from '../utils'
import { useId } from '../useId'

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

const randomCoefs = folds => ({
  l: [...seq(0, folds)].map(() => Math.random()),
  f1: [...seq(0, folds)].map(() => Math.random()),
  f3: [...seq(0, folds)].map(() => Math.random())
})

/**
 * `CloudShape` is an internal SVG component used to display the outline
 * of the `Cloud` component
 */
export const CloudShape = props => {
  // console.log('CloudShape', props)
  if (!props.metrics) {
    return null
  }

  const {
    my,
    metrics: { innerSize, size, tail, folds },
    style
  } = props

  // Generate a set of random coefficients dependent on
  // the number of folds
  const coefsRef = useRef(null)
  const foldsRef = useRef(null)
  if (folds !== foldsRef.current) {
    coefsRef.current = randomCoefs(folds)
    foldsRef.current = folds
  }
  const coefs = coefsRef.current

  // Because SVG `<defs>` elements are used internally,
  // generate a new id to uniquely identify that set of `<defs>`.
  const shapeid = useId()
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
