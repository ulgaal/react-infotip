import { useEffect, useRef, useCallback } from 'react'
import ResizeObserver from 'resize-observer-polyfill'

const useResizeObserver = (ref, callback) => {
  // Wire a resize observer to the callback
  const resizeObserverRef = useRef(null)
  if (!resizeObserverRef.current) {
    resizeObserverRef.current = new ResizeObserver(entries => {
      callback(entries[0])
    })
  }
  const resizeObserver = resizeObserverRef.current

  useEffect(() => {
    resizeObserver.observe(ref.current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [ref, resizeObserver])

  const update = useCallback(
    newRef => {
      resizeObserver.unobserve(ref.current)
      resizeObserver.observe(newRef)
    },
    [ref, resizeObserver]
  )
  return update
}

export default useResizeObserver
