import {
  interpolateCurveU,
  interpolateCurveV,
  interpolatePointOnCurveEvenlySpaced,
  interpolatePointOnCurveLinear,
  interpolateStraightLineU,
  interpolateStraightLineV,
} from 'coons-patch'
import getApi from './getGridApi'
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
import { processSteps } from './utils/steps'
import { validateBoundingCurves, validateGrid } from './validation'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const getInterpolationStrategy = ({
  interpolationStrategy = InterpolationStrategy.EVEN,
  precision,
}: GridDefinitionWithDefaults): InterpolatePointOnCurve => {
  if (interpolationStrategy === InterpolationStrategy.EVEN) {
    return interpolatePointOnCurveEvenlySpaced({ precision })
  }

  if (interpolationStrategy === InterpolationStrategy.LINEAR) {
    return interpolatePointOnCurveLinear
  }

  throw new Error(`Unknown interpolation strategy: '${interpolationStrategy}'`)
}

const getLineStrategy = ({
  lineStrategy,
}: GridDefinitionWithDefaults): [InterpolateLineU, InterpolateLineV] => {
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

  const [columns, rows] = [
    definitionWithDefaults.columns,
    definitionWithDefaults.rows,
  ].map(processSteps(gutter))

  // Get functions for interpolation based on grid config
  const interpolatePointOnCurve = getInterpolationStrategy(
    definitionWithDefaults
  )
  const [interpolateLineU, interpolateLineV] = getLineStrategy(
    definitionWithDefaults
  )

  const api = getApi(boundingCurves, columns, rows, gutter, {
    interpolatePointOnCurve,
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
