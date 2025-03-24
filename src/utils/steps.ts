import type {
  CurveLengths,
  Step,
  UnprocessedStep,
  UnprocessedSteps,
} from '../types'
import { times } from './functional'
import { isInt, isNumber, isPlainObj, isPixelNumberString, isNil } from './is'

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

// If its 0px default it to 0, otherwise return unchanged.
const getProcessedStepValue = (step: number | string): number | string => {
  if (step === `0px`) {
    return 0
  }
  return step
}

const ensureArray = (unprocessedSteps: UnprocessedSteps): UnprocessedStep[] =>
  isInt(unprocessedSteps) ? times(() => 1, unprocessedSteps) : unprocessedSteps

const ensureObjectsAndProcess = (steps: UnprocessedStep[]) =>
  steps.map((step: UnprocessedStep): Step => {
    if (isPlainObj(step)) {
      return {
        ...step,
        value: getProcessedStepValue(step.value),
      }
    } else {
      return {
        value: getProcessedStepValue(step),
      }
    }
  })

const insertGutters = (steps: Step[], gutter: number | string): Step[] => {
  const lastStepIndex = steps.length - 1
  const hasGutter = isGutterNonZero(gutter)

  return steps.reduce((acc: Step[], step: Step, idx: number): Step[] => {
    const isLastStep = idx === lastStepIndex
    const nextStep = steps[idx + 1]
    const hasNextStep = !isNil(nextStep)
    const nextStepIsGutter = hasNextStep && nextStep.isGutter
    const shouldAddGutter =
      hasGutter && !isLastStep && !step.isGutter && !nextStepIsGutter

    // Insert a gutter step if we have gutters and are not the last step

    return shouldAddGutter
      ? [...acc, step, { value: gutter, isGutter: true }]
      : [...acc, step]
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
      ? acc + getPixelStringNumericComponent(value as string)
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

  const nonAbsoluteSpaceTopRatio = Math.max(1 - totalAbsoluteRatioTop, 0)
  const nonAbsoluteSpaceBottomRatio = Math.max(1 - totalAbsoluteRatioBottom, 0)

  // Prevent this from becoming a negative number
  const nonAbsoluteSpaceLeftRatio = Math.max(1 - totalAbsoluteRatioLeft, 0)
  const nonAbsoluteSpaceRightRatio = Math.max(1 - totalAbsoluteRatioRight, 0)

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

export const getStepData = (
  columns: Step[],
  rows: Step[],
  curveLengths: CurveLengths
) => {
  const processedColumns = columns
  const processedRows = rows

  return {
    ...getCounts(columns, rows),
    ...getTotalRatioValues(columns, rows),
    ...getNonAbsoluteSpaceRatios(columns, rows, curveLengths),
    processedColumns,
    processedRows,
  }
}

export const getNonGutterSteps = (steps: Step[]) =>
  steps.filter((step: Step) => !step.isGutter)
