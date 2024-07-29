import { mapObj } from './functional'
import { roundTo5 } from './math'
import { isArray, isInt, isNil, isPlainObj } from './types'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const getPointsAreSame = (point1, point2) => {
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

export const validateT = (ratio) => {
  if (ratio < 0 || ratio > 1) {
    throw new Error(`Ratio must be between 0 and 1, but was '${ratio}'`)
  }
}

export const validateCornerPoints = (boundingCurves) => {
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

export const validateBoundingCurves = (boundingCurves) => {
  if (isNil(boundingCurves)) {
    throw new Error('You must supply boundingCurves(Object)')
  }

  if (!isPlainObj(boundingCurves)) {
    throw new Error('boundingCurves must be an object')
  }

  validateCornerPoints(boundingCurves)
}

export const validateGrid = (grid) => {
  if (isNil(grid)) {
    throw new Error('You must supply a grid(Object)')
  }

  if (isNil(grid.columns)) {
    throw new Error('You must supply grid.columns(Array or Int)')
  }

  if (!isArray(grid.columns) && !isInt(grid.columns)) {
    throw new Error('grid.columns must be an Array of Ints or Int')
  }

  if (isNil(grid.rows)) {
    throw new Error('You must supply grid.rows(Array or Int)')
  }

  if (!isArray(grid.rows) && !isInt(grid.rows)) {
    throw new Error(
      'grid.rows must be an Int, an Array of Ints, or an Array of objects'
    )
  }
}

export const validateGetSquareArguments = (x, y, columns, rows) => {
  const columnCount = columns.length
  const rowCount = rows.length
  if (x >= columnCount || y >= rowCount) {
    throw new Error(
      `Grid is '${columnCount}' x '${rowCount}' but you passed x:'${x}' and y:'${y}'`
    )
  }
}
