import { CellBoundsOrder, InterpolationStrategy, LineStrategy } from './enums'
import { ValidationError } from './errors/ValidationError'
import type {
  BoundingCurves,
  Curve,
  GetPointProps,
  GridDefinitionWithDefaults,
  Point,
  Step,
  UnprocessedSteps,
} from './types'
import { mapObj } from './utils/functional'
import {
  isArray,
  isBoolean,
  isFunction,
  isInt,
  isNil,
  isNumber,
  isPlainObj,
  isUndefined,
  isPixelNumberString,
} from './utils/is'
import { roundTo5 } from './utils/math'
import { getPixelStringNumericComponent } from './utils/steps'

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const CURVE_NAMES = [`top`, `right`, `bottom`, `left`]

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const getPointsAreSame = (point1: Point, point2: Point): boolean => {
  // Round the points to 5 decimal places before comparing to avoid rounding
  // issues where the values are fractionally different
  const roundedPoint1 = mapObj(roundTo5, point1)
  const roundedPoint2 = mapObj(roundTo5, point2)

  return (
    roundedPoint1.x === roundedPoint2.x && roundedPoint1.y === roundedPoint2.y
  )
}

const isValidPoint = (point: Point): point is Point =>
  isPlainObj(point) && isNumber(point.x) && isNumber(point.y)

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const validateCurve = (curve: Curve, name: string): void => {
  if (!isPlainObj(curve)) {
    throw new Error(`Curve '${name}' must be an object`)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const validateFunction = (func: Function, name: string): void => {
  if (!isFunction(func)) {
    throw new ValidationError(`${name} must be a function`)
  }
}

export const validateT = (t: number): void => {
  if (t < 0 || t > 1) {
    throw new ValidationError(`t value must be between 0 and 1, but was '${t}'`)
  }
}

export const validateStepNumber = (value: number): void => {
  if (value < 0) {
    throw new ValidationError(
      `If step is a number, it must be a positive integer, but was '${value}'`
    )
  }
}

const validatePixelString = (value: string): void => {
  const numericPortion = getPixelStringNumericComponent(value as string)
  validateStepNumber(numericPortion)
}

const validateStep = (value: number | string | Step): void => {
  if (isNumber(value)) {
    validateStepNumber(value)
  } else if (isPixelNumberString(value)) {
    validatePixelString(value as string)
  } else if (isPlainObj(value)) {
    validateStepObj(value)
  } else {
    throw new ValidationError(
      `A step value must be a non-negative number or a pixel string, but it was '${value}'`
    )
  }
}

const validateStepObj = (step: Step): void => {
  validateStep(step.value)
}

const validateColumnsAndRows = (
  columns: UnprocessedSteps,
  rows: UnprocessedSteps
): void => {
  if (isInt(columns)) {
    validateStepNumber(columns)
  } else if (isArray(columns)) {
    columns.map((column: string | number | Step) => {
      validateStep(column)
    }, columns)
  } else {
    throw new ValidationError(
      `columns must be an integer or an array, but it was '${columns}'`
    )
  }

  if (isInt(rows)) {
    validateStepNumber(rows)
  } else if (isArray(rows)) {
    rows.map((row: string | number | Step) => {
      validateStep(row)
    }, rows)
  } else {
    throw new ValidationError(
      `rows must be an integer or an array, but it was '${columns}'`
    )
  }
}

const validateStartAndEndPoints = (
  { startPoint, endPoint }: { startPoint: Point; endPoint: Point },
  name: string
): void => {
  if (!isValidPoint(startPoint)) {
    throw new Error(`Bounding curve '${name}' startPoint must be a valid point`)
  }
  if (!isValidPoint(endPoint)) {
    throw new Error(`Bounding curve '${name}' endPoint must be a valid point`)
  }
}

export const validateCurves = (boundingCurves: BoundingCurves): void => {
  CURVE_NAMES.map((name) => {
    const curve = boundingCurves[name as keyof BoundingCurves]
    validateCurve(curve, name)
    validateStartAndEndPoints(curve, name)
  })
}

export const validateCornerPoints = (boundingCurves: BoundingCurves): void => {
  if (
    !getPointsAreSame(
      boundingCurves.top.startPoint,
      boundingCurves.left.startPoint
    )
  ) {
    throw new ValidationError(
      `top curve startPoint and left curve startPoint must have same coordinates`
    )
  }

  if (
    !getPointsAreSame(
      boundingCurves.bottom.startPoint,
      boundingCurves.left.endPoint
    )
  ) {
    throw new ValidationError(
      `bottom curve startPoint and left curve endPoint must have the same coordinates`
    )
  }

  if (
    !getPointsAreSame(
      boundingCurves.top.endPoint,
      boundingCurves.right.startPoint
    )
  ) {
    throw new ValidationError(
      `top curve endPoint and right curve startPoint must have the same coordinates`
    )
  }
  if (
    !getPointsAreSame(
      boundingCurves.bottom.endPoint,
      boundingCurves.right.endPoint
    )
  ) {
    throw new ValidationError(
      `bottom curve endPoint and right curve endPoint must have the same coordinates`
    )
  }
}

export const validateBoundingCurves = (
  boundingCurves: BoundingCurves
): void => {
  if (isNil(boundingCurves)) {
    throw new ValidationError(`You must supply boundingCurves(Object)`)
  }

  if (!isPlainObj(boundingCurves)) {
    throw new ValidationError(`boundingCurves must be an object`)
  }
  validateCurves(boundingCurves)
  validateCornerPoints(boundingCurves)
}

export const validateGutterNumber = (gutter: number): void => {
  if (gutter < 0) {
    throw new ValidationError(
      `Gutter must be a positive number, but was '${gutter}'`
    )
  }
}

export const validateGutter = (gutter: number | string): void => {
  if (isNumber(gutter)) {
    validateGutterNumber(gutter)
  } else if (isPixelNumberString(gutter)) {
    const numericPortion = getPixelStringNumericComponent(gutter)
    validateGutterNumber(numericPortion)
  } else {
    throw new ValidationError(
      `Gutter must be a number, or a pixel string, but was '${gutter}'`
    )
  }
}

export const validateGridDefinition = (
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
    throw new ValidationError(`You must supply grid.columns(Array or Int)`)
  }

  if (!isArray(columns) && !isInt(columns)) {
    throw new ValidationError(
      `grid.columns must be an Int, an Array of Ints and/or pixel strings, or an Array of objects`
    )
  }

  if (isNil(rows)) {
    throw new ValidationError(`You must supply grid.rows(Array or Int)`)
  }

  if (!isArray(rows) && !isInt(rows)) {
    throw new ValidationError(
      `grid.rows must be an Int, an Array of Ints and/or pixel strings, or an Array of objects`
    )
  }

  validateColumnsAndRows(columns, rows)

  if (!isNil(gutter)) {
    if (isArray(gutter)) {
      if (gutter.length > 2) {
        throw new ValidationError(
          `if grid.gutters is an Array it must have a length of 1 or 2`
        )
      }
      gutter.map(validateGutter)
    } else {
      if (!isNumber(gutter) && !isPixelNumberString(gutter)) {
        throw new ValidationError(
          `grid.gutters must be an Int, a pixel-string, or an Array of Ints and/or pixel-strings`
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
        throw new ValidationError(
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
        throw new ValidationError(
          `Line strategy '${lineStrategy}' is not recognised. Must be one of '${possibleValues}'`
        )
      }
    }
  }

  if (!isUndefined(precision)) {
    if (!isInt(precision) || precision < 1) {
      throw new ValidationError(
        `Precision must be a positive integer greater than 0, but was '${precision}'`
      )
    }
  }

  // TODO: validate Bezier easing
}

export const validateGetPointArguments = (params: GetPointProps): void => {
  mapObj((value, name) => {
    if (value < 0 || value > 1) {
      throw new ValidationError(
        `${name} must be between 0 and 1, but was '${value}'`
      )
    }
  }, params)
}

export const validateGetGridSquareArguments = (
  x: number,
  y: number,
  columns: Step[],
  rows: Step[]
): void => {
  const columnCount = columns.length
  const rowCount = rows.length

  if (x < 0 || y < 0) {
    throw new ValidationError(
      `Coordinates must not be negative. You supplied x:'${x}' x y:'${y}'`
    )
  }

  if (x >= columnCount) {
    throw new ValidationError(
      `X is zero-based and cannot be greater than number of columns - 1. Grid is '${columnCount}' columns wide and you passed x:'${x}'`
    )
  }

  if (y >= rowCount) {
    throw new ValidationError(
      `Y is zero-based and cannot be greater than number of rows - 1. Grid is '${rowCount}' rows wide and you passed y:'${y}'`
    )
  }
}

export const validateGetAllCellBoundsArguments = (
  makeBoundsCurvesSequential: boolean,
  cellBoundsOrder: CellBoundsOrder
): void => {
  if (!isBoolean(makeBoundsCurvesSequential)) {
    throw new ValidationError(`makeBoundsCurvesSequential must be a boolean`)
  }

  if (!Object.values(CellBoundsOrder).includes(cellBoundsOrder)) {
    throw new ValidationError(
      `cellBoundsOrder must be one of ${Object.values(CellBoundsOrder)}`
    )
  }
}
