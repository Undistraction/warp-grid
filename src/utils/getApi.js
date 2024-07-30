import memoize from 'fast-memoize'
import {
  getCurveIntersections,
  getCurvesOnXAxis,
  getCurvesOnYAxis,
} from './coonsPatch'
import { mapObj } from './functional'
import { interpolatePointOnSurface } from './interpolate/pointOnSurface/bilinear'
import {
  validateGetPointArguments,
  validateGetSquareArguments,
} from './validation'

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
  { interpolatePointOnCurve, interpolateLineOnXAxis, interpolateLineOnYAxis }
) => {
  const getPoint = (ratioX, ratioY) => {
    validateGetPointArguments(ratioX, ratioY)
    return interpolatePointOnSurface(
      boundingCurves,
      ratioX,
      ratioY,
      interpolatePointOnCurve
    )
  }

  const getLines = () => {
    return {
      xAxis: getCurvesOnXAxis(
        boundingCurves,
        columns,
        rows,
        interpolateLineOnXAxis,
        interpolatePointOnCurve
      ),
      yAxis: getCurvesOnYAxis(
        boundingCurves,
        columns,
        rows,
        interpolateLineOnYAxis,
        interpolatePointOnCurve
      ),
    }
  }

  const getIntersections = () => {
    return getCurveIntersections(
      boundingCurves,
      columns,
      rows,
      interpolatePointOnCurve
    )
  }

  // Get four curves that describe the bounds of the grid-square with the
  // supplied grid coordinates
  const getGridCellBounds = (x, y) => {
    validateGetSquareArguments(x, y, columns, rows)

    const { xAxis, yAxis } = getLines()

    // If there is a gutter, we need to skip over the gutter space
    const gutterMultiplier = gutter > 0 ? 2 : 1

    return {
      top: xAxis[y * gutterMultiplier][x],
      bottom: xAxis[y * gutterMultiplier + 1][x],
      left: yAxis[x * gutterMultiplier][y],
      right: yAxis[x * gutterMultiplier + 1][y],
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
