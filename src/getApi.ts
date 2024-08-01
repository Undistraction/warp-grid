import {
  getSurfaceCurves,
  getSurfaceIntersectionPoints,
  getSurfacePoint,
} from 'coons-patch'
import memoize from 'fast-memoize'
import {
  BoundingCurves,
  GridApi,
  InterpolateLineU,
  InterpolateLineV,
  InterpolatePointOnCurve,
  Lines,
  Point,
  Step,
} from './types'
import { mapObj } from './utils/functional'
import { validateGetSquareArguments } from './validation'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// Internal
type GetAPiCnfig = {
  interpolatePointOnCurve: InterpolatePointOnCurve
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
  gutter: number,
  { interpolatePointOnCurve, interpolateLineU, interpolateLineV }: GetAPiCnfig
): GridApi => {
  const getPoint = (u: number, v: number): Point => {
    return getSurfacePoint(boundingCurves, u, v, { interpolatePointOnCurve })
  }

  const getLines = (): Lines => {
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

  const getIntersections = (): Point[] => {
    return getSurfaceIntersectionPoints(boundingCurves, columns, rows, {
      interpolatePointOnCurve,
    })
  }

  // Get four curves that describe the bounds of the grid-square with the
  // supplied grid coordinates
  const getGridCellBounds = (x: number, y: number): BoundingCurves => {
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

  const getAllGridCellBoundsReducer = (
    acc: BoundingCurves[],
    column: Step,
    columnIdx: number
  ): BoundingCurves[] => {
    const cellBounds = rows
      .filter(stepIsNotGutter)
      .map((row: Step, rowIdx: number) => {
        return getGridCellBounds(columnIdx, rowIdx)
      })
    return [...acc, ...cellBounds]
  }

  const getAllGridCellBounds = (): BoundingCurves[] => {
    // We only want to run through steps that are not gutters so we filter both
    // rows and columns first
    return columns
      .filter(stepIsNotGutter)
      .reduce(getAllGridCellBoundsReducer, [])
  }

  return mapObj(
    (f) => {
      return memoize(f)
    },
    {
      getPoint,
      getLines,
      getIntersections,
      getGridCellBounds,
      getAllGridCellBounds,
    }
  ) as GridApi
}

export default getApi
