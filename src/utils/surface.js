import { COORDINATE } from '../const'
import { fitCubicBezierToPoints } from './bezier'

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const RATIO_MIDPOINT_1 = 0.25
const RATIO_MIDPOINT_2 = 0.75

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const getCoordinateOnSurface = (
  axis,
  { pointOnTopCurve, pointOnBottomCurve, pointOnLeftCurve, pointOnRightCurve },
  { cornerTopLeft, cornerTopRight, cornerBottomLeft, cornerBottomRight },
  u,
  v
) => {
  return (
    (1 - v) * pointOnTopCurve[axis] +
    v * pointOnBottomCurve[axis] +
    (1 - u) * pointOnLeftCurve[axis] +
    u * pointOnRightCurve[axis] -
    (1 - u) * (1 - v) * cornerTopLeft[axis] -
    u * (1 - v) * cornerTopRight[axis] -
    (1 - u) * v * cornerBottomLeft[axis] -
    u * v * cornerBottomRight[axis]
  )
}

const addAll = (list) => list.reduce((total, { value }) => total + value, 0)

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const getPointOnSurface = (
  { top, bottom, left, right },
  u,
  v,
  interpolatePointOnCurve
) => {
  const points = {
    pointOnTopCurve: interpolatePointOnCurve(u, top),
    pointOnBottomCurve: interpolatePointOnCurve(u, bottom),
    pointOnLeftCurve: interpolatePointOnCurve(v, left),
    pointOnRightCurve: interpolatePointOnCurve(v, right),
  }

  const corners = {
    cornerBottomLeft: bottom.startPoint,
    cornerBottomRight: bottom.endPoint,
    cornerTopLeft: top.startPoint,
    cornerTopRight: top.endPoint,
  }

  return {
    x: getCoordinateOnSurface(COORDINATE.X, points, corners, u, v),
    y: getCoordinateOnSurface(COORDINATE.Y, points, corners, u, v),
  }
}

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
    rowStartRatio + rowRatio * RATIO_MIDPOINT_1,
    interpolatePointOnCurve
  )

  const midPoint2 = getPointOnSurface(
    boundingCurves,
    columnStartRatio,
    rowStartRatio + rowRatio * RATIO_MIDPOINT_2,
    interpolatePointOnCurve
  )

  const curve = fitCubicBezierToPoints(
    [startPoint, midPoint1, midPoint2, endPoint],
    [0, RATIO_MIDPOINT_1, RATIO_MIDPOINT_2, 1]
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
    columnStartRatio + columnWidthRatio * RATIO_MIDPOINT_1,
    rowStartRatio,
    interpolatePointOnCurve
  )

  const midPoint2 = getPointOnSurface(
    boundingCurves,
    columnStartRatio + columnWidthRatio * RATIO_MIDPOINT_2,
    rowStartRatio,
    interpolatePointOnCurve
  )

  const curve = fitCubicBezierToPoints(
    [startPoint, midPoint1, midPoint2, endPoint],
    [0, RATIO_MIDPOINT_1, RATIO_MIDPOINT_2, 1]
  )
  return curve
}

export const getLinesOnXAxis = (
  boundingCurves,
  columns,
  rows,
  gutter,
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
  if (columns.length === 1 && rows.length === 1) {
    return [[boundingCurves.left], [boundingCurves.right]]
  }

  for (let columnIdx = 0; columnIdx <= columnsTotalCount; columnIdx++) {
    const lineSections = []
    const columnValue = columns[columnIdx]?.value
    const columnWidthRatio = columnValue / columnsTotalValue

    let rowStartRatio = 0

    for (let rowIdx = 0; rowIdx < rowsTotalCount; rowIdx++) {
      const rowValue = rows[rowIdx]?.value
      const rowRatio = rowValue / rowsTotalValue
      const rowEndRatio = rowStartRatio + rowRatio

      const curve = getLineOnYAxis(
        boundingCurves,
        rowStartRatio,
        rowRatio,
        rowEndRatio,
        columnStartRatio,
        interpolatePointOnCurve
      )

      rowStartRatio = rowStartRatio + rowRatio

      lineSections.push({
        ...curve,
      })
    }
    columnStartRatio = columnStartRatio + columnWidthRatio
    curves.push(lineSections)
  }

  return curves
}

export const getLinesOnYAxis = (
  boundingCurves,
  columns,
  rows,
  gutter,
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
  if (columns.length === 1 && rows.length === 1) {
    return [[boundingCurves.top], [boundingCurves.bottom]]
  }

  for (let rowIdx = 0; rowIdx <= rowsTotalCount; rowIdx++) {
    const lineSections = []
    const rowValue = rows[rowIdx]?.value
    const rowRatio = rowValue / rowsTotalValue

    let columnStartRatio = 0

    for (let columnIdx = 0; columnIdx < columnsTotalCount; columnIdx++) {
      const columnValue = columns[columnIdx]?.value
      const columnWidthRatio = columnValue / columnsTotalValue
      const columnEndRatio = columnStartRatio + columnWidthRatio

      const curve = getLineOnXAxis(
        boundingCurves,
        columnStartRatio,
        columnWidthRatio,
        columnEndRatio,
        rowStartRatio,
        interpolatePointOnCurve
      )

      columnStartRatio = columnStartRatio + columnWidthRatio
      lineSections.push({
        ...curve,
      })
    }

    rowStartRatio = rowStartRatio + rowRatio
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
  const intersections = []
  const columnsTotal = columns.length
  const columnsTotalValue = addAll(columns)
  const rowsTotal = rows.length
  const rowsTotalValue = addAll(rows)

  let rowStartRatio = 0

  for (let rowIdx = 0; rowIdx <= rowsTotal; rowIdx++) {
    const rowValue = rows[rowIdx]?.value
    const rowRatio = rowValue / rowsTotalValue

    let columnStartRatio = 0

    for (let columnIdx = 0; columnIdx <= columnsTotal; columnIdx++) {
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
