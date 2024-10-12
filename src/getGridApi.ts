import coonsPatch, { interpolatePointOnSurfaceBilinear } from 'coons-patch'
import memoize from 'fast-memoize'

import type {
  BoundingCurves,
  BoundingCurvesWithMeta,
  Curve,
  GridApi,
  InterpolateLineU,
  InterpolateLineV,
  InterpolatePointOnCurve,
  Lines,
  Point,
  Step,
  StepCurves,
} from './types'
import { getStepData, getTSize } from './utils/steps'
import {
  validateGetIntersectionsArguments,
  validateGetSquareArguments,
} from './validation'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// Internal
type GetAPiConfig = {
  interpolatePointOnCurveU: InterpolatePointOnCurve
  interpolatePointOnCurveV: InterpolatePointOnCurve
  interpolateLineU: InterpolateLineU
  interpolateLineV: InterpolateLineV
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const stepIsNotGutter = (step: Step): boolean => !step.isGutter

const reverseCurve = (curve: Curve) => {
  return {
    startPoint: curve.endPoint,
    endPoint: curve.startPoint,
    controlPoint1: curve.controlPoint2,
    controlPoint2: curve.controlPoint1,
  }
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const getApi = (
  boundingCurves: BoundingCurves,
  columns: Step[],
  rows: Step[],
  gutter: [number, number],
  {
    interpolatePointOnCurveU,
    interpolatePointOnCurveV,
    interpolateLineU,
    interpolateLineV,
  }: GetAPiConfig
): GridApi => {
  /**
   * Retrieves the point on the surface based on the given coordinates.
   * @param x - The x-coordinate of the point.
   * @param y - The y-coordinate of the point.
   * @returns The point on the surface.
   */
  const getPoint = memoize((x: number, y: number): Point => {
    return coonsPatch(boundingCurves, x, y, {
      interpolatePointOnCurveU,
      interpolatePointOnCurveV,
    })
  })

  const getLinesXAxis = (): StepCurves[] => {
    const {
      processedColumns,
      processedRows,
      columnsTotalCount,
      rowsTotalCount,
      columnsTotalValue,
      rowsTotalValue,
    } = getStepData(columns, rows)

    const curves = []
    let vStart = 0

    // Short circuit if we are only 1x1 and just return bounds
    if (columnsTotalCount === 1 && rowsTotalCount === 1) {
      return [[boundingCurves.top], [boundingCurves.bottom]]
    }

    for (let rowIdx = 0; rowIdx <= rowsTotalCount; rowIdx++) {
      const lineSections = []
      let uStart = 0

      for (let columnIdx = 0; columnIdx < columnsTotalCount; columnIdx++) {
        const column = processedColumns[columnIdx]
        const columnValue = column?.value
        const uSize = columnValue / columnsTotalValue
        const uEnd = uStart + uSize

        if (!column.isGutter) {
          const curve = interpolateLineU(
            boundingCurves,
            uStart,
            uSize,
            uEnd,
            vStart,
            interpolatePointOnCurveU,
            interpolatePointOnCurveV
          )

          lineSections.push(curve)
        }

        uStart += uSize
      }

      curves.push(lineSections)

      if (rowIdx !== rowsTotalCount) {
        vStart += getTSize(processedRows, rowIdx, rowsTotalValue)
      }
    }

    return curves
  }

  const getLinesYAxis = (): StepCurves[] => {
    const {
      processedColumns,
      processedRows,
      columnsTotalCount,
      rowsTotalCount,
      columnsTotalValue,
      rowsTotalValue,
    } = getStepData(columns, rows)

    const curves = []
    let uStart = 0

    // Short circuit if we are only 1x1 and just return the bounds
    if (columnsTotalCount === 1 && rowsTotalCount === 1) {
      return [[boundingCurves.left], [boundingCurves.right]]
    }

    for (let columnIdx = 0; columnIdx <= columnsTotalCount; columnIdx++) {
      const lineSections = []
      let vStart = 0

      for (let rowIdx = 0; rowIdx < rowsTotalCount; rowIdx++) {
        const row = processedRows[rowIdx]
        const rowValue = row?.value
        const vSize = rowValue / rowsTotalValue
        const vEnd = vStart + vSize

        if (!row.isGutter) {
          const curve = interpolateLineV(
            boundingCurves,
            vStart,
            vSize,
            vEnd,
            uStart,
            interpolatePointOnCurveU,
            interpolatePointOnCurveV
          )

          lineSections.push(curve)
        }

        vStart += vSize
      }

      curves.push(lineSections)

      // Calculate the position of the next column
      if (columnIdx !== columnsTotalCount) {
        uStart += getTSize(processedColumns, columnIdx, columnsTotalValue)
      }
    }

    return curves
  }

  /**
   * Retrieves the lines for the grid axes.
   * @returns An object containing the lines for the x-axis and y-axis.
   */
  const getLines = memoize((): Lines => {
    return {
      xAxis: getLinesXAxis(),
      yAxis: getLinesYAxis(),
    }
  })

  /**
   * Retrieves the intersection points on the surface.
   *
   * @returns An array of Point objects representing the intersection points.
   */
  const getIntersections = memoize((): Point[] => {
    validateGetIntersectionsArguments(
      boundingCurves,
      columns,
      rows,
      interpolatePointOnCurveU,
      interpolatePointOnCurveV
    )

    const {
      processedColumns,
      processedRows,
      columnsTotalCount,
      rowsTotalCount,
      columnsTotalValue,
      rowsTotalValue,
    } = getStepData(columns, rows)

    const intersections = []
    let vStart = 0

    for (let rowIdx = 0; rowIdx <= rowsTotalCount; rowIdx++) {
      let uStart = 0

      for (let columnIdx = 0; columnIdx <= columnsTotalCount; columnIdx++) {
        const point = interpolatePointOnSurfaceBilinear(
          boundingCurves,
          uStart,
          vStart,
          interpolatePointOnCurveU,
          interpolatePointOnCurveV
        )

        intersections.push(point)

        if (columnIdx !== columnsTotalCount) {
          uStart += getTSize(processedColumns, columnIdx, columnsTotalValue)
        }
      }

      if (rowIdx !== rowsTotalCount) {
        vStart += getTSize(processedRows, rowIdx, rowsTotalValue)
      }
    }

    return intersections
  })

  /**
   * Retrieves the bounding curves of a cell in the grid.
   *
   * @param column - The column index of the cell.
   * @param row - The row index of the cell.
   * @param {object} [options] - Optional parameters.
   * @param {boolean} [options.makeBoundsCurvesSequential=false] - By default,
   * top and bottom bounding curves run left to right and left and right bounds
   * run top to bottom. This option will output bounds so that the bottom bounds
   * run right to left and the left bounds run bottom to top.
   * @returns The bounding curves of the cell, including a meta object
   * containing the row and column indices of that cell.
   */
  const getCellBounds = memoize(
    (
      column: number,
      row: number,
      { makeBoundsCurvesSequential = false } = {}
    ): BoundingCurvesWithMeta => {
      validateGetSquareArguments(column, row, columns, rows)

      const { xAxis, yAxis } = getLines()

      // If there is a gutter, we need to skip over the gutter space
      const gutterMultiplierX = gutter[0] > 0 ? 2 : 1
      const gutterMultiplierY = gutter[1] > 0 ? 2 : 1

      const top = xAxis[row * gutterMultiplierX][column]
      const bottom = xAxis[row * gutterMultiplierX + 1][column]
      const left = yAxis[column * gutterMultiplierY][row]
      const right = yAxis[column * gutterMultiplierY + 1][row]

      return {
        meta: {
          row,
          column,
        },
        top,
        bottom: makeBoundsCurvesSequential ? reverseCurve(bottom) : bottom,
        left: makeBoundsCurvesSequential ? reverseCurve(left) : left,
        right,
      }
    }
  )

  /**
   * Retrieves the bounding curves for all cells in the grid, excluding gutter
   * steps.
   * @param {boolean} [options.makeBoundsCurvesSequential=false] - By default,
   * top and bottom bounding curves run left to right and left and right bounds
   * run top to bottom. This option will output bounds so that the bottom bounds
   * run right to left and the left bounds run bottom to top.
   *
   * @returns An array of bounding curves for each cell.
   */
  const getAllCellBounds = memoize(
    ({ makeBoundsCurvesSequential = false } = {}): BoundingCurvesWithMeta[] => {
      // We only want to run through steps that are not gutters so we filter both
      // rows and columns first
      return rows
        .filter(stepIsNotGutter)
        .reduce(
          (
            acc: BoundingCurvesWithMeta[],
            row: Step,
            rowIdx: number
          ): BoundingCurvesWithMeta[] => {
            const cellBounds = columns
              .filter(stepIsNotGutter)
              .map((column: Step, columnIdx: number) => {
                return getCellBounds(columnIdx, rowIdx, {
                  makeBoundsCurvesSequential,
                })
              })
            return [...acc, ...cellBounds]
          },
          []
        )
    }
  )

  return {
    getPoint,
    getLinesXAxis,
    getLinesYAxis,
    getLines,
    getIntersections,
    getCellBounds,
    getAllCellBounds,
  }
}

export default getApi
