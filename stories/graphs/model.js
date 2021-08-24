import { seq } from '../../src/utils'

export const W = 600
export const H = 200
export const COUNT = 50
export const step = W / COUNT
const colors = ['red', 'black', 'blue', 'green']
export const model = colors.map((color, index) => {
  const points = [...seq(0, COUNT)].map(x => ({
    x: x * step,
    y: Math.round(H * (0.1 + Math.random() * 0.8))
  }))
  return {
    id: `line-${index}`,
    color,
    points,
    extremum: points.reduce(
      (acc, pt) => {
        const { y } = pt
        if (y < acc.ymin) {
          acc.ymin = y
        }
        if (y > acc.ymax) {
          acc.ymax = y
        }
        return acc
      },
      {
        ymin: Number.POSITIVE_INFINITY,
        ymax: Number.NEGATIVE_INFINITY
      }
    ),
    coordinates: { x: 0, y: 0 },
    pinned: false,
    keyboard: false
  }
})
