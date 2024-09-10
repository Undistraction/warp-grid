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
export { default as interpolatePointOnCurveEvenlySpacedEased } from './interpolate/pointOnCurve/interpolatePointOnCurveEvenlySpacedEased'
export { default as interpolatePointOnCurveLinearEased } from './interpolate/pointOnCurve/interpolatePointOnCurveLinearEased'
export {
  interpolatePointOnCurveEvenlySpaced,
  interpolatePointOnCurveLinear,
} from 'coons-patch'

// -----------------------------------------------------------------------------
// Re-export API
// -----------------------------------------------------------------------------

export { default } from './api'
