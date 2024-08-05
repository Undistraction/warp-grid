import {
  getSurfaceCurves,
  getSurfaceIntersectionPoints,
  getSurfacePoint,
} from 'coons-patch'
import memoize from 'fast-memoize'

import {
  BoundingCurves,
  GridApi,
  InterpolateLineU,
  InterpolateLineV,
  InterpolatePointOnCurve,
  Lines,
  Point,
  Step,
} from './types'
import { validateGetSquareArguments } from './validation'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// Internal
type GetAPiConfig = {
  interpolatePointOnCurve: InterpolatePointOnCurve
  interpolateLineU: InterpolateLineU
  interpolateLineV: InterpolateLineV
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const stepIsNotGutter = (step: Step): boolean => !step.isGutter

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const getApi = (
  boundingCurves: BoundingCurves,
  columns: Step[],
  rows: Step[],
  gutter: number,
  { interpolatePointOnCurve, interpolateLineU, interpolateLineV }: GetAPiConfig
): GridApi => {
  /**
   * Retrieves the point on the surface based on the given coordinates.
   * @param x - The x-coordinate of the point.
   * @param y - The y-coordinate of the point.
   * @returns The point on the surface.
   */
  const getPoint = memoize((x: number, y: number): Point => {
    return getSurfacePoint(boundingCurves, x, y, { interpolatePointOnCurve })
  })

  /**
   * Retrieves the lines for the grid axes.
   * @returns An object containing the lines for the x-axis and y-axis.
   */
  const getLines = memoize((): Lines => {
    const { u, v } = getSurfaceCurves(boundingCurves, columns, rows, {
      interpolatePointOnCurve,
      interpolateLineU,
      interpolateLineV,
    })
    return {
      xAxis: u,
      yAxis: v,
    }
  })

  /**
   * Retrieves the intersection points on the surface.
   *
   * @returns An array of Point objects representing the intersection points.
   */
  const getIntersections = memoize((): Point[] => {
    return getSurfaceIntersectionPoints(boundingCurves, columns, rows, {
      interpolatePointOnCurve,
    })
  })

  /**
   * Retrieves the bounding curves of a cell in the grid.
   *
   * @param column - The column index of the cell.
   * @param row - The row index of the cell.
   * @returns The bounding curves of the cell.
   */
  const getCellBounds = memoize(
    (column: number, row: number): BoundingCurves => {
      validateGetSquareArguments(column, row, columns, rows)

      const { xAxis, yAxis } = getLines()

      // If there is a gutter, we need to skip over the gutter space
      const gutterMultiplier = gutter > 0 ? 2 : 1

      return {
        top: xAxis[row * gutterMultiplier][column],
        bottom: xAxis[row * gutterMultiplier + 1][column],
        left: yAxis[column * gutterMultiplier][row],
        right: yAxis[column * gutterMultiplier + 1][row],
      }
    }
  )

  /**
   * Retrieves the bounding curves for all cells in the grid, excluding gutter
   * steps.
   *
   * @returns {BoundingCurves[]} An array of bounding curves for each cell.
   */
  const getAllCellBounds = memoize((): BoundingCurves[] => {
    // We only want to run through steps that are not gutters so we filter both
    // rows and columns first
    return columns
      .filter(stepIsNotGutter)
      .reduce(
        (
          acc: BoundingCurves[],
          column: Step,
          columnIdx: number
        ): BoundingCurves[] => {
          const cellBounds = rows
            .filter(stepIsNotGutter)
            .map((row: Step, rowIdx: number) => {
              return getCellBounds(columnIdx, rowIdx)
            })
          return [...acc, ...cellBounds]
        },
        []
      )
  })

  return {
    getPoint,
    getLines,
    getIntersections,
    getCellBounds,
    getAllCellBounds,
  }
}

export default getApi
