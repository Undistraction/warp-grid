import type {
  BoundingCurves,
  Curve,
  Point,
  InterpolatePointOnCurve,
} from 'coons-patch'

import { CellBoundsOrder, InterpolationStrategy, LineStrategy } from './enums'

// -----------------------------------------------------------------------------
// Public
// -----------------------------------------------------------------------------

/**
 * Defines bezier easing parameters for both axes of the grid.
 * All parameters must be in range [0,1].
 */
export interface BezierEasing {
  xAxis: BezierEasingParams
  yAxis: BezierEasingParams
}

/**
 * Control points array for a cubic Bezier curve.
 * All values must be in range [0,1].
 */
export type BezierEasingParams = [number, number, number, number]

/**
 * Configuration for retrieving cell bounds in the grid.
 */
export interface GetAllCellBoundsProps {
  /**
   * Returns bounds curves in sequential order when true.
   * @default false
   */
  makeBoundsCurvesSequential?: boolean
  cellBoundsOrder?: CellBoundsOrder
}

/**
 * Configuration for retrieving bounds of a specific cell.
 */
export interface GetCellBoundsConfig {
  cellBoundsOrder?: CellBoundsOrder
}

/**
 * Parameters for retrieving a point within the grid space.
 * All coordinate values must be in range [0,1].
 */
export interface GetPointProps {
  u: number
  v: number
  uOpposite?: number
  vOpposite?: number
}

/**
 * Methods for interacting with and retrieving geometric data from the grid.
 */
export interface GridApi {
  /**
   * Returns a point at the specified grid coordinates. Results are memoized for
   * performance.
   * @param params The grid coordinates and options.
   * @returns The calculated grid point.
   * @throws ValidationError When coordinates are outside valid range.
   */
  getPoint: (params: GetPointProps) => Point

  /**
   * Returns all points where grid lines intersect. Results are memoized for
   * performance.
   * @returns Array of intersection points.
   */
  getIntersections: () => Point[]

  /**
   * Returns horizontal grid lines organized in rows from top to bottom. Each
   * array element represents a row containing Bézier curves that form the
   * horizontal grid structure. Lines include top and bottom bounds. Results are
   * memoized for performance.
   */
  getLinesXAxis: () => Curve[][]

  /**
   * Returns vertical grid lines organized in rows from top to bottom. Each
   * array element represents a column containing Bézier curves that form the
   * vertical grid structure. Lines include left and right bounds. Results are
   * memoized for performance.
   */
  getLinesYAxis: () => Curve[][]

  /**
   * Returns all grid lines organized by axis. The returned object contains
   * arrays of Bézier curves representing horizontal lines (xAxis) and vertical
   * lines (yAxis). Results are memoized for performance.
   */
  getLines: () => LinesByAxis

  /**
   * Returns the bounding curves for a specific cell. Results are memoized for
   * performance.
   * @param columnIdx Zero-based column index.
   * @param rowIdx Zero-based row index.
   * @param config Optional configuration.
   * @returns The cell's bounding curves.
   * @throws ValidationError When indices are out of bounds.
   */
  getCellBounds: (
    columnIdx: number,
    rowIdx: number,
    config?: GetCellBoundsConfig
  ) => BoundingCurves

  /**
   * Returns bounding curves for all cells in the grid. Results are memoized for
   * performance.
   * @param params Optional configuration.
   * @returns Array of cell bounds.
   */
  getAllCellBounds: (params?: GetAllCellBoundsProps) => BoundingCurves[]
}

/**
 * Configuration object defining the grid's structure and behavior.
 */
export interface GridDefinition {
  columns: StepDefinition
  rows: StepDefinition

  /**
   * Spacing between grid cells. Accepts pixels (number) or CSS units (string).
   * @default 0
   */
  gutter?: (number | string) | [number | string, number | string]

  /**
   * Strategy for interpolating points between grid lines.
   * @default 'linear'
   */
  interpolationStrategy?:
    | InterpolationStrategy
    | InterpolatePointOnCurveFactory
    | [InterpolatePointOnCurveFactory, InterpolatePointOnCurveFactory]

  /**
   * Method for constructing lines between points.
   * @default 'bezier'
   */
  lineStrategy?: LineStrategy

  /**
   * Curve interpolation precision.
   * @default 50
   */
  precision?: number

  /**
   * Easing parameters for curve calculations.
   * @default [0, 0, 1, 1]
   */
  bezierEasing?: BezierEasing
}

/**
 * Grid model containing boundary curves and layout information.
 */
export interface GridModel {
  boundingCurves: BoundingCurves
  columns: Step[]
  rows: Step[]
  columnsNonGutter: Step[]
  rowsNonGutter: Step[]
}

/**
 * Interpolates a line in the U direction between two bounding curves.
 * @param boundingCurves The curves defining the grid space.
 * @param params Parameters for the interpolation.
 * @param interpolatePointOnCurveU Function to interpolate points along U axis.
 * @param interpolatePointOnCurveV Function to interpolate points along V axis.
 * @returns A curve representing the interpolated line.
 */
export type InterpolateLineU = (
  boundingCurves: BoundingCurves,
  { uStart, uEnd, vStart }: InterpolationParamsU,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
) => Curve

/**
 * Interpolates a line in the V direction between two bounding curves.
 * @param boundingCurves The curves defining the grid space.
 * @param params Parameters for the interpolation.
 * @param interpolatePointOnCurveU Function to interpolate points along U axis.
 * @param interpolatePointOnCurveV Function to interpolate points along V axis.
 * @returns A curve representing the interpolated line.
 */
export type InterpolateLineV = (
  boundingCurves: BoundingCurves,
  { vStart, vEnd, uStart }: InterpolationParamsV,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
) => Curve

/**
 * Creates a function that interpolates points along a curve based on the given
 * configuration.
 * @param {Object} config - The configuration object for the interpolation.
 * @param {number} config.precision - The precision level for the interpolation
 * calculations.
 * @param {BezierEasingParams} config.bezierEasing - The bezier curve parameters
 * for easing.
 * @returns {InterpolatePointOnCurve} A function that performs point
 * interpolation along the curve.
 */
export type InterpolatePointOnCurveFactory = (config: {
  precision: number
  bezierEasing: BezierEasingParams
}) => InterpolatePointOnCurve

/**
 * Collection of curves organized by axis.
 */
export interface LinesByAxis {
  xAxis: Curve[][]
  yAxis: Curve[][]
}

/**
 * Defines a single step in the grid's layout sequence.
 * Value must be positive.
 */
export interface Step {
  value: number | string

  /**
   * Indicates a gutter space between cells when true.
   * @default false
   */
  isGutter?: boolean
}

export type UnprocessedStep = string | number | Step

export type StepDefinition = number | UnprocessedStep[]

/**
 * Complete grid interface combining manipulation methods with model access.
 */
export interface WarpGrid extends GridApi {
  model: GridModel
}

// -----------------------------------------------------------------------------
// Re-export types we are using from coons-patch
// -----------------------------------------------------------------------------

export type {
  BoundingCurves,
  Curve,
  InterpolationParameters,
  InterpolatePointOnCurve,
  Point,
} from 'coons-patch'

// -----------------------------------------------------------------------------
// Internal
// -----------------------------------------------------------------------------

export type GridDefinitionWithDefaults = Required<GridDefinition>

export interface CurveLengths {
  top: number
  bottom: number
  left: number
  right: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectWithStringKeys = Record<string, any>

export interface BoundingCurvesWithMeta extends BoundingCurves {
  meta: {
    row: number
    column: number
  }
}

export interface InterpolationParamsU extends ObjectWithStringKeys {
  uStart: number
  uEnd: number
  vStart: number
  uOppositeStart: number
  uOppositeEnd: number
  vOppositeStart: number
}

export interface InterpolationParamsV extends ObjectWithStringKeys {
  vStart: number
  vEnd: number
  uStart: number
  vOppositeStart: number
  vOppositeEnd: number
  uOppositeStart: number
}
