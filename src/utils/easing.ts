import BezierEasing from 'bezier-easing'
import { Curve } from 'coons-patch'

import type {
  BezierEasingParams,
  InterpolatePointOnCurveFactory,
} from '../types'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const wrapInterpolatePointOnCurveWithEasing = (
  interpolatePointOnCurve: InterpolatePointOnCurveFactory
): InterpolatePointOnCurveFactory => {
  return (config: { bezierEasing: BezierEasingParams; precision: number }) =>
    (t: number, curve: Curve) => {
      // Create an easing function
      const ease = BezierEasing(...config.bezierEasing)
      const tEased = ease(t)
      return interpolatePointOnCurve(config)(tEased, curve)
    }
}
export default wrapInterpolatePointOnCurveWithEasing
