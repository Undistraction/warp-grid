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

const insertGutters = (steps, gutter) => {
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
  // Don't destructure arg so we can pass it around as is
  const gridWithDefaults = {
    ...{
      gutter: 0,
      interpolationStrategy: INTERPOLATION_STRATEGY_ID.EVEN,
      precision: 20,
      lineStrategy: LINE_STRATEGY_ID.STRAIGHT_LINES,
    },
    ...grid,
  }
  console.log('BOUNDS', boundingCurves)
  console.log('GRID', gridWithDefaults)

  validateBoundingCurves(boundingCurves)
  validateGrid(gridWithDefaults)

  const { gutter } = gridWithDefaults

  const [columns, rows] = [gridWithDefaults.columns, gridWithDefaults.rows].map(
    prepareSteps(gutter)
  )

  // Choose the function to use for interpolating the location of a point on a
  // curve.
  const interpolatePointOnCurve = getInterpolationStrategy(gridWithDefaults)

  const [getLineOnXAxis, getLineOnYAxis] = getLineStrategy(gridWithDefaults)

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

    // If there is a gutter, we need to skip over the gutter space
    const gutterMultiplier = gutter > 0 ? 2 : 1

    return {
      top: xAxis[y * gutterMultiplier][x],
      bottom: xAxis[y * gutterMultiplier + 1][x],
      left: yAxis[x * gutterMultiplier][y],
      right: yAxis[x * gutterMultiplier + 1][y],
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
