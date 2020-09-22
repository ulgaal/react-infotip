/*
Copyright 2020 Ulrich Gaal

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
