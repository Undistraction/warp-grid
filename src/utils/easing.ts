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
    // Do these outside the returned function so they only happen once.
    const ease = BezierEasing(...config.bezierEasing)
    const interpolatePointOnCurveWithConfig = interpolatePointOnCurve(config)
    // Use a named const for better debugging
    const interpolatePointOnCurveWrappedWithEasing = (
      t: number,
      curve: Curve
    ) => {
      const tEased = ease(t)
      return interpolatePointOnCurveWithConfig(tEased, curve)
    }
    return interpolatePointOnCurveWrappedWithEasing
  }

export default wrapInterpolatePointOnCurveWithEasing
