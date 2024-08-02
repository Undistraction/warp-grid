import { describe, expect, it } from 'vitest'
import { mapObj } from '../../src/utils/functional'

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe(`mapObj`, () => {
  it(`return a new object with its values the result of applying the callback`, () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = mapObj((value) => value * 2, obj)
    expect(result).toEqual({ a: 2, b: 4, c: 6 })
  })

  it(`should pass the key as the second argument to the function`, () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = mapObj((value, key) => `key is ${key}`, obj)
    expect(result).toEqual({ a: `key is a`, b: `key is b`, c: `key is c` })
  })

  it(`should pass the index as the third argument to the function`, () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = mapObj((value, key, idx) => value + idx, obj)
    expect(result).toEqual({ a: 1, b: 3, c: 5 })
  })

  it(`should return an empty object if the input object has no keys`, () => {
    const obj = {}
    const result = mapObj((value) => value * 2, obj)
    expect(result).toEqual({})
  })

  it(`should not mutate the original object`, () => {
    const obj = { a: 1, b: 2, c: 3 }
    const originalObj = { ...obj }
    mapObj((value) => value * 2, obj)
    expect(obj).toEqual(originalObj)
  })
})
