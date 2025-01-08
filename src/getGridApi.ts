import coonsPatch, { interpolatePointOnSurfaceBilinear } from 'coons-patch'
import memoize from 'fast-memoize'

import { CellBoundsOrder } from './enums'
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
import { isPixelNumberString } from './utils/regexp'
import { isString } from './utils/is'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// Internal
interface GetAPiConfig {
  interpolatePointOnCurveU: InterpolatePointOnCurve
  interpolatePointOnCurveV: InterpolatePointOnCurve
  interpolateLineU: InterpolateLineU
  interpolateLineV: InterpolateLineV
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const isStepNotGutter = (step: Step): boolean => !step.isGutter

const reverseCurve = (curve: Curve) => {
  return {
    startPoint: curve.endPoint,
    endPoint: curve.startPoint,
    controlPoint1: curve.controlPoint2,
    controlPoint2: curve.controlPoint1,
  }
}

const getAreStepsVerticalFirst = (cellBoundsOrder: CellBoundsOrder): boolean =>
  [
    CellBoundsOrder.TTB_LTR,
    CellBoundsOrder.TTB_RTL,
    CellBoundsOrder.BTT_LTR,
    CellBoundsOrder.BTT_RTL,
  ].includes(cellBoundsOrder)

const getIsOuterReversed = (cellBoundsOrder: CellBoundsOrder): boolean =>
  [
    CellBoundsOrder.BTT_LTR,
    CellBoundsOrder.BTT_RTL,
    CellBoundsOrder.RTL_TTB,
    CellBoundsOrder.RTL_BTT,
  ].includes(cellBoundsOrder)

const getIsInnerReversed = (cellBoundsOrder: CellBoundsOrder): boolean =>
  [
    CellBoundsOrder.TTB_RTL,
    CellBoundsOrder.BTT_RTL,
    CellBoundsOrder.LTR_BTT,
    CellBoundsOrder.RTL_BTT,
  ].includes(cellBoundsOrder)

const getTotalAbsoluteGutterSize = (steps: Step[]): number => {
  return steps.reduce((acc, step) => {
    const { value } = step
    if (step.isGutter && isString(value) && isPixelNumberString(value)) {
      return acc + Number(value.split(`px`)[0])
    }
    return acc
  }, 0)
}

// const hasNonZeroGutter = (gutter: number | string) =>
//   isNumber(gutter) && gutter > 0

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const getApi = (
  boundingCurves: BoundingCurves,
  columns: Step[],
  rows: Step[],
  gutter: [number | string, number | string],
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
    return coonsPatch(
      boundingCurves,
      { u: x, v: y },
      {
        interpolatePointOnCurveU,
        interpolatePointOnCurveV,
      }
    )
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

    // Because we support absolute pixel-based values for gutters, we need to
    // know how much space those gutters will take up so we can share the
    // remaining space between the non-pixel-based gutters and steps.
    const totalAbsoluteGutterSizeV = getTotalAbsoluteGutterSize(processedRows)
    const totalAbsoluteGutterSizeH =
      getTotalAbsoluteGutterSize(processedColumns)

    // Get total length of the curve on each side [totalSpace]
    // Subtract the total gutter size from the total length to give
    // [remainingSpaceU, remainingSpaceUOpposite]
    // Run through the steps, and calculate the u or v value for each step, for each side (left and right or top and bottom) If it's a gutter with a pixel value then its u or v value will be [pxValue / totalSpace], otherwise it will be [stepValue / remainingSpaceU]
    // interpolateLine based on u or v values of each side.

    // Otherwise work our way through the grid
    for (let rowIdx = 0; rowIdx <= rowsTotalCount; rowIdx++) {
      const lineSections = []
      let uStart = 0

      for (let columnIdx = 0; columnIdx < columnsTotalCount; columnIdx++) {
        const column = processedColumns[columnIdx]
        const columnValue = column.value
        const uSize = columnValue / columnsTotalValue
        const uEnd = uStart + uSize

        // If the column is a gutter, we don't want to add a line
        if (!column.isGutter) {
          const curve = interpolateLineU(
            boundingCurves,
            { uStart, uSize, uEnd, vStart },
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

    // Because we support absolute pixel-based values for gutters, we need to
    // know how much space those gutters will take up so we can share the
    // remaining space between the non-pixel-based gutters and steps.
    const totalAbsoluteGutterSizeH =
      getTotalAbsoluteGutterSize(processedColumns)
    const totalAbsoluteGutterSizeV = getTotalAbsoluteGutterSize(processedRows)

    // Otherwise work our way through the grid
    for (let columnIdx = 0; columnIdx <= columnsTotalCount; columnIdx++) {
      const lineSections = []
      let vStart = 0

      for (let rowIdx = 0; rowIdx < rowsTotalCount; rowIdx++) {
        const row = processedRows[rowIdx]
        const rowValue = row.value
        const vSize = rowValue / rowsTotalValue
        const vEnd = vStart + vSize

        // If the column is a gutter, we don't want to add a line
        if (!row.isGutter) {
          const curve = interpolateLineV(
            boundingCurves,
            { vStart, vSize, vEnd, uStart },
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
          { u: uStart, v: vStart },
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
   * @param {object} [options] - Optional configuration.
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

      const selectedRowIdx = row * gutterMultiplierY
      const selectedColumnIdx = column * gutterMultiplierX
      const selectedRowTop = xAxis[selectedRowIdx]
      const selectedRowBottom = xAxis[selectedRowIdx + 1]
      const selectedRowLeft = yAxis[selectedColumnIdx]
      const selectedRowRight = yAxis[selectedColumnIdx + 1]

      const top = selectedRowTop[column]
      const bottom = selectedRowBottom[column]
      const left = selectedRowLeft[row]
      const right = selectedRowRight[row]

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
   * @param {object} [options] - Optional configuration.
   * @param {boolean} [options.makeBoundsCurvesSequential=false] - By default,
   * top and bottom bounding curves run left to right and left and right bounds
   * run top to bottom. This option will output bounds so that the bottom bounds
   * run right to left and the left bounds run bottom to top.
   * @param {boolean} [config.cellBoundsOrder=CellBoundsOrder.TTB_LTR] - This
   * property allows you to control the order in which the cell bounds are
   * returned. The default is top to bottom, left to right.
   *
   * @returns An array of bounding curves for each cell.
   */
  const getAllCellBounds = memoize(
    ({
      makeBoundsCurvesSequential = false,
      cellBoundsOrder = CellBoundsOrder.TTB_LTR,
    } = {}): BoundingCurvesWithMeta[] => {
      // We only want to run through steps that are not gutters so we filter
      // both rows and columns first
      const rowsThatAreNotGutters = rows.filter(isStepNotGutter)
      const columnsThatAreNotGutters = columns.filter(isStepNotGutter)

      const isVerticalFirst = getAreStepsVerticalFirst(cellBoundsOrder)

      const outerSteps = isVerticalFirst
        ? rowsThatAreNotGutters
        : columnsThatAreNotGutters

      const innerSteps = isVerticalFirst
        ? columnsThatAreNotGutters
        : rowsThatAreNotGutters

      const isOuterReversed = getIsOuterReversed(cellBoundsOrder)
      const isInnerReversed = getIsInnerReversed(cellBoundsOrder)
      const outerStepsLength = outerSteps.length
      const innerStepsLength = innerSteps.length

      const cellsBounds = []

      for (let i = 0; i < outerStepsLength; i++) {
        const outerIdxResolved = isOuterReversed ? outerStepsLength - i - 1 : i

        for (let j = 0; j < innerStepsLength; j++) {
          const innerIdxResolved = isInnerReversed
            ? innerStepsLength - j - 1
            : j

          const rowIdx = isVerticalFirst ? innerIdxResolved : outerIdxResolved
          const columnIdx = isVerticalFirst
            ? outerIdxResolved
            : innerIdxResolved
          cellsBounds.push(
            getCellBounds(rowIdx, columnIdx, {
              makeBoundsCurvesSequential,
            })
          )
        }
      }
      return cellsBounds
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
