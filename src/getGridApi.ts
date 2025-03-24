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
} from './types'
import { getEndValues, getNonGutterSteps, getStepData } from './utils/steps'
import {
  validateGetAllCellBoundsArguments,
  validateGetPointArguments,
  validateGetGridSquareArguments,
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

const getIsOuterReversed = (
  cellBoundsOrder: CellBoundsOrder,
  isVerticalFirst: boolean
): boolean => {
  // If we are vertical first, anything starting with BTT is reversed
  // If we are not, anything starting with RTL is reversed
  const reversedEntries = isVerticalFirst
    ? [CellBoundsOrder.BTT_LTR, CellBoundsOrder.BTT_RTL]
    : [CellBoundsOrder.RTL_TTB, CellBoundsOrder.RTL_BTT]

  return reversedEntries.includes(cellBoundsOrder)
}

const getIsInnerReversed = (
  cellBoundsOrder: CellBoundsOrder,
  isVerticalFirst: boolean
): boolean => {
  // If we are vertical first, anything ending with RTL is reversed
  // If we are not, anything ending with BTT is reversed
  const reversedEntries = isVerticalFirst
    ? [CellBoundsOrder.TTB_RTL, CellBoundsOrder.BTT_RTL]
    : [CellBoundsOrder.RTL_BTT, CellBoundsOrder.LTR_BTT]

  return reversedEntries.includes(cellBoundsOrder)
}

const clampT = (t: number): number => Math.min(Math.max(t, 0), 1)

const mapClampT = <T>(o: ObjectWithStringKeys) =>
  mapObj<number, ObjectWithStringKeys>(clampT, o) as T

// Deal with case where there are multiple gutters in a row
const previousWasAlsoGutter = (steps: Step[], stepIdx: number): boolean =>
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

export const getAllCellCornerPoints = (curves: Curve[][]) =>
  curves.reduce<Point[]>((acc: Point[], items: Curve[]) => {
    const subItems: Point[] = items.reduce<Point[]>(
      (acc: Point[], curve: Curve) => [
        ...acc,
        curve.startPoint,
        curve.endPoint,
      ],
      []
    )
    return [...acc, ...subItems]
  }, [])

const iterateOverSteps = (
  rows: Step[],
  columns: Step[],
  cellBoundsOrder: CellBoundsOrder,
  getBoundingCurves: (
    rowIdx: number,
    columnIdx: number
  ) => BoundingCurvesWithMeta
) => {
  const nonGutterRows = getNonGutterSteps(rows)
  const nonGutterColumns = getNonGutterSteps(columns)

  // If cellBoundsOrder starts with either TTB or BTT then outer steps are
  // vertical, so we are vertical first
  const isVerticalFirst = getAreStepsVerticalFirst(cellBoundsOrder)

  const outerSteps = isVerticalFirst ? nonGutterRows : nonGutterColumns
  const innerSteps = isVerticalFirst ? nonGutterColumns : nonGutterRows

  const outerStepsLength = outerSteps.length
  const innerStepsLength = innerSteps.length

  const isOuterReversed = getIsOuterReversed(cellBoundsOrder, isVerticalFirst)
  const isInnerReversed = getIsInnerReversed(cellBoundsOrder, isVerticalFirst)

  const items = []
  for (let i = 0; i < outerStepsLength; i++) {
    const outerIdxResolved = isOuterReversed ? outerStepsLength - i - 1 : i

    for (let j = 0; j < innerStepsLength; j++) {
      const innerIdxResolved = isInnerReversed ? innerStepsLength - j - 1 : j

      const rowIdx = isVerticalFirst ? innerIdxResolved : outerIdxResolved
      const columnIdx = isVerticalFirst ? outerIdxResolved : innerIdxResolved
      items.push(getBoundingCurves(rowIdx, columnIdx))
    }
  }
  return items
}

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
          !previousWasAlsoGutter(rows, rowIdx)
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
          !previousWasAlsoGutter(columns, columnIdx)
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
    const { xAxis } = getLines()

    const intersections = getAllCellCornerPoints(xAxis)
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
      validateGetGridSquareArguments(
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

      return iterateOverSteps(
        rows,
        columns,
        cellBoundsOrder,
        (rowIdx: number, columnIdx: number) =>
          getCellBounds(rowIdx, columnIdx, {
            makeBoundsCurvesSequential,
          })
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
