import type {
  ExpandedSteps,
  Step,
  Steps,
  UnprocessedStep,
  UnprocessedSteps,
} from '../types'
import { times } from './functional'
import { isInt, isPlainObj } from './is'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const ensureArray = (unprocessedSteps: UnprocessedSteps): ExpandedSteps => {
  if (isInt(unprocessedSteps)) {
    const r = times(() => 1, unprocessedSteps)
    return r
  }

  return unprocessedSteps
}

const ensureObjects = (steps: ExpandedSteps) =>
  steps.map((step: UnprocessedStep): Step => {
    if (isPlainObj(step)) {
      return step
    } else {
      return {
        value: step,
      }
    }
  })

const insertGutters = (steps: Steps, gutter: number): Steps => {
  const lastStepIndex = steps.length - 1
  const hasGutter = gutter > 0
  return steps.reduce((acc: Steps, step: Step, idx: number): Steps => {
    const isLastStep = idx === lastStepIndex
    // Insert a gutter step if we have gutters and are not the last step
    return isLastStep || !hasGutter
      ? [...acc, step]
      : [...acc, step, { value: gutter, isGutter: true }]
  }, [])
}

const addAllReducer = (total: number, step: Step) => total + step.value

const addAll = (steps: Steps) => steps.reduce(addAllReducer, 0)

const getCounts = (columns: Steps, rows: Steps) => ({
  columnsTotalCount: columns.length,
  rowsTotalCount: rows.length,
})

const getTotalValues = (columns: Steps, rows: Steps) => ({
  columnsTotalValue: addAll(columns),
  rowsTotalValue: addAll(rows),
})

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const processSteps = ({
  steps,
  gutter,
}: {
  steps: UnprocessedSteps
  gutter: number
}): Steps => {
  const stepsArray = ensureArray(steps)
  const stepsArrayOfObjs = ensureObjects(stepsArray)
  return insertGutters(stepsArrayOfObjs, gutter)
}

export const getTSize = (
  steps: Steps,
  idx: number,
  totalValue: number
): number => {
  const step = steps[idx]
  const stepValue = step.value
  return stepValue / totalValue
}

export const processSteps2 = (steps: UnprocessedSteps): Steps => {
  const arrayOfSteps = ensureArray(steps)
  return ensureObjects(arrayOfSteps)
}

export const getStepData = (
  columns: UnprocessedSteps,
  rows: UnprocessedSteps
) => {
  const [processedColumns, processedRows] = [columns, rows].map(processSteps2)
  return {
    ...getCounts(processedColumns, processedRows),
    ...getTotalValues(processedColumns, processedRows),
    processedColumns,
    processedRows,
  }
}
