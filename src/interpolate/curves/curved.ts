import { interpolatePointOnSurfaceBilinear } from 'coons-patch'

import type {
  BoundingCurves,
  Curve,
  InterpolatePointOnCurve,
  InterpolationParamsU,
  InterpolationParamsV,
} from '../../types'
import { fitCubicBezierToPoints } from '../../utils/bezier'
import { interpolateStraightLineU, interpolateStraightLineV } from './straight'

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const T_MIDPOINT_1 = 0.25
const T_MIDPOINT_2 = 0.75

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

/**
 * Interpolates a cubic Bezier curve along the V direction of a surface defined
 * by bounding curves.
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
 * @returns {Curve} The interpolated cubic Bezier curve.
 *
 * @group Interpolation
 */
export const interpolateCurveU = (
  boundingCurves: BoundingCurves,
  {
    uStart,
    uSize,
    uEnd,
    vStart,
    vOppositeStart,
    uOppositeEnd,
    uOppositeSize,
    uOppositeStart,
  }: InterpolationParamsU,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
): Curve => {
  const { startPoint, endPoint } = interpolateStraightLineU(
    boundingCurves,
    {
      uStart,
      uSize,
      uEnd,
      vStart,
      vOppositeStart,
      uOppositeEnd,
      uOppositeSize,
      uOppositeStart,
    },
    interpolatePointOnCurveU,
    interpolatePointOnCurveV
  )

  const midPoint1 = interpolatePointOnSurfaceBilinear(
    boundingCurves,
    {
      u: uStart + uSize * T_MIDPOINT_1,
      v: vStart,
      uOpposite: uOppositeStart + uOppositeSize * T_MIDPOINT_1,
      vOpposite: vOppositeStart,
    },
    interpolatePointOnCurveU,
    interpolatePointOnCurveV
  )

  const midPoint2 = interpolatePointOnSurfaceBilinear(
    boundingCurves,
    {
      u: uStart + uSize * T_MIDPOINT_2,
      v: vStart,
      uOpposite: uOppositeStart + uOppositeSize * T_MIDPOINT_2,
      vOpposite: vOppositeStart,
    },
    interpolatePointOnCurveU,
    interpolatePointOnCurveV
  )

  const curve = fitCubicBezierToPoints(
    [startPoint, midPoint1, midPoint2, endPoint],
    [0, T_MIDPOINT_1, T_MIDPOINT_2, 1]
  )

  return curve
}

/**
 * Interpolates a cubic Bezier curve along the U direction of a surface defined
 * by bounding curves.
 *
 * @param {BoundingCurves} boundingCurves - An object containing curves that
 * define the surface boundaries.
 * @param {number} vStart - The starting parameter along the V direction.
 * @param {number} vSize - The size of the step along the V direction.
 * @param {number} vEnd - The ending parameter along the V direction.
 * @param {number} uStart - The starting parameter along the U direction.
 * @param {InterpolatePointOnCurve} interpolatePointOnCurveU - A function to
 * interpolate points on the U axis.
 * @param {InterpolatePointOnCurve} interpolatePointOnCurveV - A function to
 * interpolate points on the V axis.
 * @returns {Curve} The interpolated cubic Bezier curve.
 *
 * @group Interpolation
 */
export const interpolateCurveV = (
  boundingCurves: BoundingCurves,
  {
    vStart,
    vSize,
    vEnd,
    uStart,
    vOppositeEnd,
    vOppositeSize,
    vOppositeStart,
    uOppositeStart,
  }: InterpolationParamsV,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
): Curve => {
  const { startPoint, endPoint } = interpolateStraightLineV(
    boundingCurves,
    {
      vStart,
      vSize,
      vEnd,
      uStart,
      vOppositeEnd,
      vOppositeSize,
      vOppositeStart,
      uOppositeStart,
    },
    interpolatePointOnCurveU,
    interpolatePointOnCurveV
  )

  const midPoint1 = interpolatePointOnSurfaceBilinear(
    boundingCurves,
    {
      u: uStart,
      v: vStart + vSize * T_MIDPOINT_1,
      uOpposite: uOppositeStart,
      vOpposite: vOppositeStart + vOppositeSize * T_MIDPOINT_1,
    },
    interpolatePointOnCurveU,
    interpolatePointOnCurveV
  )

  const midPoint2 = interpolatePointOnSurfaceBilinear(
    boundingCurves,
    {
      u: uStart,
      v: vStart + vSize * T_MIDPOINT_2,
      uOpposite: uOppositeStart,
      vOpposite: vOppositeStart + vOppositeSize * T_MIDPOINT_2,
    },
    interpolatePointOnCurveU,
    interpolatePointOnCurveV
  )

  const curve = fitCubicBezierToPoints(
    [startPoint, midPoint1, midPoint2, endPoint],
    [0, T_MIDPOINT_1, T_MIDPOINT_2, 1]
  )

  return curve
}
