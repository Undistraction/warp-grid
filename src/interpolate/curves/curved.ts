import type {
  BoundingCurves,
  Curve,
  InterpolatePointOnCurve,
  InterpolationParamsU,
  InterpolationParamsV,
} from '../../types'
import { fitCubicBezierToPoints } from '../../utils/bezier'
import { interpolateStraightLineU, interpolateStraightLineV } from './straight'
import coonsPatch from 'coons-patch'

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const T_MIDPOINT_1 = 0.25
const T_MIDPOINT_2 = 0.75

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

/**
 * Interpolates a cubic Bezier curve along the U direction of a surface defined
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
    uEnd,
    vStart,
    vOppositeStart,
    uOppositeEnd,
    uOppositeStart,
  }: InterpolationParamsU,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
): Curve => {
  const uSize = uEnd - uStart
  const uOppositeSize = uOppositeEnd - uOppositeStart

  const { startPoint, endPoint } = interpolateStraightLineU(
    boundingCurves,
    {
      uStart,
      uEnd,
      vStart,
      vOppositeStart,
      uOppositeEnd,
      uOppositeStart,
    },
    interpolatePointOnCurveU,
    interpolatePointOnCurveV
  )

  const midPoint1 = coonsPatch(
    boundingCurves,
    {
      u: uStart + uSize * T_MIDPOINT_1,
      v: vStart,
      uOpposite: uOppositeStart + uOppositeSize * T_MIDPOINT_1,
      vOpposite: vOppositeStart,
    },
    { interpolatePointOnCurveU, interpolatePointOnCurveV }
  )

  const midPoint2 = coonsPatch(
    boundingCurves,
    {
      u: uStart + uSize * T_MIDPOINT_2,
      v: vStart,
      uOpposite: uOppositeStart + uOppositeSize * T_MIDPOINT_2,
      vOpposite: vOppositeStart,
    },
    { interpolatePointOnCurveU, interpolatePointOnCurveV }
  )

  return fitCubicBezierToPoints(
    [startPoint, midPoint1, midPoint2, endPoint],
    [0, T_MIDPOINT_1, T_MIDPOINT_2, 1]
  )
}

/**
 * Interpolates a cubic Bezier curve along the V direction of a surface defined
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
    vEnd,
    uStart,
    uOppositeStart,
    vOppositeEnd,
    vOppositeStart,
  }: InterpolationParamsV,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
): Curve => {
  const vSize = vEnd - vStart
  const vOppositeSize = vOppositeEnd - vOppositeStart

  const { startPoint, endPoint } = interpolateStraightLineV(
    boundingCurves,
    {
      vStart,
      vEnd,
      uStart,
      uOppositeStart,
      vOppositeEnd,
      vOppositeStart,
    },
    interpolatePointOnCurveU,
    interpolatePointOnCurveV
  )

  const midPoint1 = coonsPatch(
    boundingCurves,
    {
      u: uStart,
      v: vStart + vSize * T_MIDPOINT_1,
      uOpposite: uOppositeStart,
      vOpposite: vOppositeStart + vOppositeSize * T_MIDPOINT_1,
    },
    { interpolatePointOnCurveU, interpolatePointOnCurveV }
  )

  const midPoint2 = coonsPatch(
    boundingCurves,
    {
      u: uStart,
      v: vStart + vSize * T_MIDPOINT_2,
      uOpposite: uOppositeStart,
      vOpposite: vOppositeStart + vOppositeSize * T_MIDPOINT_2,
    },
    { interpolatePointOnCurveU, interpolatePointOnCurveV }
  )

  return fitCubicBezierToPoints(
    [startPoint, midPoint1, midPoint2, endPoint],
    [0, T_MIDPOINT_1, T_MIDPOINT_2, 1]
  )
}
