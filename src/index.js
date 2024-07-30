import {
  interpolateCurveOnXAxis,
  interpolateCurveOnYAxis,
  interpolatePointOnCurveEvenlySpaced,
  interpolatePointOnCurveLinear,
  interpolateStraightLineOnXAxis,
  interpolateStraightLineOnYAxis,
} from 'coons-patch'
import { INTERPOLATION_STRATEGY_ID, LINE_STRATEGY_ID } from './const'
import getApi from './getApi'
import { processSteps } from './utils/steps'
import { validateBoundingCurves, validateGrid } from './validation'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const getWarpGrid = (boundingCurves, definition) => {
  // Don't destructure arg so we can pass it around as is
  const definitionWithDefaults = {
    ...{
      gutter: 0,
      interpolationStrategy: INTERPOLATION_STRATEGY_ID.EVEN,
      precision: 20,
      lineStrategy: LINE_STRATEGY_ID.STRAIGHT_LINES,
    },
    ...definition,
  }

  validateBoundingCurves(boundingCurves)
  validateGrid(definitionWithDefaults)

  const { gutter } = definitionWithDefaults

  const [columns, rows] = [
    definitionWithDefaults.columns,
    definitionWithDefaults.rows,
  ].map(processSteps(gutter))

  // Get functions for interpolation based on grid config
  const interpolatePointOnCurve = getInterpolationStrategy(
    definitionWithDefaults
  )
  const [interpolateLineOnXAxis, interpolateLineOnYAxis] = getLineStrategy(
    definitionWithDefaults
  )

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

export default getWarpGrid
