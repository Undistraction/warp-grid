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

const attachGutter = (steps, gutter = 0) => {
  const lastStepIndex = steps.length - 1
  return steps.reduce((acc, step, idx) => {
    const isLastStep = idx === lastStepIndex
    return isLastStep || gutter === 0
      ? [...acc, step]
      : [...acc, step, { value: gutter, isGutter: true }]
  }, [])
}

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

  const columnsWithGutter = attachGutter(columns, grid.gutter)
  const rowsWithGutter = attachGutter(rows, grid.gutter)

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
        columnsWithGutter,
        rowsWithGutter,
        getLineOnXAxis,
        interpolatePointOnCurve
      ),
      yAxis: getLinesOnYAxis(
        boundingCurves,
        columnsWithGutter,
        rowsWithGutter,
        getLineOnYAxis,
        interpolatePointOnCurve
      ),
    }
  })

  const getIntersections = memoize(() => {
    return getGridIntersections(
      boundingCurves,
      columnsWithGutter,
      rowsWithGutter,
      interpolatePointOnCurve
    )
  })

  // Get four curves that describe the bounds of the grid-square with the
  // supplied grid coordinates
  const getGridCellBounds = memoize((x, y) => {
    validateGetSquareArguments(x, y, columnsWithGutter, rows)

    const { xAxis, yAxis } = getLines()

    const g = grid.gutter > 0 ? 2 : 1

    return {
      top: xAxis[y * g][x],
      bottom: xAxis[y * g + 1][x],
      left: yAxis[x * g][y],
      right: yAxis[x * g + 1][y],
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
      columns: columnsWithGutter,
      rows: rowsWithGutter,
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
