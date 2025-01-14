import BezierEasing from 'bezier-easing'

import type {
  BezierEasingParams,
  Curve,
  InterpolatePointOnCurveFactory,
} from '../types'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const wrapInterpolatePointOnCurveWithEasing =
  (
    interpolatePointOnCurve: InterpolatePointOnCurveFactory
  ): InterpolatePointOnCurveFactory =>
  (config: { bezierEasing: BezierEasingParams; precision: number }) => {
    // Use a named const for better debugging
    const interpolatePointOnCurveWrappedWithEasing = (
      t: number,
      curve: Curve
    ) => {
      // Create an easing function
      const ease = BezierEasing(...config.bezierEasing)
      const tEased = ease(t)
      return interpolatePointOnCurve(config)(tEased, curve)
    }
    return interpolatePointOnCurveWrappedWithEasing
  }

export default wrapInterpolatePointOnCurveWithEasing
