import { interpolatePointOnCurveLinear } from 'coons-patch'

import wrapInterpolatePointOnCurveWithEasing from '../../utils/easing'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const interpolatePointOnCurveLinearEased =
  wrapInterpolatePointOnCurveWithEasing(interpolatePointOnCurveLinear)

export default interpolatePointOnCurveLinearEased
