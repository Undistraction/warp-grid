// -----------------------------------------------------------------------------
// Re-export Types
// -----------------------------------------------------------------------------

export { CellBoundsOrder, InterpolationStrategy, LineStrategy } from './enums'
export type {
  BezierEasing,
  BezierEasingParams,
  BoundingCurves,
  Curve,
  GetAllCellBoundsProps,
  GridApi,
  GetCellBoundsConfig,
  GetPointProps,
  GridDefinition,
  GridModel,
  InterpolateLineU,
  InterpolateLineV,
  InterpolatePointOnCurve,
  InterpolatePointOnCurveFactory,
  LinesByAxis,
  Point,
  Step,
  StepDefinition,
  WarpGrid,
} from './types'

// -----------------------------------------------------------------------------
// Re-export Interpolation functions
// -----------------------------------------------------------------------------

export { default as interpolatePointOnCurveEvenlySpacedFactory } from './interpolate/pointOnCurve/interpolatePointOnCurveEvenlySpacedEasedFactory'
export { default as interpolatePointOnCurveLinearFactory } from './interpolate/pointOnCurve/interpolatePointOnCurveLinearEasedFactory'

// -----------------------------------------------------------------------------
// Re-export API
// -----------------------------------------------------------------------------

export { default } from './api'
