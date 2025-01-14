import { isString } from './is'

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

// Number followed by 'px'
const VALID_GUTTER_REGEXP = /^\d+(px)?$/

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const isPixelNumberString = (value: unknown): value is string =>
  isString(value) && VALID_GUTTER_REGEXP.test(value)
