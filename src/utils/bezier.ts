/*------------------------------------------------------------------------------
 * The fitCurveToPoints function is based on work by Pomax on curve fitting,
 * and all credit is due to him.
 *
 * That work can be found here: https://pomax.github.io/bezierinfo/#curvefitting
 * ---------------------------------------------------------------------------*/

import { Bezier } from 'bezier-js'
import { inverse, Matrix } from 'ml-matrix'
import type { Curve, Point } from '../types'
import { getBasisMatrix, getRatioMatrix } from './matrix'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const getBezierFromCurve = ({
  startPoint,
  endPoint,
  controlPoint1,
  controlPoint2,
}: Curve): Bezier =>
  new Bezier(
    startPoint.x,
    startPoint.y,
    controlPoint1.x,
    controlPoint1.y,
    controlPoint2.x,
    controlPoint2.y,
    endPoint.x,
    endPoint.y
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
  const basisMatrixInverted = inverse(basisMatrix)
  const ratioMultipliedMatrix = tMatrix.mmul(tMatrixTransposed)
  const invertedRatioMultipliedMatrix = inverse(ratioMultipliedMatrix)
  const step1 = invertedRatioMultipliedMatrix.mmul(tMatrix)
  const step2 = basisMatrixInverted.mmul(step1)
  const X = new Matrix(points.map((v: Point) => [v.x]))
  const x = step2.mmul(X)
  const Y = new Matrix(points.map((v: Point) => [v.y]))
  const y = step2.mmul(Y)
  const result = Array.from({ length: x.rows }, (_, i) => ({
    x: x.get(i, 0),
    y: y.get(i, 0),
  }))
  return pointsToCurve(result)
}

export function getBezierCurveLength(curve: Curve): number {
  return getBezierFromCurve(curve).length()
}
