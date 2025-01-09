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
import { getSize, getStepData, isGutterNonZero } from './utils/steps'
import {
  validateGetIntersectionsArguments,
  validateGetSquareArguments,
} from './validation'
import { getBezierCurveLength } from './utils/bezier'

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
  // Cache lengths of bounding curves for use in API
  const curveLengths = {
    top: getBezierCurveLength(boundingCurves.top),
    left: getBezierCurveLength(boundingCurves.left),
    bottom: getBezierCurveLength(boundingCurves.bottom),
    right: getBezierCurveLength(boundingCurves.right),
  }

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

  // Lines running vertically
  const getLinesXAxis = (): StepCurves[] => {
    const {
      processedColumns,
      processedRows,
      columnsTotalCount,
      rowsTotalCount,
      columnsTotalRatioValue,
      rowsTotalRatioValue,
      nonAbsoluteSpaceLeftRatio,
      nonAbsoluteSpaceRightRatio,
      nonAbsoluteSpaceTopRatio,
      nonAbsoluteSpaceBottomRatio,
    } = getStepData(columns, rows, curveLengths)

    const curves = []
    let vStart = 0
    let vOppositeStart = 0

    // Short circuit if we are only 1x1 and just return bounds
    if (columnsTotalCount === 1 && rowsTotalCount === 1) {
      return [[boundingCurves.top], [boundingCurves.bottom]]
    }

    // Otherwise work our way through the grid
    for (let rowIdx = 0; rowIdx <= rowsTotalCount; rowIdx++) {
      const lineSections: Curve[] = []
      let uStart = 0
      let uOppositeStart = 0

      processedColumns.map((column) => {
        const uSize = getSize(
          column,
          curveLengths.top,
          columnsTotalRatioValue,
          nonAbsoluteSpaceTopRatio
        )
        const uOppositeSize = getSize(
          column,
          curveLengths.bottom,
          columnsTotalRatioValue,
          nonAbsoluteSpaceBottomRatio
        )

        const uEnd = uStart + uSize
        const uOppositeEnd = uOppositeStart + uOppositeSize

        // If the column is a gutter, we don't want to add a line
        if (!column.isGutter) {
          const curve = interpolateLineU(
            boundingCurves,
            {
              uStart,
              uSize,
              uEnd,
              vStart,
              uOppositeEnd,
              uOppositeStart,
              uOppositeSize,
              vOppositeStart,
            },
            interpolatePointOnCurveU,
            interpolatePointOnCurveV
          )

          lineSections.push(curve)
        }

        uStart += uSize
        uOppositeStart += uOppositeSize
      })

      curves.push(lineSections)

      if (rowIdx < rowsTotalCount) {
        const row = processedRows[rowIdx]
        vStart += getSize(
          row,
          curveLengths.left,
          rowsTotalRatioValue,
          nonAbsoluteSpaceLeftRatio
        )
        vOppositeStart += getSize(
          row,
          curveLengths.right,
          rowsTotalRatioValue,
          nonAbsoluteSpaceRightRatio
        )
      }
    }

    return curves
  }

  // Lines running horizontally
  const getLinesYAxis = (): StepCurves[] => {
    const {
      processedColumns,
      processedRows,
      columnsTotalCount,
      rowsTotalCount,
      columnsTotalRatioValue,
      rowsTotalRatioValue,
      nonAbsoluteSpaceLeftRatio,
      nonAbsoluteSpaceRightRatio,
      nonAbsoluteSpaceTopRatio,
      nonAbsoluteSpaceBottomRatio,
    } = getStepData(columns, rows, curveLengths)

    const curves = []
    let uStart = 0
    let uOppositeStart = 0

    // Short circuit if we are only 1x1 and just return the bounds
    if (columnsTotalCount === 1 && rowsTotalCount === 1) {
      return [[boundingCurves.left], [boundingCurves.right]]
    }

    // Otherwise work our way through the grid
    for (let columnIdx = 0; columnIdx <= columnsTotalCount; columnIdx++) {
      const lineSections: Curve[] = []
      let vStart = 0
      let vOppositeStart = 0

      processedRows.map((row) => {
        const vSize = getSize(
          row,
          curveLengths.left,
          rowsTotalRatioValue,
          nonAbsoluteSpaceLeftRatio
        )
        const vOppositeSize = getSize(
          row,
          curveLengths.right,
          rowsTotalRatioValue,
          nonAbsoluteSpaceRightRatio
        )

        const vEnd = vStart + vSize
        const vOppositeEnd = vOppositeStart + vOppositeSize

        // If the column is a gutter, we don't want to add a line
        if (!row.isGutter) {
          const curve = interpolateLineV(
            boundingCurves,
            {
              vStart,
              vSize,
              vEnd,
              uStart,
              vOppositeEnd,
              vOppositeSize,
              vOppositeStart,
              uOppositeStart,
            },
            interpolatePointOnCurveU,
            interpolatePointOnCurveV
          )

          lineSections.push(curve)
        }

        vStart += vSize
        vOppositeStart += vOppositeSize
      })

      curves.push(lineSections)

      // Calculate the position of the next column
      if (columnIdx < columnsTotalCount) {
        const column = processedColumns[columnIdx]
        uStart += getSize(
          column,
          curveLengths.top,
          columnsTotalRatioValue,
          nonAbsoluteSpaceTopRatio
        )
        uOppositeStart += getSize(
          column,
          curveLengths.bottom,
          columnsTotalRatioValue,
          nonAbsoluteSpaceBottomRatio
        )
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
      columnsTotalRatioValue,
      rowsTotalRatioValue,
      nonAbsoluteSpaceLeftRatio,
      nonAbsoluteSpaceRightRatio,
      nonAbsoluteSpaceTopRatio,
      nonAbsoluteSpaceBottomRatio,
    } = getStepData(columns, rows, curveLengths)

    const intersections = []
    let vStart = 0
    let vOppositeStart = 0

    for (let rowIdx = 0; rowIdx <= rowsTotalCount; rowIdx++) {
      let uStart = 0
      let uOppositeStart = 0

      for (let columnIdx = 0; columnIdx <= columnsTotalCount; columnIdx++) {
        const point = interpolatePointOnSurfaceBilinear(
          boundingCurves,
          {
            u: uStart,
            v: vStart,
            uOpposite: uOppositeStart,
            vOpposite: vOppositeStart,
          },
          interpolatePointOnCurveU,
          interpolatePointOnCurveV
        )

        intersections.push(point)

        if (columnIdx !== columnsTotalCount) {
          const column = processedColumns[columnIdx]
          uStart += getSize(
            column,
            curveLengths.top,
            columnsTotalRatioValue,
            nonAbsoluteSpaceTopRatio
          )
          uOppositeStart += getSize(
            column,
            curveLengths.bottom,
            columnsTotalRatioValue,
            nonAbsoluteSpaceBottomRatio
          )
        }
      }

      if (rowIdx !== rowsTotalCount) {
        const row = processedRows[rowIdx]
        vStart += getSize(
          row,
          curveLengths.left,
          rowsTotalRatioValue,
          nonAbsoluteSpaceLeftRatio
        )
        vOppositeStart += getSize(
          row,
          curveLengths.right,
          rowsTotalRatioValue,
          nonAbsoluteSpaceRightRatio
        )
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

      // If there is a gutter, we need to skip over the gutter steps
      const gutterMultiplierX = isGutterNonZero(gutter[0]) ? 2 : 1
      const gutterMultiplierY = isGutterNonZero(gutter[1]) ? 2 : 1

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
