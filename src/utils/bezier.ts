/*------------------------------------------------------------------------------
 * The fitCurveToPoints function is based on work by Pomax on curve fitting,
 * and all credit is due to him.
 *
 * That work can be found here: https://pomax.github.io/bezierinfo/#curvefitting
 * ---------------------------------------------------------------------------*/

import matrix from 'matrix-js'

import type { Curve, Point } from '../types'
import { getBasisMatrix, getRatioMatrix } from './matrix'
import { Bezier } from 'bezier-js'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const getBezierFromCurve = (curve: Curve): Bezier =>
  new Bezier(
    curve.startPoint.x,
    curve.startPoint.y,
    curve.controlPoint1.x,
    curve.controlPoint1.y,
    curve.controlPoint2.x,
    curve.controlPoint2.y,
    curve.endPoint.x,
    curve.endPoint.y
  )

const pointsToCurve = (points: Point[]): Curve => ({
  startPoint: points[0],
  controlPoint1: points[1],
  controlPoint2: points[2],
  endPoint: points[3],
})

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const fitCubicBezierToPoints = (
  points: Point[],
  ratios: number[]
): Curve => {
  const numberOfPoints = points.length
  const { tMatrix, tMatrixTransposed } = getRatioMatrix(ratios)
  const basisMatrix = getBasisMatrix(numberOfPoints)
  const basisMatrixInverted = matrix(basisMatrix.inv())
  const ratioMultipliedMatrix = matrix(tMatrix.prod(tMatrixTransposed))
  const invertedRatioMultipliedMatrix = matrix(ratioMultipliedMatrix.inv())
  const step1 = matrix(invertedRatioMultipliedMatrix.prod(tMatrix))
  const step2 = matrix(basisMatrixInverted.prod(step1))
  const X = matrix(points.map((v: Point) => [v.x]))
  const x = step2.prod(X)
  const Y = matrix(points.map((v: Point) => [v.y]))
  const y = step2.prod(Y)
  const result = x.map((r: number[], i: number) => ({ x: r[0], y: y[i][0] }))
  return pointsToCurve(result)
}

export function getBezierCurveLength(curve: Curve): number {
  return getBezierFromCurve(curve).length()
}
