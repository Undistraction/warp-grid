import { jest } from '@jest/globals'
import { mapObj, times } from '../../src/utils/functional'

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe('times', () => {
  it('should call the callback n times', () => {
    const callback = jest.fn()
    const n = 5
    times(callback, n)
    expect(callback).toHaveBeenCalledTimes(n)
  })

  it('should pass the correct index to the callback', () => {
    const callback = jest.fn()
    const n = 5
    times(callback, n)
    expect(callback.mock.calls).toEqual([[0], [1], [2], [3], [4]])
  })

  it('should return an array of results from the callback', () => {
    const callback = jest.fn((i) => i * 2)
    const n = 5
    const result = times(callback, n)
    expect(result).toEqual([0, 2, 4, 6, 8])
  })

  it('should return an empty array if n is 0', () => {
    const callback = jest.fn()
    const n = 0
    const result = times(callback, n)
    expect(result).toEqual([])
    expect(callback).not.toHaveBeenCalled()
  })

  it('should return an empty array if n is negative', () => {
    const callback = jest.fn()
    const n = -5
    const result = times(callback, n)
    expect(result).toEqual([])
    expect(callback).not.toHaveBeenCalled()
  })
})

describe('mapObj', () => {
  it('return a new object with its values the result of applying the callback', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = mapObj((value) => value * 2, obj)
    expect(result).toEqual({ a: 2, b: 4, c: 6 })
  })

  it('should pass the index as the second argument to the function', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = mapObj((value, idx) => value + idx, obj)
    expect(result).toEqual({ a: 1, b: 3, c: 5 })
  })

  it('should return an empty object if the input object has no keys', () => {
    const obj = {}
    const result = mapObj((value) => value * 2, obj)
    expect(result).toEqual({})
  })

  it('should handle objects with non-numeric values', () => {
    const obj = { a: 'hello', b: 'world' }
    const result = mapObj((value) => value.toUpperCase(), obj)
    expect(result).toEqual({ a: 'HELLO', b: 'WORLD' })
  })

  it('should not mutate the original object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const originalObj = { ...obj }
    mapObj((value) => value * 2, obj)
    expect(obj).toEqual(originalObj)
  })
})
