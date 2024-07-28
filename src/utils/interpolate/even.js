import { times, timesReduce } from '../functional'
import { getDistanceBetweenPoints, roundTo10 } from '../math'
import { validateRatio } from '../validation'
import { interpolatePointOnCurveLinear } from './linear'

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const DEFAULT_PRECISION = 20

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const getApproximatePointsOnCurve = (curve, precision) => {
  return times((idx) => {
    const ratio = idx / precision
    return interpolatePointOnCurveLinear(ratio, curve)
  }, precision + 1)
}

const getLut = (pointsApproximate) => {
  const result = timesReduce(
    (acc, idx) => {
      // Find distance between current and previous approximate points
      const lastApproximatePoint = pointsApproximate[idx]
      const thisApproximatePoint = pointsApproximate[idx + 1]
      const distance = getDistanceBetweenPoints(
        lastApproximatePoint,
        thisApproximatePoint
      )

      // Add the next cummulative length
      const lastCummulativeLength = acc[idx]
      const nextCummulativeLength = lastCummulativeLength + distance
      return [...acc, nextCummulativeLength]
    },
    [0],
    pointsApproximate.length - 1
  )
  console.log('@@@', result)
  return result
}

const findClosestPointOnCurve = (lut, curve, targetLength, precision) => {
  let point = null
  for (let i = 1; i < lut.length; i++) {
    if (lut[i] >= targetLength) {
      const ratio =
        (i - 1 + (targetLength - lut[i - 1]) / (lut[i] - lut[i - 1])) /
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

export const interpolatePointOnCurveEvenlySpaced =
  (
    // Get an approximation using an arbitrary number of points. Increase for
    // more accuracy at cost of performance
    { precision = DEFAULT_PRECISION } = {}
  ) =>
  (ratio, curve) => {
    // Round the ratio to 10 decimal places to avoid rounding issues where the
    // number is fractionally over 1 or below 0
    const ratioRounded = roundTo10(ratio)

    validateRatio(ratioRounded)

    // Approximate the curve with a high number of points
    const pointsApproximate = getApproximatePointsOnCurve(curve, precision)

    // Calculate the cumulative arc length
    const lut = getLut(pointsApproximate)

    const totalLength = lut[lut.length - 1]
    const targetLength = ratioRounded * totalLength

    // Interpolate new point based on the cumulative arc length
    return findClosestPointOnCurve(lut, curve, targetLength, precision)
  }
