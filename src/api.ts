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
import interpolatePointOnCurveLinearEased from './interpolate/pointOnCurve/interpolatePointOnCurveLinearEased'
import {
  BezierEasing,
  BoundingCurves,
  GridDefinition,
  GridDefinitionWithDefaults,
  InterpolateLineU,
  InterpolateLineV,
  InterpolatePointOnCurve,
  InterpolatePointOnCurveFactory,
  InterpolationStrategy,
  LineStrategy,
  WarpGrid,
} from './types'
import { isArray, isFunction, isNumber } from './utils/is'
import { processSteps } from './utils/steps'
import { validateBoundingCurves, validateGrid } from './validation'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const interpolatePointOnCurveFactory = (
  [interpolatePointOnCurveU, interpolatePointOnCurveV]: [
    InterpolatePointOnCurveFactory,
    InterpolatePointOnCurveFactory,
  ],
  bezierEasing: BezierEasing,
  precision: number
): [InterpolatePointOnCurve, InterpolatePointOnCurve] => {
  return [
    interpolatePointOnCurveU({ precision, bezierEasing: bezierEasing.xAxis }),
    interpolatePointOnCurveV({ precision, bezierEasing: bezierEasing.yAxis }),
  ]
}

const getInterpolationStrategy = ({
  interpolationStrategy = InterpolationStrategy.EVEN,
  precision,
  bezierEasing,
}: GridDefinitionWithDefaults): [
  InterpolatePointOnCurve,
  InterpolatePointOnCurve,
] => {
  if (isFunction(interpolationStrategy)) {
    return interpolatePointOnCurveFactory(
      [interpolationStrategy, interpolationStrategy],
      bezierEasing,
      precision
    )
  }

  if (isArray(interpolationStrategy)) {
    return interpolatePointOnCurveFactory(
      interpolationStrategy,
      bezierEasing,
      precision
    )
  }

  if (interpolationStrategy === InterpolationStrategy.EVEN) {
    return interpolatePointOnCurveFactory(
      [
        interpolatePointOnCurveEvenlySpacedEased,
        interpolatePointOnCurveEvenlySpacedEased,
      ],
      bezierEasing,
      precision
    )
  }

  if (interpolationStrategy === InterpolationStrategy.LINEAR) {
    return interpolatePointOnCurveFactory(
      [interpolatePointOnCurveLinearEased, interpolatePointOnCurveLinearEased],
      bezierEasing,
      precision
    )
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
      bezierEasing: {
        xAxis: [0, 0, 1, 1],
        yAxis: [0, 0, 1, 1],
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
