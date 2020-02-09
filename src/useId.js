import { useRef } from 'react'
let counter = 0
export const useId = () => {
  const id = useRef(null)
  if (!id.current) {
    id.current = counter++
  }
  return id.current
}
