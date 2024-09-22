// -----------------------------------------------------------------------------
// Re-export Types
// -----------------------------------------------------------------------------

export type {
  BezierEasing,
  BezierEasingParams,
  BoundingCurves,
  Curve,
  GridApi,
  GridDefinition,
  GridModel,
  InterpolatePointOnCurve,
  InterpolatePointOnCurveFactory,
  InterpolationStrategy,
  Lines,
  LineStrategy,
  Point,
  Points,
  Step,
  StepCurves,
  StepDefinition,
  Steps,
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
