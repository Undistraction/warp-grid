import BezierEasing from 'bezier-easing'
import { interpolatePointOnCurveEvenlySpaced } from 'coons-patch'

import { Curve, Point } from '../../types'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const interpolatePointOnCurveEvenlySpacedEased =
  ({ precision = 0, bezierEasing = [0, 0, 1, 1] } = {}) =>
  (t: number, curve: Curve): Point => {
    // Create an easing function
    const easingFunc = BezierEasing(
      bezierEasing[0],
      bezierEasing[1],
      bezierEasing[2],
      bezierEasing[3]
    )
    // Ease the t value
    const tEased = easingFunc(t)
    return interpolatePointOnCurveEvenlySpaced({ precision })(tEased, curve)
  }

export default interpolatePointOnCurveEvenlySpacedEased
