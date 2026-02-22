/*------------------------------------------------------------------------------
 * All code in this file is based on work by Pomax on curve fitting, and all
 * credit is due to him.
 *
 * That work can be found here: https://pomax.github.io/bezierinfo/#curvefitting
 * ---------------------------------------------------------------------------*/

import { Matrix } from 'ml-matrix'

import { times } from './functional'
import { binomial } from './math'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

// Build the T matrix from parameter ratios for least-squares curve fitting.
// Each row i contains the ratios raised to the power i: [t0^i, t1^i, …, tn^i].
export const getRatioMatrix = (
  ratios: number[]
): { tMatrix: Matrix; tMatrixTransposed: Matrix } => {
  const ratioLength = ratios.length
  const data = times((i) => ratios.map((v) => v ** i), ratioLength)
  const tMatrix = new Matrix(data)
  const tMatrixTransposed = tMatrix.transpose()
  return { tMatrix, tMatrixTransposed }
}

// Build the Bernstein polynomial basis matrix for Bézier curve fitting.
// The diagonal holds binomial coefficients, and the lower triangle is filled
// with alternating-sign terms derived from those coefficients.
export const getBasisMatrix = (numberOfPoints: number): Matrix => {
  const basisMatrix = Matrix.zeros(numberOfPoints, numberOfPoints)

  for (let i = 0; i < numberOfPoints; i++) {
    const value = binomial(numberOfPoints - 1, i)
    basisMatrix.set(i, i, value)
  }

  for (let c = 0, r; c < numberOfPoints; c++) {
    for (r = c + 1; r < numberOfPoints; r++) {
      const sign = (r + c) % 2 === 0 ? 1 : -1
      const value = binomial(r, c) * basisMatrix.get(r, r)
      basisMatrix.set(r, c, sign * value)
    }
  }

  return basisMatrix
}
