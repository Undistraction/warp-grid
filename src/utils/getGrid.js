import memoize from 'fast-memoize'
import { INTERPOLATION_STRATEGY_ID, LINE_STRATEGY_ID } from '../const'
import { getPointOnSurface } from './coons'
import { interpolatePointOnCurveEvenlySpaced } from './interpolate/even'
import { interpolatePointOnCurveLinear } from './interpolate/linear'
import {
  getCurveOnXAxis,
  getCurveOnYAxis,
  getGridIntersections,
  getLinesOnXAxis,
  getLinesOnYAxis,
  getStraightLineOnXAxis,
  getStraightLineOnYAxis,
} from './surface'
import { isInt, isPlainObj } from './types'
import {
  validateBoundingCurves,
  validateGetPointArguments,
  validateGetSquareArguments,
  validateGrid,
} from './validation'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const expandToSteps = (stepCount) => {
  const spacing = []
  for (let idx = 0; idx < stepCount; idx++) {
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

const insertGutters = (steps, gutter = 0) => {
  const lastStepIndex = steps.length - 1
  const hasGutter = gutter > 0
  return steps.reduce((acc, step, idx) => {
    const isLastStep = idx === lastStepIndex
    // Insert a gutter step if we have gutters and are not the last step
    return isLastStep || !hasGutter
      ? [...acc, step]
      : [...acc, step, { value: gutter, isGutter: true }]
  }, [])
}

const getInterpolationStrategy = ({
  interpolationStrategy = INTERPOLATION_STRATEGY_ID.EVEN,
  precision,
}) => {
  if (interpolationStrategy === INTERPOLATION_STRATEGY_ID.EVEN) {
    return interpolatePointOnCurveEvenlySpaced({ precision })
  }

  if (interpolationStrategy === INTERPOLATION_STRATEGY_ID.LINEAR) {
    return interpolatePointOnCurveLinear
  }
}

const getLineStrategy = ({ lineStrategy }) => {
  const getLineOnXAxis =
    lineStrategy === LINE_STRATEGY_ID.CURVES
      ? getCurveOnYAxis
      : getStraightLineOnYAxis
  const getLineOnYAxis =
    lineStrategy === LINE_STRATEGY_ID.CURVES
      ? getCurveOnXAxis
      : getStraightLineOnXAxis

  return [getLineOnXAxis, getLineOnYAxis]
}

const prepareSteps = (gutter) => (steps) => {
  const stepsProcessed = isInt(steps)
    ? expandToSteps(steps)
    : processSteps(steps)
  return insertGutters(stepsProcessed, gutter)
}

const stepIsNotGutter = (step) => !step.isGutter

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const getGrid = (boundingCurves, grid) => {
  validateBoundingCurves(boundingCurves)
  validateGrid(grid)

  const { gutter } = grid

  const [columns, rows] = [grid.columns, grid.rows].map(prepareSteps(gutter))

  // Choose the function to use for interpolating the location of a point on a
  // curve.
  const interpolatePointOnCurve = getInterpolationStrategy(grid)

  const [getLineOnXAxis, getLineOnYAxis] = getLineStrategy(grid)

  const getPoint = memoize((ratioX, ratioY) => {
    validateGetPointArguments(ratioX, ratioY)
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
        getLineOnXAxis,
        interpolatePointOnCurve
      ),
      yAxis: getLinesOnYAxis(
        boundingCurves,
        columns,
        rows,
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

    const g = grid.gutter > 0 ? 2 : 1

    return {
      top: xAxis[y * g][x],
      bottom: xAxis[y * g + 1][x],
      left: yAxis[x * g][y],
      right: yAxis[x * g + 1][y],
    }
  })

  const getAllGridCellBounds = () => {
    // We only want to run through steps that are not gutters so we filter both
    // rows and columns first
    return columns.filter(stepIsNotGutter).reduce((acc, column, columnIdx) => {
      const cellBounds = rows.filter(stepIsNotGutter).map((row, rowIdx) => {
        return getGridCellBounds(columnIdx, rowIdx)
      })
      return [...acc, ...cellBounds]
    }, [])
  }

  return {
    config: {
      boundingCurves,
      columns: columns,
      rows: rows,
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

export default getGrid
