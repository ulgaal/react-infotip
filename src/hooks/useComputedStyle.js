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
import { useRef } from 'react'

const camelToHyphen = str =>
  str.replace(
    /[A-Z]/,
    (match, offset) => (offset > 0 ? '-' : '') + match.toLowerCase()
  )

const useComputedStyle = (style, className) => {
  const styleRef = useRef(null)
  const classNameRef = useRef(null)
  const computedStyleRef = useRef(null)
  if (styleRef.current !== style || classNameRef.current !== className) {
    styleRef.current = style
    classNameRef.current = className
    const element = document.createElement('div')
    if (className) {
      element.className = className
    } else {
      for (const [key, value] of Object.entries(style || {})) {
        element.style[camelToHyphen(key)] = value
      }
    }
    document.body.appendChild(element)
    const computedStyle = window.getComputedStyle(element)
    computedStyleRef.current = {
      margin: {
        top: Math.round(parseFloat(computedStyle.marginTop)),
        right: Math.round(parseFloat(computedStyle.marginRight)),
        bottom: Math.round(parseFloat(computedStyle.marginBottom)),
        left: Math.round(parseFloat(computedStyle.marginLeft))
      },
      borderStyle: computedStyle.borderTopStyle,
      borderColor: computedStyle.borderTopColor,
      backgroundColor: computedStyle.backgroundColor,
      borderWidth: Math.round(parseFloat(computedStyle.borderTopWidth)),
      borderRadius: Math.round(parseFloat(computedStyle.borderTopLeftRadius))
    }
    document.body.removeChild(element)
  }
  return computedStyleRef.current
}

export default useComputedStyle
