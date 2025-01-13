/* eslint-disable @typescript-eslint/no-explicit-any */
// These are very general-purpose functions, so any is appropriate here.

import type { ObjectWithStringKeys } from '../types'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const times = (f: (i: number) => any, n: number): any[] => {
  const result = []
  for (let i = 0; i < n; i++) {
    result.push(f(i))
  }
  return result
}

// The values of each object key will be the same as the return value of f (T)
export const mapObj = <T, R = Record<string, T>>(
  f: (value: any, key: string, idx: number) => T,
  o: ObjectWithStringKeys
): R => {
  return Object.keys(o).reduce((acc, key, idx) => {
    const value = o[key]
    return {
      ...acc,
      [key]: f(value, key, idx),
    }
  }, {}) as R
}
