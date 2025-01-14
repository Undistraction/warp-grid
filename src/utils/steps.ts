import type {
  CurveLengths,
  ExpandedSteps,
  Step,
  UnprocessedStep,
  UnprocessedSteps,
} from '../types'
import { times } from './functional'
import { isInt, isNumber, isPlainObj } from './is'
import { isPixelNumberString } from './regexp'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface SideData {
  start: number
  curveLength: number
  nonAbsoluteRatio: number
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

// If the value is a string value that is just a number (without px), convert it
// to a number. If its 0px default it to 0, otherwise return unchanged.
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

const ensureObjectsAndProcess = (steps: ExpandedSteps) =>
  steps.map((step: UnprocessedStep): Step => {
    if (isPlainObj(step)) {
      return step
    } else {
      return {
        value: getProcessedStepValue(step),
      }
    }
  })

const insertGutters = (steps: Step[], gutter: number | string): Step[] => {
  const lastStepIndex = steps.length - 1

  return steps.reduce((acc: Step[], step: Step, idx: number): Step[] => {
    const isLastStep = idx === lastStepIndex
    // Insert a gutter step if we have gutters and are not the last step
    return isLastStep || !isGutterNonZero(gutter)
      ? [...acc, step]
      : [...acc, step, { value: gutter, isGutter: true }]
  }, [])
}

const addStepRatioValues = (steps: Step[]) =>
  steps.reduce((total: number, step: Step) => {
    const { value } = step
    // Only add steps with values that are not absolute
    return isNumber(value) ? total + value : total
  }, 0)

const addStepAbsoluteValues = (steps: Step[]) =>
  steps.reduce((acc, step) => {
    const { value } = step
    return isPixelNumberString(value)
      ? acc + getPixelStringNumericComponent(value)
      : acc
  }, 0)

const getCounts = (columns: Step[], rows: Step[]) => ({
  columnsTotalCount: columns.length,
  rowsTotalCount: rows.length,
})

const getTotalRatioValues = (columns: Step[], rows: Step[]) => ({
  columnsTotalRatioValue: addStepRatioValues(columns),
  rowsTotalRatioValue: addStepRatioValues(rows),
})

const getAbsoluteRatio = (value: string, totalLength: number): number => {
  return getPixelStringNumericComponent(value) / totalLength
}

const getNonAbsoluteSpaceRatios = (
  columns: Step[],
  rows: Step[],
  curveLengths: CurveLengths
) => {
  const totalAbsoluteSizeU = addStepAbsoluteValues(columns)
  const totalAbsoluteSizeV = addStepAbsoluteValues(rows)

  const totalAbsoluteRatioTop = totalAbsoluteSizeU / curveLengths.top
  const totalAbsoluteRatioBottom = totalAbsoluteSizeU / curveLengths.bottom
  const totalAbsoluteRatioLeft = totalAbsoluteSizeV / curveLengths.left
  const totalAbsoluteRatioRight = totalAbsoluteSizeV / curveLengths.right

  const nonAbsoluteSpaceTopRatio = 1 - totalAbsoluteRatioTop
  const nonAbsoluteSpaceBottomRatio = 1 - totalAbsoluteRatioBottom

  const nonAbsoluteSpaceLeftRatio = 1 - totalAbsoluteRatioLeft
  const nonAbsoluteSpaceRightRatio = 1 - totalAbsoluteRatioRight

  return {
    nonAbsoluteSpaceTopRatio,
    nonAbsoluteSpaceBottomRatio,
    nonAbsoluteSpaceLeftRatio,
    nonAbsoluteSpaceRightRatio,
  }
}

const getSize = (
  step: Step,
  totalNonAbsoluteValue: number,
  sideData: SideData
): number => {
  // If step value is absolute, we use the ratio of the value to curve length
  if (isPixelNumberString(step.value)) {
    return getAbsoluteRatio(step.value as string, sideData.curveLength)
  }

  // Otherwise we use the ratio of the value to the non-absolute space
  const stepRatio = (step.value as number) / totalNonAbsoluteValue
  return stepRatio * sideData.nonAbsoluteRatio
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export function getPixelStringNumericComponent(value: string): number {
  return Number(value.split(`px`)[0])
}

export const isGutterNonZero = (gutter: number | string) =>
  (isNumber(gutter) && gutter > 0) || isPixelNumberString(gutter)

export const getEndValues = (
  step: Step,
  totalRatioValue: number,
  sideData: SideData,
  sideDataOpposite: SideData
) => {
  const size = getSize(step, totalRatioValue, sideData)
  const uOppositeSize = getSize(step, totalRatioValue, sideDataOpposite)

  const end = sideData.start + size
  const oppositeEnd = sideDataOpposite.start + uOppositeSize
  return [end, oppositeEnd]
}

export const processSteps = ({
  steps,
  gutter,
}: {
  steps: UnprocessedSteps
  gutter: number | string
}): Step[] => {
  const stepsArray = ensureArray(steps)
  const stepsArrayOfObjs = ensureObjectsAndProcess(stepsArray)
  return insertGutters(stepsArrayOfObjs, gutter)
}

export const processSteps2 = (steps: UnprocessedSteps): Step[] => {
  const arrayOfSteps = ensureArray(steps)
  return ensureObjectsAndProcess(arrayOfSteps)
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
