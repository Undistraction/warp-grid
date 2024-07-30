// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

import { isInt, isPlainObj } from './types'

const expandToSteps = (stepCount) => {
  const spacing = []
  for (let idx = 0; idx < stepCount; idx++) {
    spacing.push({ value: 1 })
  }
  return spacing
}

const convertToObjects = (steps) =>
  steps.map((step) => {
    if (isPlainObj(step)) {
      return step
    } else {
      return {
        value: step,
      }
    }
  })

const insertGutters = (steps, gutter) => {
  const lastStepIndex = steps.length - 1
  const hasGutter = gutter > 0
  return steps.reduce((acc, step, idx) => {
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

export const processSteps = (gutter) => (steps) => {
  const stepsProcessed = isInt(steps)
    ? expandToSteps(steps)
    : convertToObjects(steps)
  return insertGutters(stepsProcessed, gutter)
}
