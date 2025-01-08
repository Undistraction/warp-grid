import { interpolatePointOnSurfaceBilinear } from 'coons-patch'

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
 * Interpolates a straight line along the V direction of a surface defined by
 * bounding curves.
 *
 * @param {BoundingCurves} boundingCurves - An object containing curves that
 * define the surface boundaries.
 * @param {number} uStart - The starting parameter along the U direction.
 * @param {number} uSize - The size of the step along the U direction.
 * @param {number} uEnd - The ending parameter along the U direction.
 * @param {number} vStart - The starting parameter along the V direction.
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
  { uStart, uEnd, vStart }: InterpolationParamsU,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
): Curve => {
  const startPoint = interpolatePointOnSurfaceBilinear(
    boundingCurves,
    { u: uStart, v: vStart },
    interpolatePointOnCurveU,
    interpolatePointOnCurveV
  )

  const endPoint = interpolatePointOnSurfaceBilinear(
    boundingCurves,
    { u: uEnd, v: vStart },
    interpolatePointOnCurveU,
    interpolatePointOnCurveV
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
 * Interpolates a straight line along the U direction of a surface defined by
 * bounding curves.
 *
 * @param {BoundingCurves} boundingCurves - An object containing curves that
 * define the surface boundaries.
 * @param {number} uStart - The starting parameter along the U direction.
 * @param {number} uSize - The size of the step along the U direction.
 * @param {number} uEnd - The ending parameter along the U direction.
 * @param {number} vStart - The starting parameter along the V direction.
 * @param {InterpolatePointOnCurve} interpolatePointOnCurveU - A function to
 * interpolate points on the U axis.
 * @param {InterpolatePointOnCurve} interpolatePointOnCurveV - A function to
 * interpolate points on the V axis.
 * @returns {Curve} The interpolated straight line as a cubic Bezier curve.
 *
 * @group Interpolation
 */
export const interpolateStraightLineV = (
  boundingCurves: BoundingCurves,
  { vStart, vEnd, uStart }: InterpolationParamsV,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
): Curve => {
  const startPoint = interpolatePointOnSurfaceBilinear(
    boundingCurves,
    { u: uStart, v: vStart },
    interpolatePointOnCurveU,
    interpolatePointOnCurveV
  )

  const endPoint = interpolatePointOnSurfaceBilinear(
    boundingCurves,
    { u: uStart, v: vEnd },
    interpolatePointOnCurveU,
    interpolatePointOnCurveV
  )

  // Set the control points to the start and end points so the line is straight
  return {
    startPoint,
    endPoint,
    controlPoint1: startPoint,
    controlPoint2: endPoint,
  }
}
