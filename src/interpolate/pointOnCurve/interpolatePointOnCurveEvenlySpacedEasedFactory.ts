import { interpolatePointOnCurveEvenlySpacedFactory } from 'coons-patch'

import wrapInterpolatePointOnCurveWithEasing from '../../utils/easing'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const interpolatePointOnCurveEvenlySpacedEasedFactory =
  wrapInterpolatePointOnCurveWithEasing(
    interpolatePointOnCurveEvenlySpacedFactory
  )

export default interpolatePointOnCurveEvenlySpacedEasedFactory
