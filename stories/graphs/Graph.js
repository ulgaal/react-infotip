import { useMemo, useRef, useContext, useCallback } from 'react'
import {
  MergingConfigProvider,
  Source,
  ConfigContext,
  Pinnable,
  styles
} from '../../src'
import {
  MultiLineChartContext,
  KEYBOARD,
  KEY_DOWN,
  MOUSE_MOVE,
  COPY
} from './multiLineChartReducer'
import CurveTipWrapper from './CurveTipWrapper'
import { toViewport } from './chartUtils'
import { COUNT, W } from './model'
import './Graph.css'

const Graph = props => {
  const {
    index,
    graph: { color, points, keyboard, location }
  } = props
  const config = useContext(ConfigContext)
  const dispatch = useContext(MultiLineChartContext)
  const ref = useRef(null)

  // Use to track arrow-key events on the chart
  const inputRef = useRef(null)
  const handleKeyDown = useCallback(
    event => {
      const { key } = event
      dispatch({ type: KEY_DOWN, index, key, rect: ref.current })
    },
    [dispatch, index, ref]
  )
  const handleKeyboard = useCallback(
    event => {
      event.preventDefault()
      event.stopPropagation()
      const { current } = inputRef
      if (current) {
        current.focus()
      }
      dispatch({ type: KEYBOARD, index, value: !keyboard })
    },
    [inputRef, index, keyboard]
  )
  const handleMouseEnter = useCallback(
    () => {
      const { current } = inputRef
      if (current) {
        current.focus()
      }
    },
    [inputRef]
  )
  const handleCopy = useCallback(
    event => {
      event.preventDefault()
      event.stopPropagation()
      dispatch({ type: COPY, index })
    },
    [index]
  )

  const curveConfig = useMemo(
    () => ({
      position: {
        my: 'top-left',
        container: '.multi-line-chart-container'
      },
      show: {
        delay: 105
      },
      hide: {
        delay: 100
      },
      wrapper: Pinnable,
      wrapperProps: { style: styles.lightStyle }
    }),
    []
  )
  const viewportClass = `viewport-${index}`
  const pointConfig = useMemo(() => {
    return {
      position: {
        my: 'bottom-left',
        container: '.multi-line-chart-container',
        viewport: `.${viewportClass}`,
        adjust: {
          method: {
            flip: ['bottom-left', 'bottom-right', 'top-left', 'top-right']
          },
          mouse: keyboard
            ? false
            : position => {
              const rect = ref.current
              const svg = rect.ownerSVGElement

              // Retrieve the point point closest to the mouse point
              const ctm = rect.getScreenCTM()
              const pos = svg.createSVGPoint()
              pos.x = position.x
              pos.y = position.y
              const pos2 = pos.matrixTransform(ctm.inverse())
              const ptIndex = Math.max(
                0,
                Math.min(Math.floor((pos2.x * COUNT) / W), COUNT - 1)
              )

              // Compte the location of the tooltip
              const vpc = toViewport(rect, points[ptIndex])
              const { x, y } = vpc
              Promise.resolve().then(() => {
                // Update position asynchonously since one cannot
                // update Graph when rendering tooltip
                // https://fb.me/setstate-in-render
                dispatch({
                  type: MOUSE_MOVE,
                  index,
                  ptIndex,
                  location: {
                    left: x,
                    top: y
                  }
                })
              })
              return vpc
            }
        }
      },
      show: {
        delay: 105
      },
      hide: {
        delay: 100
      },
      wrapper: CurveTipWrapper,
      wrapperProps: {
        wrapper: config.wrapper,
        keyboard,
        onKeyboard: handleKeyboard,
        onCopy: handleCopy
      }
    }
  }, [viewportClass, keyboard])
  const kbdConfig = keyboard
    ? { config: { position: { adjust: { location } } } }
    : {}
  return (
    <div className='graph' onMouseEnter={handleMouseEnter}>
      <MergingConfigProvider value={curveConfig}>
        <div className='graph-title'>
          <Source id={`ti@${index}`}>
            <span style={{ color }}>{color}</span> graph
          </Source>
        </div>
      </MergingConfigProvider>
      <MergingConfigProvider value={pointConfig}>
        <div className='graph-container'>
          <svg
            className={viewportClass}
            width='600px'
            height='200px'
            style={{ border: `2px solid ${color}` }}
          >
            <Source id={`cu@${index}`} svg {...kbdConfig}>
              <rect
                x={0}
                y={0}
                width={600}
                height={200}
                style={{ fill: 'white', stroke: 'none' }}
                ref={ref}
              />
              <path
                style={{ stroke: color, fill: 'none' }}
                d={points
                  .map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x},${y}`)
                  .join(' ')}
              />
            </Source>
          </svg>
          {
            keyboard
              ? <div className='graph-hint'>Use ← and → keys to select next/previous point</div>
              : null
          }
        </div>
      </MergingConfigProvider>
      <input
        className='graph-input'
        ref={inputRef}
        type='text'
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

export default Graph
