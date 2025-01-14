import coonsPatch from 'coons-patch'

import type {
  BoundingCurves,
  Curve,
  InterpolatePointOnCurve,
  InterpolationParamsU,
  InterpolationParamsV,
} from '../../types'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

/**
 * Interpolates a straight line along the U axis of a surface defined by
 * bounding curves.
 *
 * @param {BoundingCurves} boundingCurves - An object containing curves that
 * define the surface boundaries.
 * @param {InterpolationParamsU} params - Parameters describing curve start and
 * end points
 * @param {InterpolatePointOnCurveU} interpolatePointOnCurveU - A function to
 * interpolate points on the U axis.
 * @param {InterpolatePointOnCurveU} interpolatePointOnCurveV - A function to
 * interpolate points on the V axis.
 * @returns {Curve} The interpolated straight line as a cubic Bezier curve.
 *
 * @group Interpolation
 */
export const interpolateStraightLineU = (
  boundingCurves: BoundingCurves,
  {
    uStart,
    uEnd,
    uOppositeStart,
    uOppositeEnd,
    vStart,
    vOppositeStart,
  }: InterpolationParamsU,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
): Curve => {
  const startPoint = coonsPatch(
    boundingCurves,
    {
      u: uStart,
      v: vStart,
      uOpposite: uOppositeStart,
      vOpposite: vOppositeStart,
    },
    { interpolatePointOnCurveU, interpolatePointOnCurveV }
  )

  const endPoint = coonsPatch(
    boundingCurves,
    { u: uEnd, v: vStart, uOpposite: uOppositeEnd, vOpposite: vOppositeStart },
    { interpolatePointOnCurveU, interpolatePointOnCurveV }
  )

  // Set the control points to the start and end points so the line is straight
  return {
    startPoint,
    endPoint,
    controlPoint1: startPoint,
    controlPoint2: endPoint,
  }
}

/**
 * Interpolates a straight line along the V axis of a surface defined by
 * bounding curves.
 *
 * @param {BoundingCurves} boundingCurves - An object containing curves that
 * define the surface boundaries.
 * @param {InterpolationParamsU} params - Parameters describing curve start and
 * end points
 * @param {InterpolatePointOnCurveU} interpolatePointOnCurveU - A function to
 * interpolate points on the U axis.
 * @param {InterpolatePointOnCurveU} interpolatePointOnCurveV - A function to
 * interpolate points on the V axis.
 * @returns {Curve} The interpolated straight line as a cubic Bezier curve.
 *
 * @group Interpolation
 */
export const interpolateStraightLineV = (
  boundingCurves: BoundingCurves,
  {
    vStart,
    vEnd,
    vOppositeStart,
    vOppositeEnd,
    uStart,
    uOppositeStart,
  }: InterpolationParamsV,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
): Curve => {
  const startPoint = coonsPatch(
    boundingCurves,
    {
      u: uStart,
      v: vStart,
      uOpposite: uOppositeStart,
      vOpposite: vOppositeStart,
    },
    { interpolatePointOnCurveU, interpolatePointOnCurveV }
  )

  const endPoint = coonsPatch(
    boundingCurves,
    { u: uStart, v: vEnd, uOpposite: uOppositeStart, vOpposite: vOppositeEnd },
    { interpolatePointOnCurveU, interpolatePointOnCurveV }
  )

  // Set the control points to the start and end points so the line is straight
  return {
    startPoint,
    endPoint,
    controlPoint1: startPoint,
    controlPoint2: endPoint,
  }
}
