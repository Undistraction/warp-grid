import type { BoundingCurves, GridDefinition } from '../src/types'
import type { InterpolationParameters } from 'coons-patch'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface Fixture {
  name: string
  skipTest?: boolean
  input: {
    bounds: BoundingCurves
    grid: GridDefinition
    api: {
      getPoint: { args: [InterpolationParameters] }
      getCellBounds: { args: [number, number] }
    }
  }
}
