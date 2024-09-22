// -----------------------------------------------------------------------------
// Re-export Types
// -----------------------------------------------------------------------------

export { InterpolationStrategy, LineStrategy } from './enums'
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
  Lines,
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
