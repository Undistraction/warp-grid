import coonsPatch, { interpolatePointOnSurfaceBilinear } from 'coons-patch'
import memoize from 'fast-memoize'

import type {
  BoundingCurves,
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
   * @returns The bounding curves of the cell.
   */
  const getCellBounds = memoize(
    (column: number, row: number): BoundingCurves => {
      validateGetSquareArguments(column, row, columns, rows)

      const { xAxis, yAxis } = getLines()

      // If there is a gutter, we need to skip over the gutter space
      const gutterMultiplierX = gutter[0] > 0 ? 2 : 1
      const gutterMultiplierY = gutter[1] > 0 ? 2 : 1

      return {
        top: xAxis[row * gutterMultiplierX][column],
        bottom: xAxis[row * gutterMultiplierX + 1][column],
        left: yAxis[column * gutterMultiplierY][row],
        right: yAxis[column * gutterMultiplierY + 1][row],
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
    getLinesXAxis,
    getLinesYAxis,
    getLines,
    getIntersections,
    getCellBounds,
    getAllCellBounds,
  }
}

export default getApi
