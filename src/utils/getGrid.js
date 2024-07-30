import { INTERPOLATION_STRATEGY_ID, LINE_STRATEGY_ID } from '../const'
import getApi from './getApi'
import {
  interpolateCurveOnXAxis,
  interpolateCurveOnYAxis,
} from './interpolate/curves/curved'
import {
  interpolateStraightLineOnXAxis,
  interpolateStraightLineOnYAxis,
} from './interpolate/curves/straight'
import { interpolatePointOnCurveEvenlySpaced } from './interpolate/pointOnCurve/even'
import { interpolatePointOnCurveLinear } from './interpolate/pointOnCurve/linear'
import { isInt, isPlainObj } from './types'
import { validateBoundingCurves, validateGrid } from './validation'

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
  const interpolateLineOnXAxis =
    lineStrategy === LINE_STRATEGY_ID.CURVES
      ? interpolateCurveOnYAxis
      : interpolateStraightLineOnYAxis
  const interpolateLineOnYAxis =
    lineStrategy === LINE_STRATEGY_ID.CURVES
      ? interpolateCurveOnXAxis
      : interpolateStraightLineOnXAxis

  return [interpolateLineOnXAxis, interpolateLineOnYAxis]
}

const prepareSteps = (gutter) => (steps) => {
  const stepsProcessed = isInt(steps)
    ? expandToSteps(steps)
    : processSteps(steps)
  return insertGutters(stepsProcessed, gutter)
}

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

  validateBoundingCurves(boundingCurves)
  validateGrid(gridWithDefaults)

  const { gutter } = gridWithDefaults

  const [columns, rows] = [gridWithDefaults.columns, gridWithDefaults.rows].map(
    prepareSteps(gutter)
  )

  // Get functions for interpolation based on grid config
  const interpolatePointOnCurve = getInterpolationStrategy(gridWithDefaults)
  const [interpolateLineOnXAxis, interpolateLineOnYAxis] =
    getLineStrategy(gridWithDefaults)

  const api = getApi(boundingCurves, columns, rows, gutter, {
    interpolatePointOnCurve,
    interpolateLineOnXAxis,
    interpolateLineOnYAxis,
  })

  return {
    model: {
      boundingCurves,
      columns: columns,
      rows: rows,
    },
    ...api,
  }
}

export default getGrid
