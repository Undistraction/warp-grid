// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export enum Coordinate {
  X = 'x',
  Y = 'y',
}

export enum InterpolationStrategy {
  LINEAR = 'linear',
  EVEN = 'even',
}

export enum LineStrategy {
  STRAIGHT_LINES = `straightLines`,
  CURVES = `curves`,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Point = {
  x: number
  y: number
  t?: number
}

export type Curve = {
  startPoint: Point
  endPoint: Point
  controlPoint1: Point
  controlPoint2: Point
}

export type Points = Point[]

export type BoundingCurves = {
  top: Curve
  bottom: Curve
  left: Curve
  right: Curve
}

export type Step = {
  value: number
  isGutter?: boolean
}

export type StepCurves = Curve[]

export type Lines = {
  xAxis: StepCurves[]
  yAxis: StepCurves[]
}

export type InterpolatePointOnCurve = (t: number, curve: Curve) => Point

export type InterpolateLineU = (
  boundingCurves: BoundingCurves,
  vStart: number,
  vSize: number,
  vEnd: number,
  uStart: number,
  interpolatePointOnCurve: InterpolatePointOnCurve
) => Curve

export type InterpolateLineV = (
  boundingCurves: BoundingCurves,
  uStart: number,
  uSize: number,
  uEnd: number,
  vStart: number,
  interpolatePointOnCurve: InterpolatePointOnCurve
) => Curve

export type UnprocessedStep = number | Step

export type UnprocessedSteps = number | (number | Step)[]

export type ExpandedSteps = (number | Step)[]

export type Steps = Step[]

export type GridDefinition = {
  columns: Steps
  rows: Steps
  gutter?: number
  lineStrategy?: LineStrategy
  interpolationStrategy?: InterpolationStrategy
  precision?: number
}

export type GridDefinitionWithDefaults = {
  columns: Steps
  rows: Steps
  gutter: number
  lineStrategy: LineStrategy
  interpolationStrategy: InterpolationStrategy
  precision: number
}

export type GridModel = {
  boundingCurves: BoundingCurves
  columns: Steps
  rows: Steps
}

export interface GridApi {
  getPoint: (u: number, v: number) => Point
  getIntersections: () => Point[]
  getLines: () => Lines
  getCellBounds: () => BoundingCurves
  getAllCellBounds: () => BoundingCurves[]
}

export interface WarpGrid extends GridApi {
  model: GridModel
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ObjectWithStringKeys = { [key: string]: any }
