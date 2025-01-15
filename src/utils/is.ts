/* eslint-disable @typescript-eslint/no-explicit-any */
// These are very general-purpose functions, so any is appropriate here.

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const VALID_GUTTER_REGEXP = /^\d+(px)$/

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const isType = (type: string, value: any): boolean => typeof value === type

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const isBoolean = (value: any): value is boolean =>
  isType(`boolean`, value)

export const isArray = (value: any): value is any[] => Array.isArray(value)

export const isInt = (value: any): value is number => Number.isInteger(value)

export const isNumber = (value: any): value is number =>
  !isNaN(value) && isType(`number`, value)

export const isUndefined = (value: any): value is undefined =>
  isType(`undefined`, value)

export const isNull = (value: any): value is null => value === null

export const isNil = (value: any): value is null | undefined =>
  isUndefined(value) || isNull(value)

export const isString = (value: any): value is string =>
  isType(`string`, value) || value instanceof String

export const isPlainObj = (value: any): value is object =>
  !isNull(value) && isType(`object`, value) && value.constructor === Object

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const isFunction = (value: any): value is Function =>
  isType(`function`, value)
// Number followed by 'px'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const isPixelNumberString = (value: unknown) => {
  return isString(value) && VALID_GUTTER_REGEXP.test(value)
}
