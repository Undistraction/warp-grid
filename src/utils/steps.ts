import {
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

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const processSteps =
  (gutter: number) =>
  (steps: UnprocessedSteps): Steps => {
    const array = ensureArray(steps)
    const arrayOfSteps = ensureObjects(array)
    return insertGutters(arrayOfSteps, gutter)
  }
