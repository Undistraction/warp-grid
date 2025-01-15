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
  ObjectWithStringKeys,
  LinesByAxis,
  Point,
  Step,
  InterpolationParameters,
} from './types'
import { getEndValues, getNonGutterSteps, getStepData } from './utils/steps'
import {
  validateGetAllCellBoundsArguments,
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

interface GetStepIdxIncludingGuttersAcc {
  isComplete?: boolean
  value: number
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

const mapClampT = <T>(o: ObjectWithStringKeys) =>
  mapObj<number, ObjectWithStringKeys>(clampT, o) as T

// Deal with case where there are multiple gutters in a row

const isSecondGutterInSequence = (steps: Step[], stepIdx: number): boolean =>
  !!(
    stepIdx > 0 &&
    steps[stepIdx - 1].isGutter &&
    steps[stepIdx] &&
    steps[stepIdx].isGutter
  )

// We need to account for gutters when calculating the index of the step
const getStepIdxIncludingGutters = (stepIdx: number, steps: Step[]) =>
  steps.reduce<GetStepIdxIncludingGuttersAcc>(
    (acc, step, idx) => {
      if (acc.isComplete) {
        return acc
      }

      if (step.isGutter) {
        return acc
      } else {
        if (acc.value === stepIdx) {
          return { value: idx, isComplete: true }
        }
        return {
          value: acc.value + 1,
        }
      }
    },
    { value: 0 }
  ).value

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

  // Horizontal lines
  // Outer array represents rows, inner array represents horizontal line
  // sections for each column within that row
  const getLinesXAxis = memoize((): Curve[][] => {
    const curves = []
    let vStart = 0
    let vOppositeStart = 0

    // Short circuit if we are only 1x1 and just return bounds
    if (columnsTotalCount === 1 && rowsTotalCount === 1) {
      return [[boundingCurves.top], [boundingCurves.bottom]]
    }

    // Otherwise work our way through the grid building all the horizontal lines
    // that make up a row.
    for (let rowIdx = 0; rowIdx <= rowsTotalCount; rowIdx++) {
      const lineSections: Curve[] = []
      let uStart = 0
      let uOppositeStart = 0
      const row = processedRows[rowIdx]

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

        const isFirstRowAndRowIsGutter = rowIdx === 0 && row.isGutter

        if (
          !column.isGutter &&
          !isFirstRowAndRowIsGutter &&
          !isSecondGutterInSequence(rows, rowIdx)
        ) {
          const paramsClamped: InterpolationParamsU =
            mapClampT<InterpolationParamsU>({
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
  })

  // Vertical lines Outer array represents columns, inner array represents line
  // sections for each row within that column
  const getLinesYAxis = memoize((): Curve[][] => {
    const curves = []
    let uStart = 0
    let uOppositeStart = 0

    // Short circuit if we are only 1x1 and just return the bounds
    if (columnsTotalCount === 1 && rowsTotalCount === 1) {
      return [[boundingCurves.left], [boundingCurves.right]]
    }

    // Otherwise work our way through the grid building all the vertical lines
    // that make up a column.
    for (let columnIdx = 0; columnIdx <= columnsTotalCount; columnIdx++) {
      const lineSections: Curve[] = []
      let vStart = 0
      let vOppositeStart = 0
      const column = processedColumns[columnIdx]

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

        const isFirstColumnAndColumnIsGutter =
          columnIdx === 0 && column.isGutter

        if (
          !row.isGutter &&
          !isFirstColumnAndColumnIsGutter &&
          !isSecondGutterInSequence(columns, columnIdx)
        ) {
          const paramsClamped: InterpolationParamsV =
            mapClampT<InterpolationParamsV>({
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
  })

  const getLines = memoize((): LinesByAxis => {
    return {
      xAxis: getLinesXAxis(),
      yAxis: getLinesYAxis(),
    }
  })

  const getIntersections = memoize((): Point[] => {
    const intersections = []
    let vStart = 0
    let vOppositeStart = 0

    for (let rowIdx = 0; rowIdx <= rowsTotalCount; rowIdx++) {
      let uStart = 0
      let uOppositeStart = 0

      for (let columnIdx = 0; columnIdx <= columnsTotalCount; columnIdx++) {
        const paramsClamped = mapClampT<InterpolationParameters>({
          u: uStart,
          v: vStart,
          uOpposite: uOppositeStart,
          vOpposite: vOppositeStart,
        })

        const point = coonsPatch(boundingCurves, paramsClamped, {
          interpolatePointOnCurveU,
          interpolatePointOnCurveV,
        })

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
      { makeBoundsCurvesSequential = false }: GetAllCellBoundsProps = {}
    ): BoundingCurvesWithMeta => {
      const nonGutterColumns = getNonGutterSteps(columns)
      const nonGutterRows = getNonGutterSteps(rows)
      validateGetSquareArguments(
        columnIdx,
        rowIdx,
        nonGutterColumns,
        nonGutterRows
      )

      // We need to account for gutters when calculating the index of the column
      // const columnIdxAccountingForGutters = getIdx(columnIdx,
      // processedColumns)
      const rowIdxIncludingGutters = getStepIdxIncludingGutters(
        rowIdx,
        processedRows
      )
      const columnIdxIncludingGutters = getStepIdxIncludingGutters(
        columnIdx,
        processedColumns
      )

      const { xAxis, yAxis } = getLines()

      const top = xAxis[rowIdxIncludingGutters][columnIdx]
      const bottom = xAxis[rowIdxIncludingGutters + 1][columnIdx]
      const left = yAxis[columnIdxIncludingGutters][rowIdx]
      const right = yAxis[columnIdxIncludingGutters + 1][rowIdx]

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
      validateGetAllCellBoundsArguments(
        makeBoundsCurvesSequential,
        cellBoundsOrder
      )

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
