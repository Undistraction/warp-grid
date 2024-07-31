import {
  getSurfaceCurves,
  getSurfaceIntersectionPoints,
  getSurfacePoint,
} from 'coons-patch'
import memoize from 'fast-memoize'
import { mapObj } from './utils/functional'
import { validateGetSquareArguments } from './validation'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const stepIsNotGutter = (step) => !step.isGutter

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const getApi = (
  boundingCurves,
  columns,
  rows,
  gutter,
  { interpolatePointOnCurve, interpolateLineU, interpolateLineV }
) => {
  const getPoint = (u, v) => {
    return getSurfacePoint(boundingCurves, u, v, { interpolatePointOnCurve })
  }

  const getLines = () => {
    const { u, v } = getSurfaceCurves(boundingCurves, columns, rows, {
      interpolatePointOnCurve,
      interpolateLineU,
      interpolateLineV,
    })
    return {
      xAxis: u,
      yAxis: v,
    }
  }

  const getIntersections = () => {
    return getSurfaceIntersectionPoints(boundingCurves, columns, rows, {
      interpolatePointOnCurve,
    })
  }

  // Get four curves that describe the bounds of the grid-square with the
  // supplied grid coordinates
  const getGridCellBounds = (x, y) => {
    validateGetSquareArguments(x, y, columns, rows)

    const { u, v } = getLines()

    // If there is a gutter, we need to skip over the gutter space
    const gutterMultiplier = gutter > 0 ? 2 : 1

    return {
      top: u[y * gutterMultiplier][x],
      bottom: u[y * gutterMultiplier + 1][x],
      left: v[x * gutterMultiplier][y],
      right: v[x * gutterMultiplier + 1][y],
    }
  }

  const getAllGridCellBounds = () => {
    // We only want to run through steps that are not gutters so we filter both
    // rows and columns first
    return columns.filter(stepIsNotGutter).reduce((acc, column, columnIdx) => {
      const cellBounds = rows.filter(stepIsNotGutter).map((row, rowIdx) => {
        return getGridCellBounds(columnIdx, rowIdx)
      })
      return [...acc, ...cellBounds]
    }, [])
  }

  return mapObj(memoize, {
    getPoint,
    getLines,
    getIntersections,
    getGridCellBounds,
    getAllGridCellBounds,
  })
}

export default getApi
