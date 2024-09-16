// -----------------------------------------------------------------------------
// Re-export Types
// -----------------------------------------------------------------------------

export * from './types'

// -----------------------------------------------------------------------------
// Re-export Interpolation functions
// -----------------------------------------------------------------------------

export {
  interpolateCurveU,
  interpolateCurveV,
} from './interpolate/curves/curved'
export {
  interpolateStraightLineU,
  interpolateStraightLineV,
} from './interpolate/curves/straight'
export { default as interpolatePointOnCurveEvenlySpacedEasedFactory } from './interpolate/pointOnCurve/interpolatePointOnCurveEvenlySpacedEasedFactory'
export { default as interpolatePointOnCurveLinearEasedFactory } from './interpolate/pointOnCurve/interpolatePointOnCurveLinearEasedFactory'
export {
  interpolatePointOnCurveEvenlySpacedFactory,
  interpolatePointOnCurveLinearFactory,
} from 'coons-patch'

// -----------------------------------------------------------------------------
// Re-export API
// -----------------------------------------------------------------------------

export { default } from './api'
