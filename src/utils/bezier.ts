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
// Precomputed transformation matrix
// -----------------------------------------------------------------------------

// Always called with 4 points and ratios [0, 0.25, 0.75, 1], so precompute the
// transformation matrix once at module load.
const RATIOS = [0, 0.25, 0.75, 1]
const NUM_POINTS = 4

const precomputeTransformationMatrix = () => {
  const { tMatrix, tMatrixTransposed } = getRatioMatrix(RATIOS)
  const basisMatrix = getBasisMatrix(NUM_POINTS)
  const basisMatrixInverted = inverse(basisMatrix)
  const ratioMultipliedMatrix = tMatrix.mmul(tMatrixTransposed)
  const invertedRatioMultipliedMatrix = inverse(ratioMultipliedMatrix)
  const step1 = invertedRatioMultipliedMatrix.mmul(tMatrix)
  return basisMatrixInverted.mmul(step1)
}

const transformationMatrix = precomputeTransformationMatrix()

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const fitCubicBezierToPoints = (points: Point[]): Curve => {
  const X = new Matrix(points.map((v: Point) => [v.x]))
  const x = transformationMatrix.mmul(X)
  const Y = new Matrix(points.map((v: Point) => [v.y]))
  const y = transformationMatrix.mmul(Y)
  const result = Array.from({ length: x.rows }, (_, i) => ({
    x: x.get(i, 0),
    y: y.get(i, 0),
  }))
  return pointsToCurve(result)
}

export function getBezierCurveLength(curve: Curve): number {
  return getBezierFromCurve(curve).length()
}
