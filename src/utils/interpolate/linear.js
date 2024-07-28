import { roundTo10 } from '../math'
import { validateT } from '../validation'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const lerp = (point1, point2, t) => {
  return (1 - t) * point1 + t * point2
}

const lerpPoint = (point1, point2, t) => {
  return { x: lerp(point1.x, point2.x, t), y: lerp(point1.y, point2.y, t) }
}

const interpolate = (
  t,
  { controlPoint1, controlPoint2, startPoint, endPoint }
) => {
  // Alternativly: Bernstein polynomials
  // return (
  //   startPoint[coordinate] * (-tCubed + 3 * tSquared - 3 * t + 1) +
  //   controlPoint1[coordinate] * (3 * tCubed - 6 * tSquared + 3 * t) +
  //   controlPoint2[coordinate] * (-3 * tCubed + 3 * tSquared) +
  //   endPoint[coordinate] * tCubed
  // )

  const a = lerpPoint(startPoint, controlPoint1, t)
  const b = lerpPoint(controlPoint1, controlPoint2, t)
  const c = lerpPoint(controlPoint2, endPoint, t)
  const d = lerpPoint(a, b, t)
  const e = lerpPoint(b, c, t)
  return lerpPoint(d, e, t)
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const interpolatePointOnCurveLinear = (t, curve) => {
  // Round the ratio to 10 decimal places to avoid rounding issues where the
  // number is fractionally over 1 or below 0
  const tRounded = roundTo10(t)
  validateT(tRounded)

  return {
    ...interpolate(t, curve),
    t,
  }
}
