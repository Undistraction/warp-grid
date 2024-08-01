import { describe, expect, test } from 'vitest'
import {
  isArray,
  isInt,
  isNil,
  isNull,
  isNumber,
  isPlainObj,
  isString,
  isUndefined,
} from '../../src/utils/is'

describe(`types`, () => {
  describe('isInt', () => {
    test('returns true if argument is an int', () => {
      expect(isInt(0)).toBeTruthy()
      expect(isInt(-7)).toBeTruthy()
      expect(isInt(7)).toBeTruthy()
    })

    test('returns false if argument is not an int', () => {
      expect(isInt(null)).toBeFalsy()
      expect(isInt(undefined)).toBeFalsy()
      expect(isInt()).toBeFalsy()
      expect(isInt(NaN)).toBeFalsy()
      expect(isInt(true)).toBeFalsy()
      expect(isInt(false)).toBeFalsy()
      expect(isInt(0.1)).toBeFalsy()
      expect(isInt(-0.1)).toBeFalsy()
      expect(isInt([])).toBeFalsy()
      expect(isInt({})).toBeFalsy()
      expect(isInt()).toBeFalsy()
      expect(isInt(`abc`)).toBeFalsy()
      expect(isInt(``)).toBeFalsy()
      expect(isInt(/abc/)).toBeFalsy()
      expect(isInt(() => {})).toBeFalsy()
    })
  })

  describe('isNumber', () => {
    test('returns true if argument is an int', () => {
      expect(isNumber(0)).toBeTruthy()
      expect(isNumber(-7)).toBeTruthy()
      expect(isNumber(7)).toBeTruthy()
      expect(isNumber(0.1)).toBeTruthy()
      expect(isNumber(-0.1)).toBeTruthy()
    })

    test('returns false if argument is not an int', () => {
      expect(isNumber(null)).toBeFalsy()
      expect(isNumber(undefined)).toBeFalsy()
      expect(isNumber()).toBeFalsy()
      expect(isNumber(NaN)).toBeFalsy()
      expect(isNumber(true)).toBeFalsy()
      expect(isNumber(false)).toBeFalsy()
      expect(isNumber([])).toBeFalsy()
      expect(isNumber({})).toBeFalsy()
      expect(isNumber()).toBeFalsy()
      expect(isNumber(`abc`)).toBeFalsy()
      expect(isNumber(``)).toBeFalsy()
      expect(isNumber(/abc/)).toBeFalsy()
      expect(isNumber(() => {})).toBeFalsy()
    })
  })

  describe('isUndefined', () => {
    test('returns true if argument is undefined', () => {
      expect(isUndefined()).toBeTruthy()
      expect(isUndefined(undefined)).toBeTruthy()
    })

    test('returns false if argument is not undefined', () => {
      expect(isUndefined(null)).toBeFalsy()
      expect(isUndefined(NaN)).toBeFalsy()
      expect(isUndefined(true)).toBeFalsy()
      expect(isUndefined(false)).toBeFalsy()
      expect(isUndefined(`abc`)).toBeFalsy()
      expect(isUndefined(``)).toBeFalsy()
      expect(isUndefined(/abc/)).toBeFalsy()
      expect(isUndefined(0.1)).toBeFalsy()
      expect(isUndefined(1)).toBeFalsy()
      expect(isUndefined([])).toBeFalsy()
      expect(isUndefined({})).toBeFalsy()
      expect(isUndefined(() => {})).toBeFalsy()
    })
  })

  describe('isNull', () => {
    test('returns true if argument is null', () => {
      expect(isNull(null)).toBeTruthy()
    })

    test('returns false if argument is not null', () => {
      expect(isNull()).toBeFalsy()
      expect(isNull(undefined)).toBeFalsy()
      expect(isNull(NaN)).toBeFalsy()
      expect(isNull(true)).toBeFalsy()
      expect(isNull(false)).toBeFalsy()
      expect(isNull([])).toBeFalsy()
      expect(isNull({})).toBeFalsy()
      expect(isNull(``)).toBeFalsy()
      expect(isNull(`abc`)).toBeFalsy()
      expect(isNull(/abc/)).toBeFalsy()
      expect(isNull(0.1)).toBeFalsy()
      expect(isNull(1)).toBeFalsy()
      expect(isNull(() => {})).toBeFalsy()
    })
  })

  describe('isNil', () => {
    test('returns true if argument is null or undefined', () => {
      expect(isNil(null)).toBeTruthy()
      expect(isNil(undefined)).toBeTruthy()
      expect(isNil()).toBeTruthy()
    })

    test('returns false if argument is not null or undefined', () => {
      expect(isNil(NaN)).toBeFalsy()
      expect(isNil(true)).toBeFalsy()
      expect(isNil(false)).toBeFalsy()
      expect(isNil(`abc`)).toBeFalsy()
      expect(isNil(``)).toBeFalsy()
      expect(isNil(/abc/)).toBeFalsy()
      expect(isNil(0.1)).toBeFalsy()
      expect(isNil(1)).toBeFalsy()
      expect(isNil([])).toBeFalsy()
      expect(isNil({})).toBeFalsy()
      expect(isNil(() => {})).toBeFalsy()
    })
  })

  describe('isString', () => {
    test('returns true if argument is a String', () => {
      expect(isString('')).toBeTruthy()
      expect(isString('abc')).toBeTruthy()
      expect(isString(new String('abc'))).toBeTruthy()
    })

    test('returns false if argument is not null', () => {
      expect(isString(null)).toBeFalsy()
      expect(isString(undefined)).toBeFalsy()
      expect(isString()).toBeFalsy()
      expect(isString(NaN)).toBeFalsy()
      expect(isString(true)).toBeFalsy()
      expect(isString(false)).toBeFalsy()
      expect(isString(/abc/)).toBeFalsy()
      expect(isString(0.1)).toBeFalsy()
      expect(isString(1)).toBeFalsy()
      expect(isString([])).toBeFalsy()
      expect(isString({})).toBeFalsy()
      expect(isString(() => {})).toBeFalsy()
    })
  })

  describe('isArray', () => {
    test('returns true if argument is Array', () => {
      expect(isArray([])).toBeTruthy()
      expect(isArray(new Array('abc'))).toBeTruthy()
    })

    test('returns false if argument is not Array', () => {
      expect(isArray()).toBeFalsy()
      expect(isArray(null)).toBeFalsy()
      expect(isArray(undefined)).toBeFalsy()
      expect(isArray()).toBeFalsy()
      expect(isArray(NaN)).toBeFalsy()
      expect(isArray(true)).toBeFalsy()
      expect(isArray(false)).toBeFalsy()
      expect(isArray(``)).toBeFalsy()
      expect(isArray(123)).toBeFalsy()
      expect(isArray(/abc/)).toBeFalsy()
      expect(isArray({})).toBeFalsy()
      expect(isArray(() => {})).toBeFalsy()
    })
  })

  describe('isPlainObj', () => {
    test('returns true if argument is Array', () => {
      expect(isPlainObj({})).toBeTruthy()
      expect(isPlainObj(new Object())).toBeTruthy()
    })

    test('returns false if argument is not Array', () => {
      expect(isPlainObj()).toBeFalsy()
      expect(isPlainObj(null)).toBeFalsy()
      expect(isPlainObj(undefined)).toBeFalsy()
      expect(isPlainObj()).toBeFalsy()
      expect(isPlainObj(NaN)).toBeFalsy()
      expect(isPlainObj(true)).toBeFalsy()
      expect(isPlainObj(false)).toBeFalsy()
      expect(isPlainObj(``)).toBeFalsy()
      expect(isPlainObj(123)).toBeFalsy()
      expect(isPlainObj([])).toBeFalsy()
      expect(isPlainObj(/abc/)).toBeFalsy()
      expect(isPlainObj(() => {})).toBeFalsy()
    })
  })
})
