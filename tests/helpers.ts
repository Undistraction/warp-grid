import { mapObj } from '../src/utils/functional'
import { isArray, isNumber, isPlainObj } from '../src/utils/is'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const roundTo = (value: number, precision: number): number =>
  Math.round(value * 10 ** precision) / 10 ** precision

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const clone = (value: object) => JSON.parse(JSON.stringify(value))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const roundDeep = (obj: any, precision = 10): any => {
  if (isNumber(obj)) return roundTo(obj, precision)
  if (isArray(obj)) return obj.map((v) => roundDeep(v, precision))
  if (isPlainObj(obj)) return mapObj((v) => roundDeep(v, precision), obj)
  return obj
}
