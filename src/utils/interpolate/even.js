import { getDistanceBetweenPoints, roundTo10 } from '../math'
import { validateRatio } from '../validation'
import { interpolatePointOnCurveLinear } from './linear'

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const DEFAULT_PRECISION = 6

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const getApproximatePointsOnCurve = (curve, precision) => {
  const points = []

  for (let i = 0; i <= precision; i++) {
    const ratio = i / precision
    points.push(interpolatePointOnCurveLinear(ratio, curve))
  }

  return points
}

const getCumulativeLengths = (pointsApproximate) => {
  const cumulativeLengths = [0]
  for (let i = 1; i < pointsApproximate.length; i++) {
    // Find distance between current and previous approximate points
    const lastApproximatePoint = pointsApproximate[i - 1]
    const thisApproximatePoint = pointsApproximate[i]
    const distance = getDistanceBetweenPoints(
      lastApproximatePoint,
      thisApproximatePoint
    )

    // Add the next cummulative length
    const lastCummulativeLength = cumulativeLengths[i - 1]
    cumulativeLengths.push(lastCummulativeLength + distance)
  }

  return cumulativeLengths
}

const findClosestPointOnCurve = (
  cumulativeLengths,
  curve,
  targetLength,
  precision
) => {
  let point = null
  for (let i = 1; i < cumulativeLengths.length; i++) {
    if (cumulativeLengths[i] >= targetLength) {
      const ratio =
        (i -
          1 +
          (targetLength - cumulativeLengths[i - 1]) /
            (cumulativeLengths[i] - cumulativeLengths[i - 1])) /
        precision
      point = interpolatePointOnCurveLinear(ratio, curve)
      break
    }
  }
  return point
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const interpolatePointOnCurveEvenlySpaced = (
  ratio,
  curve,
  // Get an approximation using an arbitrary number of points. Increase for more
  // accuracy at cost of performance
  { precision = DEFAULT_PRECISION } = {}
) => {
  // Round the ratio to 10 decimal places to avoid rounding issues where the
  // number is fractionally over 1 or below 0
  const ratioRounded = roundTo10(ratio)

  validateRatio(ratioRounded)

  // Approximate the curve with a high number of points
  const pointsApproximate = getApproximatePointsOnCurve(curve, precision)

  // Calculate the cumulative arc length
  const cumulativeLengths = getCumulativeLengths(pointsApproximate)

  const totalLength = cumulativeLengths[cumulativeLengths.length - 1]
  const targetLength = ratioRounded * totalLength

  // Interpolate new point based on the cumulative arc length
  return findClosestPointOnCurve(
    cumulativeLengths,
    curve,
    targetLength,
    precision
  )
}
