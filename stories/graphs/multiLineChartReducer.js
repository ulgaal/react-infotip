import { createContext } from 'react'
import { toViewport, copyTextToClipboard } from './chartUtils'
import { COUNT } from './model'

export const MOUSE_MOVE = 'MOUSE_MOVE'
export const KEY_DOWN = 'KEY_DOWN'
export const TIP = 'TIP'
export const KEYBOARD = 'KEYBOARD'
export const COPY = 'COPY'

export const MultiLineChartContext = createContext(null)
export const multiLineChartReducer = (state, action) => {
  const update = (index, obj) => {
    const { graphs } = state
    const newGraphs = [...graphs]
    newGraphs[index] = {
      ...graphs[index],
      ...obj
    }
    return { ...state, graphs: newGraphs }
  }

  const { type } = action
  switch (type) {
    case TIP: {
      const { tips } = action
      return { ...state, tips }
    }
    case MOUSE_MOVE: {
      const { index, ptIndex, location } = action
      return update(index, { ptIndex, location })
    }
    case KEYBOARD: {
      const { index, value } = action
      return update(index, { keyboard: value })
    }
    case KEY_DOWN: {
      const { index, key, rect } = action
      const { graphs } = state
      const { points, keyboard } = graphs[index]
      if (keyboard) {
        let { ptIndex } = graphs[index]
        if (key === 'ArrowLeft' && ptIndex > 0) {
          ptIndex--
        } else if (key === 'ArrowRight' && ptIndex < COUNT - 1) {
          ptIndex++
        } else {
          break
        }
        const { x, y } = toViewport(rect, points[ptIndex])
        const location = {
          left: x,
          top: y
        }
        return update(index, { ptIndex, location })
      }
      break
    }
    case COPY: {
      const { index } = action
      const { graphs } = state
      const { points, ptIndex } = graphs[index]
      const point = points[ptIndex]
      const { x, y } = point
      const text = `Coordinates:
  x:${x}
  y:${y}`
      copyTextToClipboard(text)

      return state
    }
  }
  return state
}
