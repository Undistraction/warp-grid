// -----------------------------------------------------------------------------
// Re-export Types
// -----------------------------------------------------------------------------

export type {
  BezierEasing,
  BezierEasingParams,
  GridApi,
  GridDefinition,
  GridModel,
  InterpolatePointOnCurveFactory,
  InterpolationStrategy,
  Lines,
  LineStrategy,
  Step,
  StepCurves,
  StepDefinition,
  Steps,
  WarpGrid,
} from './types'

// Re-export types we are using from coons-patch
export type {
  BoundingCurves,
  Curve,
  InterpolatePointOnCurve,
  Point,
  Points,
} from 'coons-patch'

// -----------------------------------------------------------------------------
// Re-export Interpolation functions
// -----------------------------------------------------------------------------

export { default as interpolatePointOnCurveEvenlySpacedFactory } from './interpolate/pointOnCurve/interpolatePointOnCurveEvenlySpacedEasedFactory'
export { default as interpolatePointOnCurveLinearFactory } from './interpolate/pointOnCurve/interpolatePointOnCurveLinearEasedFactory'

// -----------------------------------------------------------------------------
// Re-export API
// -----------------------------------------------------------------------------

export { default } from './api'
