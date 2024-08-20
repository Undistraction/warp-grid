// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export enum Coordinate {
  X = `x`,
  Y = `y`,
}

export enum InterpolationStrategy {
  LINEAR = `linear`,
  EVEN = `even`,
}

export enum LineStrategy {
  STRAIGHT_LINES = `straightLines`,
  CURVES = `curves`,
}

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------

export interface Point {
  x: number
  y: number
  t?: number
}

export interface Curve {
  startPoint: Point
  endPoint: Point
  controlPoint1: Point
  controlPoint2: Point
}

export interface BoundingCurves {
  top: Curve
  bottom: Curve
  left: Curve
  right: Curve
}

export interface Step {
  value: number
  isGutter?: boolean
}

export interface Lines {
  xAxis: StepCurves[]
  yAxis: StepCurves[]
}

export interface GridDefinition {
  columns: StepDefinition
  rows: StepDefinition
  gutter?: number | [number, number]
  lineStrategy?: LineStrategy
  interpolationStrategy?: InterpolationStrategy
  precision?: number
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
  getLines: () => Lines
  getCellBounds: (columns: number, rows: number) => BoundingCurves
  getAllCellBounds: () => BoundingCurves[]
}

export interface WarpGrid extends GridApi {
  model: GridModel
}

export interface ObjectWithStringKeys {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [key: string]: any
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Points = Point[]

export type StepCurves = Curve[]

export type UnprocessedStep = number | Step

export type UnprocessedSteps = number | (number | Step)[]

export type ExpandedSteps = (number | Step)[]

export type Steps = Step[]

export type StepDefinition = number | number[] | Step[]

// -----------------------------------------------------------------------------
// Types: Function signatures
// -----------------------------------------------------------------------------

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

export type InterpolatePointOnCurve = (t: number, curve: Curve) => Point
