import memoize from 'fast-memoize'
import { INTERPOLATION_STRATEGY_ID, LINE_STRATEGY_ID } from '../const'
import { interpolatePointOnCurveEvenlySpaced } from './interpolate/even'
import { interpolatePointOnCurveLinear } from './interpolate/linear'
import {
  getCurveOnXAxis,
  getCurveOnYAxis,
  getGridIntersections,
  getLinesOnXAxis,
  getLinesOnYAxis,
  getPointOnSurface,
  getStraightLineOnXAxis,
  getStraightLineOnYAxis,
} from './surface'
import { isArray } from './types'
import {
  validateBoundingCurves,
  validateGetSquareArguments,
  validateGrid,
} from './validation'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const buildStepSpacing = (v) => {
  const spacing = []
  for (let idx = 0; idx < v; idx++) {
    spacing.push(1)
  }
  return spacing
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const getCoonsPatch = (boundingCurves, grid) => {
  validateBoundingCurves(boundingCurves)
  validateGrid(grid)

  // Columns can be either an int, or an array containing ints, each
  // representing the width of that column. If the total widths are different to
  // the width of the shape described by the bounding curves, they will be
  // mapped to the the width of the shape, acting as ratios instead of absolute
  // widths. If the supplied value is an int, we create an array with a length
  // of the int, with a uniform value for each item.
  const columns = isArray(grid.columns)
    ? grid.columns
    : buildStepSpacing(grid.columns)

  // Rows can be either an int, or an array containing ints, each representing
  // the height of that column. If the total heights are different to the height
  // of the shape described by the bounding curves, they will be mapped to the
  // the height of the shape, acting as ratios instead of absolute heights. If
  // the supplied value is an int, we create an array with a length of the int,
  // with a uniform value for each item.
  const rows = isArray(grid.rows) ? grid.rows : buildStepSpacing(grid.rows)

  const gutter = grid.gutter

  // Choose the function to use for interpolating the location of a point on a
  // curve.
  const interpolatePointOnCurve =
    grid.interpolationStrategy === INTERPOLATION_STRATEGY_ID.LINEAR
      ? interpolatePointOnCurveLinear
      : // Default to even
        interpolatePointOnCurveEvenlySpaced({ precision: grid.precision })

  const getLineOnXAxis =
    grid.lineStrategy === LINE_STRATEGY_ID.CURVES
      ? getCurveOnYAxis
      : getStraightLineOnYAxis
  const getLineOnYAxis =
    grid.lineStrategy === LINE_STRATEGY_ID.CURVES
      ? getCurveOnXAxis
      : getStraightLineOnXAxis

  const getPoint = memoize((ratioX, ratioY) => {
    return getPointOnSurface(
      boundingCurves,
      ratioX,
      ratioY,
      interpolatePointOnCurve
    )
  })

  const getLines = memoize(() => {
    return {
      xAxis: getLinesOnXAxis(
        boundingCurves,
        columns,
        rows,
        gutter,
        getLineOnXAxis,
        interpolatePointOnCurve
      ),
      yAxis: getLinesOnYAxis(
        boundingCurves,
        columns,
        rows,
        gutter,
        getLineOnYAxis,
        interpolatePointOnCurve
      ),
    }
  })

  const getIntersections = memoize(() => {
    return getGridIntersections(
      boundingCurves,
      columns,
      rows,
      interpolatePointOnCurve
    )
  })

  // Get four curves that describe the bounds of the grid-square with the
  // supplied grid coordinates
  const getGridCellBounds = memoize((x, y) => {
    validateGetSquareArguments(x, y, columns, rows)

    const { xAxis, yAxis } = getLines()

    return {
      top: yAxis[y][x],
      bottom: yAxis[y + 1][x],
      left: xAxis[x][y],
      right: xAxis[x + 1][y],
    }
  })

  const getAllGridCellBounds = () => {
    return columns.reduce((acc, column, columnIdx) => {
      const cellBounds = rows.map((row, rowIdx) => {
        return getGridCellBounds(columnIdx, rowIdx)
      })
      return [...acc, ...cellBounds]
    }, [])
  }

  return {
    config: {
      boundingCurves,
      columns,
      rows,
    },
    api: {
      getPoint,
      getLines,
      getIntersections,
      getGridCellBounds,
      getAllGridCellBounds,
    },
  }
}

export default getCoonsPatch
