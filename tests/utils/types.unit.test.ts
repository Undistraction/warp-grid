import { describe, expect, it } from 'vitest'

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

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const func = () => {
  // no-op
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe(`types`, () => {
  describe(`isInt`, () => {
    it(`returns true if argument is an int`, () => {
      expect(isInt(0)).toBeTruthy()
      expect(isInt(-7)).toBeTruthy()
      expect(isInt(7)).toBeTruthy()
    })

    it(`returns false if argument is not an int`, () => {
      expect(isInt(null)).toBeFalsy()
      expect(isInt(undefined)).toBeFalsy()
      expect(isInt(NaN)).toBeFalsy()
      expect(isInt(true)).toBeFalsy()
      expect(isInt(false)).toBeFalsy()
      expect(isInt(0.1)).toBeFalsy()
      expect(isInt(-0.1)).toBeFalsy()
      expect(isInt([])).toBeFalsy()
      expect(isInt({})).toBeFalsy()
      expect(isInt(`abc`)).toBeFalsy()
      expect(isInt(``)).toBeFalsy()
      expect(isInt(/abc/)).toBeFalsy()
      expect(isInt(func)).toBeFalsy()
    })
  })

  describe(`isNumber`, () => {
    it(`returns true if argument is an int`, () => {
      expect(isNumber(0)).toBeTruthy()
      expect(isNumber(-7)).toBeTruthy()
      expect(isNumber(7)).toBeTruthy()
      expect(isNumber(0.1)).toBeTruthy()
      expect(isNumber(-0.1)).toBeTruthy()
    })

    it(`returns false if argument is not an int`, () => {
      expect(isNumber(null)).toBeFalsy()
      expect(isNumber(undefined)).toBeFalsy()
      expect(isNumber(NaN)).toBeFalsy()
      expect(isNumber(true)).toBeFalsy()
      expect(isNumber(false)).toBeFalsy()
      expect(isNumber([])).toBeFalsy()
      expect(isNumber({})).toBeFalsy()
      expect(isNumber(`abc`)).toBeFalsy()
      expect(isNumber(``)).toBeFalsy()
      expect(isNumber(/abc/)).toBeFalsy()
      expect(isNumber(func)).toBeFalsy()
    })
  })

  describe(`isUndefined`, () => {
    it(`returns true if argument is undefined`, () => {
      expect(isUndefined(undefined)).toBeTruthy()
    })

    it(`returns false if argument is not undefined`, () => {
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
      expect(isUndefined(func)).toBeFalsy()
    })
  })

  describe(`isNull`, () => {
    it(`returns true if argument is null`, () => {
      expect(isNull(null)).toBeTruthy()
    })

    it(`returns false if argument is not null`, () => {
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
      expect(isNull(func)).toBeFalsy()
    })
  })

  describe(`isNil`, () => {
    it(`returns true if argument is null or undefined`, () => {
      expect(isNil(null)).toBeTruthy()
      expect(isNil(undefined)).toBeTruthy()
    })

    it(`returns false if argument is not null or undefined`, () => {
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
      expect(isNil(func)).toBeFalsy()
    })
  })

  describe(`isString`, () => {
    it(`returns true if argument is a String`, () => {
      expect(isString(``)).toBeTruthy()
      expect(isString(`abc`)).toBeTruthy()
      expect(isString(new String(`abc`))).toBeTruthy()
    })

    it(`returns false if argument is not null`, () => {
      expect(isString(null)).toBeFalsy()
      expect(isString(undefined)).toBeFalsy()
      expect(isString(NaN)).toBeFalsy()
      expect(isString(true)).toBeFalsy()
      expect(isString(false)).toBeFalsy()
      expect(isString(/abc/)).toBeFalsy()
      expect(isString(0.1)).toBeFalsy()
      expect(isString(1)).toBeFalsy()
      expect(isString([])).toBeFalsy()
      expect(isString({})).toBeFalsy()
      expect(isString(func)).toBeFalsy()
    })
  })

  describe(`isArray`, () => {
    it(`returns true if argument is Array`, () => {
      expect(isArray([])).toBeTruthy()
      expect(isArray(new Array(`abc`))).toBeTruthy()
    })

    it(`returns false if argument is not Array`, () => {
      expect(isArray(null)).toBeFalsy()
      expect(isArray(undefined)).toBeFalsy()
      expect(isArray(NaN)).toBeFalsy()
      expect(isArray(true)).toBeFalsy()
      expect(isArray(false)).toBeFalsy()
      expect(isArray(``)).toBeFalsy()
      expect(isArray(123)).toBeFalsy()
      expect(isArray(/abc/)).toBeFalsy()
      expect(isArray({})).toBeFalsy()
      expect(isArray(func)).toBeFalsy()
    })
  })

  describe(`isPlainObj`, () => {
    it(`returns true if argument is Array`, () => {
      expect(isPlainObj({})).toBeTruthy()
      expect(isPlainObj(new Object())).toBeTruthy()
    })

    it(`returns false if argument is not Array`, () => {
      expect(isPlainObj(null)).toBeFalsy()
      expect(isPlainObj(undefined)).toBeFalsy()
      expect(isPlainObj(NaN)).toBeFalsy()
      expect(isPlainObj(true)).toBeFalsy()
      expect(isPlainObj(false)).toBeFalsy()
      expect(isPlainObj(``)).toBeFalsy()
      expect(isPlainObj(123)).toBeFalsy()
      expect(isPlainObj([])).toBeFalsy()
      expect(isPlainObj(/abc/)).toBeFalsy()
      expect(isPlainObj(func)).toBeFalsy()
    })
  })
})
