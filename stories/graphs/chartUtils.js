export const toViewport = (rect, coordinates) => {
  const ctm = rect.getScreenCTM()
  const svg = rect.ownerSVGElement
  const svgRect = svg.getBoundingClientRect()
  const { x, y } = coordinates
  return {
    x: svgRect.left + x + window.scrollX,
    y: ctm.f + y + window.scrollY
  }
}

export const noEvent = event => {
  event.stopPropagation()
  event.preventDefault()
}
