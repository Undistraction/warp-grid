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
      expect(isInt(0)).toBeTrue()
      expect(isInt(-7)).toBeTrue()
      expect(isInt(7)).toBeTrue()
    })

    test('returns false if argument is not an int', () => {
      expect(isInt(null)).toBeFalse()
      expect(isInt(undefined)).toBeFalse()
      expect(isInt()).toBeFalse()
      expect(isInt(NaN)).toBeFalse()
      expect(isInt(true)).toBeFalse()
      expect(isInt(false)).toBeFalse()
      expect(isInt(0.1)).toBeFalse()
      expect(isInt(-0.1)).toBeFalse()
      expect(isInt([])).toBeFalse()
      expect(isInt({})).toBeFalse()
      expect(isInt()).toBeFalse()
      expect(isInt(`abc`)).toBeFalse()
      expect(isInt(``)).toBeFalse()
      expect(isInt(/abc/)).toBeFalse()
      expect(isInt(() => {})).toBeFalse()
    })
  })

  describe('isNumber', () => {
    test('returns true if argument is an int', () => {
      expect(isNumber(0)).toBeTrue()
      expect(isNumber(-7)).toBeTrue()
      expect(isNumber(7)).toBeTrue()
      expect(isNumber(0.1)).toBeTrue()
      expect(isNumber(-0.1)).toBeTrue()
    })

    test('returns false if argument is not an int', () => {
      expect(isNumber(null)).toBeFalse()
      expect(isNumber(undefined)).toBeFalse()
      expect(isNumber()).toBeFalse()
      expect(isNumber(NaN)).toBeFalse()
      expect(isNumber(true)).toBeFalse()
      expect(isNumber(false)).toBeFalse()
      expect(isNumber([])).toBeFalse()
      expect(isNumber({})).toBeFalse()
      expect(isNumber()).toBeFalse()
      expect(isNumber(`abc`)).toBeFalse()
      expect(isNumber(``)).toBeFalse()
      expect(isNumber(/abc/)).toBeFalse()
      expect(isNumber(() => {})).toBeFalse()
    })
  })

  describe('isUndefined', () => {
    test('returns true if argument is undefined', () => {
      expect(isUndefined()).toBeTrue()
      expect(isUndefined(undefined)).toBeTrue()
    })

    test('returns false if argument is not undefined', () => {
      expect(isUndefined(null)).toBeFalse()
      expect(isUndefined(NaN)).toBeFalse()
      expect(isUndefined(true)).toBeFalse()
      expect(isUndefined(false)).toBeFalse()
      expect(isUndefined(`abc`)).toBeFalse()
      expect(isUndefined(``)).toBeFalse()
      expect(isUndefined(/abc/)).toBeFalse()
      expect(isUndefined(0.1)).toBeFalse()
      expect(isUndefined(1)).toBeFalse()
      expect(isUndefined([])).toBeFalse()
      expect(isUndefined({})).toBeFalse()
      expect(isUndefined(() => {})).toBeFalse()
    })
  })

  describe('isNull', () => {
    test('returns true if argument is null', () => {
      expect(isNull(null)).toBeTrue()
    })

    test('returns false if argument is not null', () => {
      expect(isNull()).toBeFalse()
      expect(isNull(undefined)).toBeFalse()
      expect(isNull(NaN)).toBeFalse()
      expect(isNull(true)).toBeFalse()
      expect(isNull(false)).toBeFalse()
      expect(isNull([])).toBeFalse()
      expect(isNull({})).toBeFalse()
      expect(isNull(``)).toBeFalse()
      expect(isNull(`abc`)).toBeFalse()
      expect(isNull(/abc/)).toBeFalse()
      expect(isNull(0.1)).toBeFalse()
      expect(isNull(1)).toBeFalse()
      expect(isNull(() => {})).toBeFalse()
    })
  })

  describe('isNil', () => {
    test('returns true if argument is null or undefined', () => {
      expect(isNil(null)).toBeTrue()
      expect(isNil(undefined)).toBeTrue()
      expect(isNil()).toBeTrue()
    })

    test('returns false if argument is not null or undefined', () => {
      expect(isNil(NaN)).toBeFalse()
      expect(isNil(true)).toBeFalse()
      expect(isNil(false)).toBeFalse()
      expect(isNil(`abc`)).toBeFalse()
      expect(isNil(``)).toBeFalse()
      expect(isNil(/abc/)).toBeFalse()
      expect(isNil(0.1)).toBeFalse()
      expect(isNil(1)).toBeFalse()
      expect(isNil([])).toBeFalse()
      expect(isNil({})).toBeFalse()
      expect(isNil(() => {})).toBeFalse()
    })
  })

  describe('isString', () => {
    test('returns true if argument is a String', () => {
      expect(isString('')).toBeTrue()
      expect(isString('abc')).toBeTrue()
      expect(isString(new String('abc'))).toBeTrue()
    })

    test('returns false if argument is not null', () => {
      expect(isString(null)).toBeFalse()
      expect(isString(undefined)).toBeFalse()
      expect(isString()).toBeFalse()
      expect(isString(NaN)).toBeFalse()
      expect(isString(true)).toBeFalse()
      expect(isString(false)).toBeFalse()
      expect(isString(/abc/)).toBeFalse()
      expect(isString(0.1)).toBeFalse()
      expect(isString(1)).toBeFalse()
      expect(isString([])).toBeFalse()
      expect(isString({})).toBeFalse()
      expect(isString(() => {})).toBeFalse()
    })
  })

  describe('isArray', () => {
    test('returns true if argument is Array', () => {
      expect(isArray([])).toBeTrue()
      expect(isArray(new Array('abc'))).toBeTrue()
    })

    test('returns false if argument is not Array', () => {
      expect(isArray()).toBeFalse()
      expect(isArray(null)).toBeFalse()
      expect(isArray(undefined)).toBeFalse()
      expect(isArray()).toBeFalse()
      expect(isArray(NaN)).toBeFalse()
      expect(isArray(true)).toBeFalse()
      expect(isArray(false)).toBeFalse()
      expect(isArray(``)).toBeFalse()
      expect(isArray(123)).toBeFalse()
      expect(isArray(/abc/)).toBeFalse()
      expect(isArray({})).toBeFalse()
      expect(isArray(() => {})).toBeFalse()
    })
  })

  describe('isPlainObj', () => {
    test('returns true if argument is Array', () => {
      expect(isPlainObj({})).toBeTrue()
      expect(isPlainObj(new Object())).toBeTrue()
    })

    test('returns false if argument is not Array', () => {
      expect(isPlainObj()).toBeFalse()
      expect(isPlainObj(null)).toBeFalse()
      expect(isPlainObj(undefined)).toBeFalse()
      expect(isPlainObj()).toBeFalse()
      expect(isPlainObj(NaN)).toBeFalse()
      expect(isPlainObj(true)).toBeFalse()
      expect(isPlainObj(false)).toBeFalse()
      expect(isPlainObj(``)).toBeFalse()
      expect(isPlainObj(123)).toBeFalse()
      expect(isPlainObj([])).toBeFalse()
      expect(isPlainObj(/abc/)).toBeFalse()
      expect(isPlainObj(() => {})).toBeFalse()
    })
  })
})
