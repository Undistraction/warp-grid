import { InterpolationStrategy, LineStrategy } from './enums'
import { ValidationError } from './errors/ValidationError'
import getApi from './getGridApi'
import {
  interpolateCurveU,
  interpolateCurveV,
} from './interpolate/curves/curved'
import {
  interpolateStraightLineU,
  interpolateStraightLineV,
} from './interpolate/curves/straight'
import interpolatePointOnCurveEvenlySpacedEasedFactory from './interpolate/pointOnCurve/interpolatePointOnCurveEvenlySpacedEasedFactory'
import interpolatePointOnCurveLinearEasedFactory from './interpolate/pointOnCurve/interpolatePointOnCurveLinearEasedFactory'
import type {
  BezierEasing,
  BoundingCurves,
  GridDefinition,
  GridDefinitionWithDefaults,
  InterpolateLineU,
  InterpolateLineV,
  InterpolatePointOnCurve,
  InterpolatePointOnCurveFactory,
  WarpGrid,
} from './types'
import { isArray, isFunction } from './utils/is'
import { getNonGutterSteps, processSteps } from './utils/steps'
import { validateBoundingCurves, validateGridDefinition } from './validation'
// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const interpolatePointOnCurveFactory = (
  [interpolatePointOnCurveUFactory, interpolatePointOnCurveVFactory]: [
    InterpolatePointOnCurveFactory,
    InterpolatePointOnCurveFactory,
  ],
  bezierEasing: BezierEasing,
  precision: number
): [InterpolatePointOnCurve, InterpolatePointOnCurve] => {
  return [
    interpolatePointOnCurveUFactory({
      precision,
      bezierEasing: bezierEasing.xAxis,
    }),
    interpolatePointOnCurveVFactory({
      precision,
      bezierEasing: bezierEasing.yAxis,
    }),
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
        interpolatePointOnCurveEvenlySpacedEasedFactory,
        interpolatePointOnCurveEvenlySpacedEasedFactory,
      ],
      bezierEasing,
      precision
    )
  }

  if (interpolationStrategy === InterpolationStrategy.LINEAR) {
    return interpolatePointOnCurveFactory(
      [
        interpolatePointOnCurveLinearEasedFactory,
        interpolatePointOnCurveLinearEasedFactory,
      ],
      bezierEasing,
      precision
    )
  }

  throw new ValidationError(
    `Unknown interpolation strategy: '${interpolationStrategy}'`
  )
}

const getLineStrategy = ({
  lineStrategy,
}: GridDefinitionWithDefaults): [InterpolateLineU, InterpolateLineV] => {
  const interpolateLineU =
    lineStrategy === LineStrategy.CURVES
      ? interpolateCurveU
      : interpolateStraightLineU
  const interpolateLineV =
    lineStrategy === LineStrategy.CURVES
      ? interpolateCurveV
      : interpolateStraightLineV

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
 * @param {GridDefinition} gridDefinition - The definition of the grid, including
 * columns, rows, and gutter.
 * @returns {WarpGrid} The warp grid model and associated API functions.
 */
const warpGrid = (
  boundingCurves: BoundingCurves,
  gridDefinition: GridDefinition
): WarpGrid => {
  // Don't destructure arg so we can pass it around as is
  const gridDefinitionWithDefaults = mergeWithDefaults(gridDefinition)
  validateBoundingCurves(boundingCurves)
  validateGridDefinition(gridDefinitionWithDefaults)

  const { gutter } = gridDefinitionWithDefaults

  const gutterArray: [number | string, number | string] = isArray(gutter)
    ? gutter
    : [gutter, gutter]

  const [columns, rows] = [
    { steps: gridDefinitionWithDefaults.columns, gutter: gutterArray[0] },
    { steps: gridDefinitionWithDefaults.rows, gutter: gutterArray[1] },
  ].map(processSteps)

  // Get functions for interpolation based on grid config
  const [interpolatePointOnCurveU, interpolatePointOnCurveV] =
    getInterpolationStrategy(gridDefinitionWithDefaults)
  const [interpolateLineU, interpolateLineV] = getLineStrategy(
    gridDefinitionWithDefaults
  )

  const api = getApi(boundingCurves, columns, rows, {
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
      columnsNonGutter: getNonGutterSteps(columns),
      rowsNonGutter: getNonGutterSteps(rows),
    },
    ...api,
  }
}

export default warpGrid
