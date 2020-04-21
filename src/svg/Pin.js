import React from 'react'
/**
 * `Pin` is an internal component to draw an SVG pin symbol
 */
const Pin = props => {
  const { pinned, onClick, className } = props
  const styling = className
    ? { className: `${className}-pin` }
    : { style: { stroke: 'none', fill: 'black' } }
  return (
    <svg
      width='12px'
      height='12px'
      viewBox='-1000 -850 1000 1000'
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
    >
      <g transform='scale(-1,-1)' {...styling}>
        {pinned ? (
          <path
            d='M966 450q0 -34 -18 -52l-36 -36q-18 -18 -52 -18q-28 0 -65 14l-138 -138q13 -45 13 -90t-14 -84t-44 -69l-28 -28q-22 -22 -62 -22q-41 0 -93 22t-108 63l58 57q45 -32 84 -47t62 -15q0 21 -10.5 49.5t-29 60.5t-44 65.5t-55.5 63.5q-36 36 -71.5 62t-67 43t-57.5 25.5
        t-43 8.5q0 -30 28 -87.5t85 -121.5l48 49q12 12 29 12t28.5 -11.5t11.5 -28.5t-12 -29l-283 -282q-12 -12 -28 -12q-17 0 -28.5 11.5t-11.5 28.5q0 16 12 28l176 178q-64 71 -99.5 140.5t-35.5 121.5q0 40 22 62l28 28q30 30 69 44.5t84 14.5q42 0 90 -14l138 138
        q-14 37 -14 66q0 33 18 51l36 36q18 18 52 18q35 0 77 -18t83.5 -48t80.5 -69t69 -80.5t48 -83.5t18 -77zM726 671q-32 24 -60 39l-226 -226q15 -8 30.5 -18t29.5 -21z'
          />
        ) : (
          <path
            d='M117 472q21 21 47.5 34.5t56.5 19.5l445 -445q-6 -30 -19.5 -56.5t-34.5 -47.5l-28 -28q-22 -22 -62 -22q-41 0 -93 22t-108 63l58 57q45 -32 84 -47t62 -15q0 21 -10.5 49.5t-29 60.5t-44 65.5t-55.5 63.5q-36 36 -71.5 62t-67 43t-57.5 25.5t-43 8.5q0 -30 28 -87.5
        t85 -121.5l48 49q12 12 29 12t28.5 -11.5t11.5 -28.5t-12 -29l-283 -282q-12 -12 -28 -12q-17 0 -28.5 11.5t-11.5 28.5q0 16 12 28l176 178q-64 71 -99.5 140.5t-35.5 121.5q0 40 22 62zM698 261l255 -255l-57 -57l-784 784l58 57l231 -232l97 97q-14 37 -14 66q0 33 18 51
        l36 36q18 18 52 18q35 0 77 -18t83.5 -48t80.5 -69t69 -80.5t48 -83.5t18 -77q0 -34 -18 -52l-36 -36q-18 -18 -52 -18q-28 0 -65 14zM458 502l49 -50l219 219q-32 24 -60 39z'
          />
        )}
      </g>
    </svg>
  )
}
export const areEqual = (prev, next) => {
  return prev.pinned === next.pinned
}
export default React.memo(Pin, areEqual)
