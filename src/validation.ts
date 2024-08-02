import {
  BoundingCurves,
  GridDefinitionWithDefaults,
  InterpolationStrategy,
  LineStrategy,
  Point,
  Steps,
} from './types'
import { mapObj } from './utils/functional'
import { isArray, isInt, isNil, isPlainObj, isUndefined } from './utils/is'
import { roundTo5 } from './utils/math'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const getPointsAreSame = (point1: Point, point2: Point): boolean => {
  // Round the points to 5 decimal places to avoid rounding issues where the
  // values are fractionally different
  const roundedPoint1 = mapObj(roundTo5, point1)
  const roundedPoint2 = mapObj(roundTo5, point2)

  return (
    roundedPoint1.x === roundedPoint2.x && roundedPoint1.y === roundedPoint2.y
  )
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const validateT = (t: number): void => {
  if (t < 0 || t > 1) {
    throw new Error(`t value must be between 0 and 1, but was '${t}'`)
  }
}

export const validateCornerPoints = (boundingCurves: BoundingCurves): void => {
  if (
    !getPointsAreSame(
      boundingCurves.top.startPoint,
      boundingCurves.left.startPoint
    )
  ) {
    throw new Error(
      `top curve startPoint and left curve startPoint must have same coordinates`
    )
  }

  if (
    !getPointsAreSame(
      boundingCurves.bottom.startPoint,
      boundingCurves.left.endPoint
    )
  ) {
    throw new Error(
      `bottom curve startPoint and left curve endPoint must have the same coordinates`
    )
  }

  if (
    !getPointsAreSame(
      boundingCurves.top.endPoint,
      boundingCurves.right.startPoint
    )
  ) {
    throw new Error(
      `top curve endPoint and right curve startPoint must have the same coordinates`
    )
  }
  if (
    !getPointsAreSame(
      boundingCurves.bottom.endPoint,
      boundingCurves.right.endPoint
    )
  ) {
    throw new Error(
      `bottom curve endPoint and right curve endPoint must have the same coordinates`
    )
  }
}

export const validateBoundingCurves = (
  boundingCurves: BoundingCurves
): void => {
  if (isNil(boundingCurves)) {
    throw new Error(`You must supply boundingCurves(Object)`)
  }

  if (!isPlainObj(boundingCurves)) {
    throw new Error(`boundingCurves must be an object`)
  }

  validateCornerPoints(boundingCurves)
}

export const validateGrid = (
  gridDefinition: GridDefinitionWithDefaults
): void => {
  const { rows, columns, interpolationStrategy, lineStrategy, precision } =
    gridDefinition

  if (isNil(columns)) {
    throw new Error(`You must supply grid.columns(Array or Int)`)
  }

  if (!isArray(columns) && !isInt(columns)) {
    throw new Error(`grid.columns must be an Array of Ints or Int`)
  }

  if (isNil(rows)) {
    throw new Error(`You must supply grid.rows(Array or Int)`)
  }

  if (!isArray(rows) && !isInt(rows)) {
    throw new Error(
      `grid.rows must be an Int, an Array of Ints, or an Array of objects`
    )
  }

  if (!isUndefined(interpolationStrategy)) {
    const possibleValues = Object.values(InterpolationStrategy)
    if (!possibleValues.includes(interpolationStrategy)) {
      throw new Error(
        `Interpolation strategy '${interpolationStrategy}' is not recognised. Must be one of '${possibleValues}'`
      )
    }
  }

  if (!isUndefined(lineStrategy)) {
    const possibleValues = Object.values(LineStrategy)
    if (!possibleValues.includes(lineStrategy)) {
      throw new Error(
        `Line strategy '${lineStrategy}' is not recognised. Must be one of '${possibleValues}'`
      )
    }
  }

  if (!isUndefined(precision)) {
    if (!isInt(precision) || precision < 1) {
      throw new Error(
        `Precision must be a positive integer greater than 0, but was '${precision}'`
      )
    }
  }
}

export const validateGetPointArguments = (u: number, v: number): void => {
  if (u < 0 || u > 1) {
    throw new Error(`u value must be between 0 and 1, but was '${u}'`)
  }

  if (v < 0 || v > 1) {
    throw new Error(`v value must be between 0 and 1, but was '${v}'`)
  }
}

export const validateGetSquareArguments = (
  x: number,
  y: number,
  columns: Steps,
  rows: Steps
): void => {
  const columnCount = columns.length
  const rowCount = rows.length

  if (x < 0 || y < 0) {
    throw new Error(
      `Coordinates must not be negative. You supplied x:'${x}' x y:'${y}'`
    )
  }

  if (x >= columnCount) {
    throw new Error(
      `Grid is '${columnCount}' columns wide but coordinates are zero-based, and you passed x:'${x}'`
    )
  }

  if (y >= rowCount) {
    throw new Error(
      `Grid is '${rowCount}' rows high but coordinates are zero-based, and you passed y:'${y}'`
    )
  }
}
