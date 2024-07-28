import { times, timesReduce } from '../functional'
import { getDistanceBetweenPoints, roundTo10 } from '../math'
import { validateT } from '../validation'
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

// Generate a LUT (Look Up Table) of the cumulative arc length
const getLut = (pointsApproximate) =>
  timesReduce(
    (acc, idx) => {
      // Find distance between current and previous approximate points
      const point = pointsApproximate[idx]
      const nextPoint = pointsApproximate[idx + 1]
      const distanceBetweenPoints = getDistanceBetweenPoints(point, nextPoint)
      const lastValue = acc[idx]
      const nextValue = lastValue + distanceBetweenPoints
      return [...acc, nextValue]
    },
    [0],
    pointsApproximate.length - 1
  )

const findClosestPointOnCurve = (lut, curve, targetLength, precision) => {
  for (let i = 1; i < lut.length; i++) {
    const point = lut[i]
    if (point >= targetLength) {
      const lastPoint = lut[i - 1]
      const ratio =
        (i - 1 + (targetLength - lastPoint) / (point - lastPoint)) / precision
      return interpolatePointOnCurveLinear(ratio, curve)
    }
  }
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

    validateT(ratioRounded)

    // Approximate the curve with a high number of points
    const points = getApproximatePointsOnCurve(curve, precision)

    // Calculate the cumulative arc length
    const lut = getLut(points)

    const totalLength = lut[lut.length - 1]
    const targetLength = ratioRounded * totalLength

    // Interpolate new point based on the cumulative arc length
    return findClosestPointOnCurve(lut, curve, targetLength, precision)
  }
