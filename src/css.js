/*
Copyright 2019 Ulrich Gaal

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
// css.js
// ========
const borderExpr = /^\s*((\d*)px\s+)?(none|solid|dotted|dashed)(?:\s+(\S+)\s*)?$/
export const parseBorder = border => {
  borderExpr.lastIndex = 0
  const [, , width, style, color] = borderExpr.exec(border) || []
  return { width: width !== undefined ? +width : undefined, style, color }
}
const shadowExpr = /^\s*((\d*)px\s+)((\d*)px\s+)(\S+)\s*$/
export const parseBoxShadow = boxShadow => {
  const [, , dx, , dy, color] = shadowExpr.exec(boxShadow) || []
  return {
    dx: dx !== undefined ? +dx : undefined,
    dy: dy !== undefined ? +dy : undefined,
    color
  }
}
const borderRadiusExpr = /^\s*(?:(\d*)px)(?:\s+(?:(\d*)px)(?:\s+(?:(\d*)px)\s+(?:(\d*)px))?)?\s*$/
export const parseBorderRadius = borderRadius => {
  const [, r1, r2, r3, r4] = borderRadiusExpr.exec(borderRadius) || []
  return r1 === undefined
    ? { top: undefined, right: undefined, bottom: undefined, left: undefined }
    : r2 === undefined
    ? { top: +r1, right: +r1, bottom: +r1, left: +r1 }
    : r3 === undefined
    ? { top: +r2, right: +r1, bottom: +r2, left: +r1 }
    : { top: +r1, right: +r2, bottom: +r3, left: +r4 }
}
