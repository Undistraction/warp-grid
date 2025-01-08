import type {
  BoundingCurves,
  Curve,
  InterpolatePointOnCurve,
  Point,
} from 'coons-patch'

import { CellBoundsOrder, InterpolationStrategy, LineStrategy } from './enums'

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------

export interface Step {
  value: number | string
  isGutter?: boolean
}

export interface Lines {
  xAxis: StepCurves[]
  yAxis: StepCurves[]
}

export interface GridDefinition {
  columns: StepDefinition
  rows: StepDefinition
  gutter?: (number | string) | [number | string, number | string]
  interpolationStrategy?:
    | InterpolationStrategy
    | InterpolatePointOnCurveFactory
    | [InterpolatePointOnCurveFactory, InterpolatePointOnCurveFactory]
  lineStrategy?: LineStrategy
  precision?: number
  bezierEasing?: BezierEasing
}

export type GridDefinitionWithDefaults = Required<GridDefinition>

export interface GridModel {
  boundingCurves: BoundingCurves
  columns: Steps
  rows: Steps
}

export interface GridApi {
  getPoint: (u: number, v: number) => Point
  getIntersections: () => Point[]
  getLinesXAxis: () => StepCurves[]
  getLinesYAxis: () => StepCurves[]
  getLines: () => Lines
  getCellBounds: (
    columns: number,
    rows: number,
    {
      cellBoundsOrder,
    }: {
      cellBoundsOrder?: CellBoundsOrder
    }
  ) => BoundingCurves
  getAllCellBounds: ({
    makeBoundsCurvesSequential,
    cellBoundsOrder,
  }?: {
    makeBoundsCurvesSequential?: boolean
    cellBoundsOrder?: CellBoundsOrder
  }) => BoundingCurves[]
}

export interface WarpGrid extends GridApi {
  model: GridModel
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectWithStringKeys = Record<string, any>

export type StepCurves = Curve[]

export type UnprocessedStep = number | Step

export type UnprocessedSteps = number | (number | Step)[]

export type ExpandedSteps = (number | Step)[]

export type Steps = Step[]

export type StepDefinition = number | number[] | Step[]

export interface BezierEasing {
  xAxis: BezierEasingParams
  yAxis: BezierEasingParams
}

export type BezierEasingParams = [number, number, number, number]

export interface BoundingCurvesWithMeta extends BoundingCurves {
  meta: {
    row: number
    column: number
  }
}

export interface InterpolationParamsU {
  uStart: number
  uSize: number
  uEnd: number
  vStart: number
}

export interface InterpolationParamsV {
  vStart: number
  vSize: number
  vEnd: number
  uStart: number
}

// -----------------------------------------------------------------------------
// Types: Function signatures
// -----------------------------------------------------------------------------

export type InterpolateLineU = (
  boundingCurves: BoundingCurves,
  { uStart, uSize, uEnd, vStart }: InterpolationParamsU,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
) => Curve

export type InterpolateLineV = (
  boundingCurves: BoundingCurves,
  { vStart, vSize, vEnd, uStart }: InterpolationParamsV,
  interpolatePointOnCurveU: InterpolatePointOnCurve,
  interpolatePointOnCurveV: InterpolatePointOnCurve
) => Curve

// Redefine as we have additional config keys
export type InterpolatePointOnCurveFactory = (config: {
  precision: number
  bezierEasing: BezierEasingParams
}) => InterpolatePointOnCurve

// -----------------------------------------------------------------------------
// Re-export types we are using from coons-patch
// -----------------------------------------------------------------------------

export type {
  BoundingCurves,
  Curve,
  InterpolatePointOnCurve,
  Point,
  Points,
} from 'coons-patch'
