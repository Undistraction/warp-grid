import { fitCubicBezierToPoints } from './bezier'
import { getPointOnSurface } from './coons'

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const T_MIDPOINT_1 = 0.25
const T_MIDPOINT_2 = 0.75

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const addAll = (list) => list.reduce((total, { value }) => total + value, 0)

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const getStraightLineOnXAxis = (
  boundingCurves,
  rowStartRatio,
  rowRatio,
  rowEndRatio,
  columnStartRatio,
  interpolatePointOnCurve
) => {
  const startPoint = getPointOnSurface(
    boundingCurves,
    columnStartRatio,
    rowStartRatio,
    interpolatePointOnCurve
  )

  const endPoint = getPointOnSurface(
    boundingCurves,
    columnStartRatio,
    rowEndRatio,
    interpolatePointOnCurve
  )

  // Set the control points to the start and end points so the line is straight
  return {
    startPoint,
    endPoint,
    controlPoint1: startPoint,
    controlPoint2: endPoint,
  }
}

export const getStraightLineOnYAxis = (
  boundingCurves,
  columnStartRatio,
  columnWidthRatio,
  columnEndRatio,
  rowStartRatio,
  interpolatePointOnCurve
) => {
  const startPoint = getPointOnSurface(
    boundingCurves,
    columnStartRatio,
    rowStartRatio,
    interpolatePointOnCurve
  )

  const endPoint = getPointOnSurface(
    boundingCurves,
    columnEndRatio,
    rowStartRatio,
    interpolatePointOnCurve
  )

  // Set the control points to the start and end points so the line is straight
  return {
    startPoint,
    endPoint,
    controlPoint1: startPoint,
    controlPoint2: endPoint,
  }
}

export const getCurveOnXAxis = (
  boundingCurves,
  rowStartRatio,
  rowRatio,
  rowEndRatio,
  columnStartRatio,
  interpolatePointOnCurve
) => {
  const { startPoint, endPoint } = getStraightLineOnXAxis(
    boundingCurves,
    rowStartRatio,
    rowRatio,
    rowEndRatio,
    columnStartRatio,
    interpolatePointOnCurve
  )

  const midPoint1 = getPointOnSurface(
    boundingCurves,
    columnStartRatio,
    rowStartRatio + rowRatio * T_MIDPOINT_1,
    interpolatePointOnCurve
  )

  const midPoint2 = getPointOnSurface(
    boundingCurves,
    columnStartRatio,
    rowStartRatio + rowRatio * T_MIDPOINT_2,
    interpolatePointOnCurve
  )

  const curve = fitCubicBezierToPoints(
    [startPoint, midPoint1, midPoint2, endPoint],
    [0, T_MIDPOINT_1, T_MIDPOINT_2, 1]
  )

  return curve
}

export const getCurveOnYAxis = (
  boundingCurves,
  columnStartRatio,
  columnWidthRatio,
  columnEndRatio,
  rowStartRatio,
  interpolatePointOnCurve
) => {
  const { startPoint, endPoint } = getStraightLineOnYAxis(
    boundingCurves,
    columnStartRatio,
    columnWidthRatio,
    columnEndRatio,
    rowStartRatio,
    interpolatePointOnCurve
  )

  const midPoint1 = getPointOnSurface(
    boundingCurves,
    columnStartRatio + columnWidthRatio * T_MIDPOINT_1,
    rowStartRatio,
    interpolatePointOnCurve
  )

  const midPoint2 = getPointOnSurface(
    boundingCurves,
    columnStartRatio + columnWidthRatio * T_MIDPOINT_2,
    rowStartRatio,
    interpolatePointOnCurve
  )

  const curve = fitCubicBezierToPoints(
    [startPoint, midPoint1, midPoint2, endPoint],
    [0, T_MIDPOINT_1, T_MIDPOINT_2, 1]
  )
  return curve
}

export const getLinesOnXAxis = (
  boundingCurves,
  columns,
  rows,
  getLineOnXAxis,
  interpolatePointOnCurve
) => {
  const columnsTotalCount = columns.length
  const rowsTotalCount = rows.length

  const columnsTotalValue = addAll(columns)
  const rowsTotalValue = addAll(rows)

  const curves = []
  let rowStartRatio = 0

  // Short circuit if we are only 1x1
  if (columnsTotalCount === 1 && rowsTotalCount === 1) {
    return [[boundingCurves.top], [boundingCurves.bottom]]
  }

  for (let rowIdx = 0; rowIdx <= rowsTotalCount; rowIdx++) {
    const row = rows[rowIdx]
    const rowValue = row?.value
    const rowRatio = rowValue / rowsTotalValue

    const lineSections = []

    let columnStartRatio = 0

    for (let columnIdx = 0; columnIdx < columnsTotalCount; columnIdx++) {
      const column = columns[columnIdx]
      const columnValue = column?.value
      const { isGutter = false } = column
      const columnWidthRatio = columnValue / columnsTotalValue
      const columnEndRatio = columnStartRatio + columnWidthRatio

      if (!isGutter) {
        const curve = getLineOnXAxis(
          boundingCurves,
          columnStartRatio,
          columnWidthRatio,
          columnEndRatio,
          rowStartRatio,
          interpolatePointOnCurve
        )

        lineSections.push(curve)
      }

      columnStartRatio = columnStartRatio + columnWidthRatio
    }

    rowStartRatio = rowStartRatio + rowRatio
    curves.push(lineSections)
  }

  return curves
}

export const getLinesOnYAxis = (
  boundingCurves,
  columns,
  rows,
  getLineOnYAxis,
  interpolatePointOnCurve
) => {
  const columnsTotalCount = columns.length
  const rowsTotalCount = rows.length

  const columnsTotalValue = addAll(columns)
  const rowsTotalValue = addAll(rows)

  const curves = []
  let columnStartRatio = 0

  // Short circuit if we are only 1x1 and just return the bounds
  if (columnsTotalCount === 1 && rowsTotalCount === 1) {
    return [[boundingCurves.left], [boundingCurves.right]]
  }

  for (let columnIdx = 0; columnIdx <= columnsTotalCount; columnIdx++) {
    const column = columns[columnIdx]
    const columnValue = column?.value
    const columnWidthRatio = columnValue / columnsTotalValue

    const lineSections = []

    let rowStartRatio = 0

    for (let rowIdx = 0; rowIdx < rowsTotalCount; rowIdx++) {
      const row = rows[rowIdx]
      const rowValue = row?.value
      const rowRatio = rowValue / rowsTotalValue
      const rowEndRatio = rowStartRatio + rowRatio
      const { isGutter = false } = row

      if (!isGutter) {
        const curve = getLineOnYAxis(
          boundingCurves,
          rowStartRatio,
          rowRatio,
          rowEndRatio,
          columnStartRatio,
          interpolatePointOnCurve
        )

        lineSections.push(curve)
      }

      rowStartRatio = rowStartRatio + rowRatio
    }
    columnStartRatio = columnStartRatio + columnWidthRatio
    curves.push(lineSections)
  }

  return curves
}

export const getGridIntersections = (
  boundingCurves,
  columns,
  rows,
  interpolatePointOnCurve
) => {
  const columnsTotalCount = columns.length
  const rowsTotalCount = rows.length

  const columnsTotalValue = addAll(columns)
  const rowsTotalValue = addAll(rows)

  const intersections = []

  let rowStartRatio = 0

  for (let rowIdx = 0; rowIdx <= rowsTotalCount; rowIdx++) {
    const rowValue = rows[rowIdx]?.value
    const rowRatio = rowValue / rowsTotalValue

    let columnStartRatio = 0

    for (let columnIdx = 0; columnIdx <= columnsTotalCount; columnIdx++) {
      const columnValue = columns[columnIdx]?.value
      const columnWidthRatio = columnValue / columnsTotalValue

      const point = getPointOnSurface(
        boundingCurves,
        columnStartRatio,
        rowStartRatio,
        interpolatePointOnCurve
      )

      intersections.push(point)
      columnStartRatio = columnStartRatio + columnWidthRatio
    }
    rowStartRatio = rowStartRatio + rowRatio
  }

  return intersections
}
