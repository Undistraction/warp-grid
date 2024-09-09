import { interpolatePointOnCurveLinear } from 'coons-patch'

import getApi from './getGridApi'
import {
  interpolateCurveU,
  interpolateCurveV,
} from './interpolate/curves/curved'
import {
  interpolateStraightLineU,
  interpolateStraightLineV,
} from './interpolate/curves/straight'
import interpolatePointOnCurveEvenlySpacedEased from './interpolate/pointOnCurve/interpolatePointOnCurveEvenlySpacedEased'
import {
  BoundingCurves,
  GridDefinition,
  GridDefinitionWithDefaults,
  InterpolateLineU,
  InterpolateLineV,
  InterpolatePointOnCurve,
  InterpolationStrategy,
  LineStrategy,
  WarpGrid,
} from './types'
import { isArray, isNumber } from './utils/is'
import { processSteps } from './utils/steps'
import { validateBoundingCurves, validateGrid } from './validation'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const getInterpolationStrategy = ({
  interpolationStrategy = InterpolationStrategy.EVEN,
  precision,
  bezierEasing,
}: GridDefinitionWithDefaults): [
  InterpolatePointOnCurve,
  InterpolatePointOnCurve,
] => {
  if (isArray(interpolationStrategy)) {
    return interpolationStrategy
  }

  if (interpolationStrategy === InterpolationStrategy.EVEN) {
    const interpolatePointOnCurveU = interpolatePointOnCurveEvenlySpacedEased({
      precision,
      bezierEasing: bezierEasing.u,
    })

    const interpolatePointOnCurveV = interpolatePointOnCurveEvenlySpacedEased({
      precision,
      bezierEasing: bezierEasing.v,
    })
    return [interpolatePointOnCurveU, interpolatePointOnCurveV]
  }

  if (interpolationStrategy === InterpolationStrategy.LINEAR) {
    return [interpolatePointOnCurveLinear, interpolatePointOnCurveLinear]
  }

  throw new Error(`Unknown interpolation strategy: '${interpolationStrategy}'`)
}

const getLineStrategy = ({
  lineStrategy,
}: GridDefinitionWithDefaults): [InterpolateLineU, InterpolateLineV] => {
  if (isArray(lineStrategy)) {
    return lineStrategy
  }

  const interpolateLineU =
    lineStrategy === LineStrategy.CURVES
      ? interpolateCurveV
      : interpolateStraightLineV
  const interpolateLineV =
    lineStrategy === LineStrategy.CURVES
      ? interpolateCurveU
      : interpolateStraightLineU

  return [interpolateLineU, interpolateLineV]
}

const mergeWithDefaults = (
  definition: GridDefinition
): GridDefinitionWithDefaults => {
  return {
    ...{
      gutter: 0,
      interpolationStrategy: InterpolationStrategy.EVEN,
      precision: 20,
      lineStrategy: LineStrategy.STRAIGHT_LINES,
      bezierEasing: {
        u: [0, 0, 1, 1],
        v: [0, 0, 1, 1],
      },
    },
    ...definition,
  } as GridDefinitionWithDefaults
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

/**
 * Generates a warp grid based on the provided bounding curves and grid
 * definition.
 *
 * @param {BoundingCurves} boundingCurves - The curves that define the
 * boundaries of the grid.
 * @param {GridDefinition} definition - The definition of the grid, including
 * columns, rows, and gutter.
 * @returns {WarpGrid} The warp grid model and associated API functions.
 */
const warpGrid = (
  boundingCurves: BoundingCurves,
  definition: GridDefinition
): WarpGrid => {
  // Don't destructure arg so we can pass it around as is
  const definitionWithDefaults = mergeWithDefaults(definition)
  validateBoundingCurves(boundingCurves)
  validateGrid(definitionWithDefaults)

  const { gutter } = definitionWithDefaults

  const gutterArray: [number, number] = isNumber(gutter)
    ? [gutter, gutter]
    : gutter

  const [columns, rows] = [
    { steps: definitionWithDefaults.columns, gutter: gutterArray[0] },
    { steps: definitionWithDefaults.rows, gutter: gutterArray[1] },
  ].map(processSteps)

  // Get functions for interpolation based on grid config
  const [interpolatePointOnCurveU, interpolatePointOnCurveV] =
    getInterpolationStrategy(definitionWithDefaults)
  const [interpolateLineU, interpolateLineV] = getLineStrategy(
    definitionWithDefaults
  )

  const api = getApi(boundingCurves, columns, rows, gutterArray, {
    interpolatePointOnCurveU,
    interpolatePointOnCurveV,
    interpolateLineU,
    interpolateLineV,
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

export default warpGrid
