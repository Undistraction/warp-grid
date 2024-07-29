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
import { isInt, isPlainObj } from './types'
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
    spacing.push({ value: 1 })
  }
  return spacing
}

const processSteps = (steps) =>
  steps.map((step) => {
    if (isPlainObj(step)) {
      return step
    } else {
      return {
        value: step,
      }
    }
  })

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const getCoonsPatch = (boundingCurves, grid) => {
  validateBoundingCurves(boundingCurves)
  validateGrid(grid)

  const columns = isInt(grid.columns)
    ? buildStepSpacing(grid.columns)
    : processSteps(grid.columns)

  const rows = isInt(grid.rows)
    ? buildStepSpacing(grid.rows)
    : processSteps(grid.rows)

  console.log('@columns', columns)
  console.log('@rows', rows)

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
