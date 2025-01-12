import { InterpolationStrategy, LineStrategy } from './enums'
import type {
  BoundingCurves,
  GridDefinitionWithDefaults,
  InterpolatePointOnCurve,
  Point,
  Step,
  UnprocessedSteps,
} from './types'
import { mapObj } from './utils/functional'
import {
  isArray,
  isFunction,
  isInt,
  isNil,
  isNumber,
  isPlainObj,
  isUndefined,
} from './utils/is'
import { roundTo5 } from './utils/math'
import { isPixelNumberString } from './utils/regexp'
import { getPixelStringNumericComponent } from './utils/steps'

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const validateFunction = (func: Function, name: string): void => {
  if (!isFunction(func)) {
    throw new Error(`${name} must be a function`)
  }
}

export const validateT = (t: number): void => {
  if (t < 0 || t > 1) {
    throw new Error(`t value must be between 0 and 1, but was '${t}'`)
  }
}

export const validateColumnNumber = (value: number): void => {
  if (value < 0) {
    throw new Error(
      `If column is a number, it must be a positive integer, but was '${value}'`
    )
  }
}

const validateStep = ({ value }: Step): void => {
  if (isNumber(value)) {
    validateColumnNumber(value)
  } else if (isPixelNumberString(value)) {
    const numericPortion = getPixelStringNumericComponent(value)
    validateColumnNumber(numericPortion)
  } else {
    throw new Error(
      `A step value must be a non-negative number or a pixel string, but it was '${value}'`
    )
  }
}

const validateColumn = (value: string | number | Step): void => {
  if (isNumber(value)) {
    validateColumnNumber(value)
  } else if (isPixelNumberString(value)) {
    const numericPortion = getPixelStringNumericComponent(value)
    validateColumnNumber(numericPortion)
  } else if (isPlainObj(value)) {
    validateStep(value)
  } else {
    throw new Error(
      `A column value must be a non-negative number or a pixel string, but it was '${value}'`
    )
  }
}

const validateRow = (value: string | number | Step): void => {
  if (isNumber(value)) {
    validateColumnNumber(value)
  } else if (isPixelNumberString(value)) {
    const numericPortion = getPixelStringNumericComponent(value)
    validateColumnNumber(numericPortion)
  } else if (isPlainObj(value)) {
    validateStep(value)
  } else {
    throw new Error(
      `A row value must be a non-negative number or a pixel string, but it was '${value}'`
    )
  }
}

const validateColumnsAndRows = (
  columns: UnprocessedSteps,
  rows: UnprocessedSteps
): void => {
  if (isInt(columns)) {
    validateColumnNumber(columns)
  } else if (isArray(columns)) {
    columns.map((column: string | number | Step) => {
      validateColumn(column)
    }, columns)
  } else {
    throw new Error(
      `columns must be an integer or an array, but it was '${columns}'`
    )
  }

  if (isInt(rows)) {
    validateColumnNumber(rows)
  } else if (isArray(rows)) {
    rows.map((column: string | number | Step) => {
      validateRow(column)
    }, columns)
  } else {
    throw new Error(
      `rows must be an integer or an array, but it was '${columns}'`
    )
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

export const validateGutterNumber = (gutter: number): void => {
  if (gutter < 0) {
    throw new Error(`Gutter must be a positive number, but was '${gutter}'`)
  }
}

export const validateGutter = (gutter: number | string): void => {
  if (isNumber(gutter)) {
    validateGutterNumber(gutter)
  } else if (isPixelNumberString(gutter)) {
    const numericPortion = getPixelStringNumericComponent(gutter)
    validateGutterNumber(numericPortion)
  } else {
    throw new Error(
      `Gutter must be a number, or a pixel string, but was '${gutter}'`
    )
  }
}

export const validateGrid = (
  gridDefinition: GridDefinitionWithDefaults
): void => {
  const {
    rows,
    columns,
    gutter,
    interpolationStrategy,
    lineStrategy,
    precision,
  } = gridDefinition

  if (isNil(columns)) {
    throw new Error(`You must supply grid.columns(Array or Int)`)
  }

  if (!isArray(columns) && !isInt(columns)) {
    throw new Error(
      `grid.columns must be an Int, an Array of Ints and/or pixel strings, or an Array of objects`
    )
  }

  if (isNil(rows)) {
    throw new Error(`You must supply grid.rows(Array or Int)`)
  }

  if (!isArray(rows) && !isInt(rows)) {
    throw new Error(
      `grid.rows must be an Int, an Array of Ints and/or pixel strings, or an Array of objects`
    )
  }

  if (!isNil(gutter)) {
    if (isArray(gutter)) {
      if (gutter.length > 2) {
        throw new Error(
          `if grid.gutters is an Array it must have a length of 1 or 2`
        )
      }
      gutter.map(validateGutter)
    } else {
      if (!isNumber(gutter) && !isPixelNumberString(gutter)) {
        throw new Error(
          `grid.gutters must be an Int, a string, or an Array of Ints and/or pixel-strings`
        )
      }
      validateGutter(gutter)
    }
  }

  if (!isUndefined(interpolationStrategy)) {
    if (isFunction(interpolationStrategy)) {
      validateFunction(interpolationStrategy, `interpolationStrategy`)
    } else if (isArray(interpolationStrategy)) {
      validateFunction(interpolationStrategy[0], `interpolationStrategyU`)
      validateFunction(interpolationStrategy[1], `interpolationStrategyV`)
    } else {
      const possibleValues = Object.values(InterpolationStrategy)
      if (!possibleValues.includes(interpolationStrategy)) {
        throw new Error(
          `Interpolation strategy '${interpolationStrategy}' is not recognised. Must be one of '${possibleValues}'`
        )
      }
    }
  }

  if (!isUndefined(lineStrategy)) {
    if (isArray(lineStrategy)) {
      validateFunction(lineStrategy[0], `lineStrategyU`)
      validateFunction(lineStrategy[1], `lineStrategyV`)
    } else {
      const possibleValues = Object.values(LineStrategy)
      if (!possibleValues.includes(lineStrategy)) {
        throw new Error(
          `Line strategy '${lineStrategy}' is not recognised. Must be one of '${possibleValues}'`
        )
      }
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
  columns: Step[],
  rows: Step[]
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

export const validateGetIntersectionsArguments = (
  boundingCurves: BoundingCurves,
  columns: UnprocessedSteps,
  rows: UnprocessedSteps,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
): void => {
  validateBoundingCurves(boundingCurves)
  validateColumnsAndRows(columns, rows)
  validateFunction(interpolatePointOnCurveU, `interpolatePointOnCurveU`)
  validateFunction(interpolatePointOnCurveV, `interpolatePointOnCurveV`)
}
