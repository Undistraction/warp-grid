/*------------------------------------------------------------------------------
 * The fitCurveToPoints function is based on work by Pomax on curve fitting,
 * and all credit is due to him.
 *
 * That work can be found here: https://pomax.github.io/bezierinfo/#curvefitting
 * ---------------------------------------------------------------------------*/

import matrix from 'matrix-js'
import { getBasisMatrix, getRatioMatrix } from './matrix'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const fitCurveToPoints = (points, ratios) => {
  const numberOfPoints = points.length
  const { tMatrix, tMatrixTransposed } = getRatioMatrix(ratios)

  const basisMatrix = getBasisMatrix(numberOfPoints)
  const basisMatrixInverted = matrix(basisMatrix.inv())
  const ratioMultipliedMatrix = matrix(tMatrix.prod(tMatrixTransposed))
  const invertedRatioMultipliedMatrix = matrix(ratioMultipliedMatrix.inv())
  const step1 = matrix(invertedRatioMultipliedMatrix.prod(tMatrix))
  const step2 = matrix(basisMatrixInverted.prod(step1))
  const X = matrix(points.map((v) => [v.x]))
  const x = step2.prod(X)
  const Y = matrix(points.map((v) => [v.y]))
  const y = step2.prod(Y)
  return x.map((r, i) => ({ x: r[0], y: y[i][0] }))
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const fitCubicBezierToPoints = (
  points,
  ratioMidpoint1,
  ratioMidpoint2
) => {
  const result = fitCurveToPoints(
    [points.startPoint, points.midPoint1, points.midPoint2, points.endPoint],
    [0, ratioMidpoint1, ratioMidpoint2, 1]
  )

  return {
    startPoint: result[0],
    controlPoint1: result[1],
    controlPoint2: result[2],
    endPoint: result[3],
  }
}
