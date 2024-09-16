import { interpolatePointOnCurveLinearFactory } from 'coons-patch'

import wrapInterpolatePointOnCurveWithEasing from '../../utils/easing'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const interpolatePointOnCurveLinearEasedFactory =
  wrapInterpolatePointOnCurveWithEasing(interpolatePointOnCurveLinearFactory)

export default interpolatePointOnCurveLinearEasedFactory
