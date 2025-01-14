import coonsPatch from 'coons-patch'
import memoize from 'fast-memoize'

import { CellBoundsOrder } from './enums'
import type {
  BoundingCurves,
  BoundingCurvesWithMeta,
  Curve,
  GetAllCellBoundsProps,
  GetPointProps,
  GridApi,
  InterpolateLineU,
  InterpolateLineV,
  InterpolatePointOnCurve,
  InterpolationParamsU,
  InterpolationParamsV,
  LinesByAxis,
  Point,
  Step,
} from './types'
import { getEndValues, getStepData, isGutterNonZero } from './utils/steps'
import {
  validateGetIntersectionsArguments,
  validateGetPointArguments,
  validateGetSquareArguments,
} from './validation'
import { getBezierCurveLength } from './utils/bezier'
import { mapObj } from './utils/functional'

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

const getIsStepNotGutter = (step: Step): boolean => !step.isGutter

const getCurveReversed = (curve: Curve) => {
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

const clampT = (t: number): number => Math.min(Math.max(t, 0), 1)

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

/**
 * Creates a grid API instance with the specified configuration.
 * @param boundingCurves The curves defining the grid boundaries.
 * @param columns Array of steps defining column structure.
 * @param rows Array of steps defining row structure.
 * @param gutter The horizontal and vertical spacing between cells.
 * @param config Object containing interpolation functions for grid calculations.
 * @returns API interacting with the defined grid.
 * @throws ValidationError When grid boundaries are invalid or interpolation functions are missing.
 */
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

  const getPoint = memoize((params: GetPointProps): Point => {
    validateGetPointArguments(params)
    return coonsPatch(boundingCurves, params, {
      interpolatePointOnCurveU,
      interpolatePointOnCurveV,
    })
  })

  const getLinesXAxis = (): Curve[][] => {
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
        const [uEnd, uOppositeEnd] = getEndValues(
          column,
          columnsTotalRatioValue,
          {
            start: uStart,
            curveLength: curveLengths.top,
            nonAbsoluteRatio: nonAbsoluteSpaceTopRatio,
          },
          {
            start: uOppositeStart,
            curveLength: curveLengths.bottom,
            nonAbsoluteRatio: nonAbsoluteSpaceBottomRatio,
          }
        )

        // If the column is a gutter, we don't want to add a line
        if (!column.isGutter) {
          const paramsClamped: InterpolationParamsU = mapObj<
            number,
            InterpolationParamsU
          >(clampT, {
            uStart,
            uEnd,
            vStart,
            uOppositeStart,
            uOppositeEnd,
            vOppositeStart,
          })

          const curve = interpolateLineU(
            boundingCurves,
            paramsClamped,
            interpolatePointOnCurveU,
            interpolatePointOnCurveV
          )

          lineSections.push(curve)
        }

        // Only update after we have saved the curve
        uStart = uEnd
        uOppositeStart = uOppositeEnd
      })

      curves.push(lineSections)

      if (rowIdx < rowsTotalCount) {
        const row = processedRows[rowIdx]
        const [vEnd, vOppositeEnd] = getEndValues(
          row,
          rowsTotalRatioValue,
          {
            start: vStart,
            curveLength: curveLengths.left,
            nonAbsoluteRatio: nonAbsoluteSpaceLeftRatio,
          },
          {
            start: vOppositeStart,
            curveLength: curveLengths.right,
            nonAbsoluteRatio: nonAbsoluteSpaceRightRatio,
          }
        )
        vStart = vEnd
        vOppositeStart = vOppositeEnd
      }
    }
    return curves
  }

  const getLinesYAxis = (): Curve[][] => {
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
        const [vEnd, vOppositeEnd] = getEndValues(
          row,
          rowsTotalRatioValue,
          {
            start: vStart,
            curveLength: curveLengths.left,
            nonAbsoluteRatio: nonAbsoluteSpaceLeftRatio,
          },
          {
            start: vOppositeStart,
            curveLength: curveLengths.right,
            nonAbsoluteRatio: nonAbsoluteSpaceRightRatio,
          }
        )

        // If the column is a gutter, we don't want to add a line
        if (!row.isGutter) {
          const paramsClamped: InterpolationParamsV = mapObj<
            number,
            InterpolationParamsV
          >(clampT, {
            vStart,
            vEnd,
            uStart,
            vOppositeStart,
            vOppositeEnd,
            uOppositeStart,
          })

          const curve = interpolateLineV(
            boundingCurves,
            paramsClamped,
            interpolatePointOnCurveU,
            interpolatePointOnCurveV
          )

          lineSections.push(curve)
        }

        // Only update after we have saved the curve
        vStart = vEnd
        vOppositeStart = vOppositeEnd
      })

      curves.push(lineSections)

      // Calculate the position of the next column
      if (columnIdx < columnsTotalCount) {
        const column = processedColumns[columnIdx]

        const [uEnd, uOppositeEnd] = getEndValues(
          column,
          columnsTotalRatioValue,
          {
            start: uStart,
            curveLength: curveLengths.top,
            nonAbsoluteRatio: nonAbsoluteSpaceTopRatio,
          },
          {
            start: uOppositeStart,
            curveLength: curveLengths.bottom,
            nonAbsoluteRatio: nonAbsoluteSpaceBottomRatio,
          }
        )

        uStart = uEnd
        uOppositeStart = uOppositeEnd
      }
    }

    return curves
  }

  const getLines = memoize((): LinesByAxis => {
    return {
      xAxis: getLinesXAxis(),
      yAxis: getLinesYAxis(),
    }
  })

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
        const point = coonsPatch(
          boundingCurves,
          {
            u: uStart,
            v: vStart,
            uOpposite: uOppositeStart,
            vOpposite: vOppositeStart,
          },
          { interpolatePointOnCurveU, interpolatePointOnCurveV }
        )

        intersections.push(point)

        if (columnIdx !== columnsTotalCount) {
          const column = processedColumns[columnIdx]
          const [uEnd, uOppositeEnd] = getEndValues(
            column,
            columnsTotalRatioValue,
            {
              start: uStart,
              curveLength: curveLengths.top,
              nonAbsoluteRatio: nonAbsoluteSpaceTopRatio,
            },
            {
              start: uOppositeStart,
              curveLength: curveLengths.bottom,
              nonAbsoluteRatio: nonAbsoluteSpaceBottomRatio,
            }
          )
          uStart = uEnd
          uOppositeStart = uOppositeEnd
        }
      }

      if (rowIdx !== rowsTotalCount) {
        const row = processedRows[rowIdx]
        const [vEnd, vOppositeEnd] = getEndValues(
          row,
          rowsTotalRatioValue,
          {
            start: vStart,
            curveLength: curveLengths.left,
            nonAbsoluteRatio: nonAbsoluteSpaceLeftRatio,
          },
          {
            start: vOppositeStart,
            curveLength: curveLengths.right,
            nonAbsoluteRatio: nonAbsoluteSpaceRightRatio,
          }
        )
        vStart = vEnd
        vOppositeStart = vOppositeEnd
      }
    }

    return intersections
  })

  const getCellBounds = memoize(
    (
      columnIdx: number,
      rowIdx: number,
      { makeBoundsCurvesSequential = false } = {}
    ): BoundingCurvesWithMeta => {
      validateGetSquareArguments(columnIdx, rowIdx, columns, rows)

      const { xAxis, yAxis } = getLines()

      // If there is a gutter, we need to skip over the gutter steps
      const gutterMultiplierX = isGutterNonZero(gutter[0]) ? 2 : 1
      const gutterMultiplierY = isGutterNonZero(gutter[1]) ? 2 : 1

      const selectedRowIdx = rowIdx * gutterMultiplierY
      const selectedColumnIdx = columnIdx * gutterMultiplierX
      const selectedRowTop = xAxis[selectedRowIdx]
      const selectedRowBottom = xAxis[selectedRowIdx + 1]
      const selectedRowLeft = yAxis[selectedColumnIdx]
      const selectedRowRight = yAxis[selectedColumnIdx + 1]

      const top = selectedRowTop[columnIdx]
      const bottom = selectedRowBottom[columnIdx]
      const left = selectedRowLeft[rowIdx]
      const right = selectedRowRight[rowIdx]

      return {
        meta: {
          row: rowIdx,
          column: columnIdx,
        },
        top,
        bottom: makeBoundsCurvesSequential ? getCurveReversed(bottom) : bottom,
        left: makeBoundsCurvesSequential ? getCurveReversed(left) : left,
        right,
      }
    }
  )

  const getAllCellBounds = memoize(
    ({
      makeBoundsCurvesSequential = false,
      cellBoundsOrder = CellBoundsOrder.TTB_LTR,
    }: GetAllCellBoundsProps = {}): BoundingCurvesWithMeta[] => {
      // We only want to run through steps that are not gutters so we filter
      // both rows and columns first
      const rowsThatAreNotGutters = rows.filter(getIsStepNotGutter)
      const columnsThatAreNotGutters = columns.filter(getIsStepNotGutter)

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
