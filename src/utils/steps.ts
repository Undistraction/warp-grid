import type {
  CurveLengths,
  ExpandedSteps,
  Step,
  Steps,
  UnprocessedStep,
  UnprocessedSteps,
} from '../types'
import { times } from './functional'
import { isInt, isNumber, isPlainObj, isString } from './is'
import { isPixelNumberString } from './regexp'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

// If the value is just a number string (without px), convert it to a
// number. If its 0px default it to 0, otherwise return unchanged.
const getProcessedStepValue = (step: number | string): number | string => {
  if (isNumber(step)) {
    return Number(step)
  }
  if (step === `0px`) {
    return 0
  }
  return step
}

const ensureArray = (unprocessedSteps: UnprocessedSteps): ExpandedSteps =>
  isInt(unprocessedSteps) ? times(() => 1, unprocessedSteps) : unprocessedSteps

const ensureObjects = (steps: ExpandedSteps) =>
  steps.map((step: UnprocessedStep): Step => {
    if (isPlainObj(step)) {
      return step
    } else {
      return {
        value: getProcessedStepValue(step),
      }
    }
  })

const insertGutters = (steps: Steps, gutter: number | string): Steps => {
  const lastStepIndex = steps.length - 1

  return steps.reduce((acc: Steps, step: Step, idx: number): Steps => {
    const isLastStep = idx === lastStepIndex
    // Insert a gutter step if we have gutters and are not the last step
    return isLastStep || !isGutterNonZero(gutter)
      ? [...acc, step]
      : [...acc, step, { value: gutter, isGutter: true }]
  }, [])
}

const addAll = (steps: Steps) =>
  steps.reduce((total: number, step: Step) => {
    // Only add steps with values that are not absolute
    return isNumber(step.value) ? total + step.value : total
  }, 0)

const getCounts = (columns: Steps, rows: Steps) => ({
  columnsTotalCount: columns.length,
  rowsTotalCount: rows.length,
})

const getTotalRatioValues = (columns: Steps, rows: Steps) => ({
  columnsTotalRatioValue: addAll(columns),
  rowsTotalRatioValue: addAll(rows),
})

function getPixelStringNumericComponent(value: string): number {
  return Number(value.split(`px`)[0])
}

const getAbsoluteGutterRatio = (
  gutter: string,
  totalLength: number
): number => {
  return getPixelStringNumericComponent(gutter) / totalLength
}

const getTotalAbsoluteGutterSize = (steps: Step[]): number => {
  return steps.reduce((acc, step) => {
    const { value } = step
    if (step.isGutter && isString(value) && isPixelNumberString(value)) {
      return acc + getPixelStringNumericComponent(value)
    }
    return acc
  }, 0)
}

const getNonAbsoluteSpaceRatios = (
  columns: Steps,
  rows: Steps,
  curveLengths: CurveLengths
) => {
  const totalAbsoluteGutterSizeU = getTotalAbsoluteGutterSize(columns)
  const totalAbsoluteGutterSizeV = getTotalAbsoluteGutterSize(rows)

  const totalAbsoluteGutterRatioTop =
    totalAbsoluteGutterSizeU / curveLengths.top
  const totalAbsoluteGutterRatioBottom =
    totalAbsoluteGutterSizeU / curveLengths.bottom
  const totalAbsoluteGutterRatioLeft =
    totalAbsoluteGutterSizeV / curveLengths.left
  const totalAbsoluteGutterRatioRight =
    totalAbsoluteGutterSizeV / curveLengths.right

  const nonAbsoluteSpaceTopRatio = 1 - totalAbsoluteGutterRatioTop
  const nonAbsoluteSpaceBottomRatio = 1 - totalAbsoluteGutterRatioBottom

  const nonAbsoluteSpaceLeftRatio = 1 - totalAbsoluteGutterRatioLeft
  const nonAbsoluteSpaceRightRatio = 1 - totalAbsoluteGutterRatioRight
  return {
    nonAbsoluteSpaceTopRatio,
    nonAbsoluteSpaceBottomRatio,
    nonAbsoluteSpaceLeftRatio,
    nonAbsoluteSpaceRightRatio,
  }
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const isGutterNonZero = (gutter: number | string) =>
  (isNumber(gutter) && gutter > 0) || isString(gutter)

export const getSize = (
  step: Step,
  curveLength: number,
  totalNonAbsoluteValue: number,
  remainingSpaceRatio: number
): number => {
  // If the step is a gutter and a pixel number string, we use the ratio of the
  // gutter to the curve length
  if (step.isGutter && isPixelNumberString(step.value)) {
    return getAbsoluteGutterRatio(step.value as string, curveLength)
  }

  const stepRatio = (step.value as number) / totalNonAbsoluteValue
  return stepRatio * remainingSpaceRatio
}

export const processSteps = ({
  steps,
  gutter,
}: {
  steps: UnprocessedSteps
  gutter: number | string
}): Steps => {
  const stepsArray = ensureArray(steps)
  const stepsArrayOfObjs = ensureObjects(stepsArray)
  return insertGutters(stepsArrayOfObjs, gutter)
}

export const processSteps2 = (steps: UnprocessedSteps): Steps => {
  const arrayOfSteps = ensureArray(steps)
  return ensureObjects(arrayOfSteps)
}

export const getStepData = (
  columns: UnprocessedSteps,
  rows: UnprocessedSteps,
  curveLengths: CurveLengths
) => {
  const [processedColumns, processedRows] = [columns, rows].map(processSteps2)

  return {
    ...getCounts(processedColumns, processedRows),
    ...getTotalRatioValues(processedColumns, processedRows),
    ...getNonAbsoluteSpaceRatios(processedColumns, processedRows, curveLengths),
    processedColumns,
    processedRows,
  }
}
