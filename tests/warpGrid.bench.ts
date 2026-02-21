import { bench, describe } from 'vitest'

import {
  warpGrid,
  interpolatePointOnCurveEvenlySpacedFactory,
  interpolatePointOnCurveLinearFactory,
  InterpolationStrategy,
  LineStrategy,
} from '../src'
import { boundingCurvesValid } from './fixtures'

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const SMALL_GRID = { columns: 3, rows: 3 }
const MEDIUM_GRID = { columns: 8, rows: 8 }
const LARGE_GRID = { columns: 20, rows: 20 }

// -----------------------------------------------------------------------------
// Benchmarks
// -----------------------------------------------------------------------------

describe(`warpGrid creation`, () => {
  bench(`3x3 grid (even interpolation, default)`, () => {
    warpGrid(boundingCurvesValid, SMALL_GRID)
  })

  bench(`3x3 grid (linear interpolation)`, () => {
    warpGrid(boundingCurvesValid, {
      ...SMALL_GRID,
      interpolationStrategy: InterpolationStrategy.LINEAR,
    })
  })

  bench(`8x8 grid (even interpolation, default)`, () => {
    warpGrid(boundingCurvesValid, MEDIUM_GRID)
  })

  bench(`8x8 grid (linear interpolation)`, () => {
    warpGrid(boundingCurvesValid, {
      ...MEDIUM_GRID,
      interpolationStrategy: InterpolationStrategy.LINEAR,
    })
  })

  bench(`20x20 grid (even interpolation, default)`, () => {
    warpGrid(boundingCurvesValid, LARGE_GRID)
  })

  bench(`20x20 grid (linear interpolation)`, () => {
    warpGrid(boundingCurvesValid, {
      ...LARGE_GRID,
      interpolationStrategy: InterpolationStrategy.LINEAR,
    })
  })
})

describe(`getPoint`, () => {
  bench(`single point (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, SMALL_GRID)
    grid.getPoint({ u: 0.5, v: 0.5 })
  })

  bench(`single point (linear interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, {
      ...SMALL_GRID,
      interpolationStrategy: InterpolationStrategy.LINEAR,
    })
    grid.getPoint({ u: 0.5, v: 0.5 })
  })

  bench(`100 points on 3x3 grid (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, SMALL_GRID)
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 9; j++) {
        grid.getPoint({ u: i / 9, v: j / 9 })
      }
    }
  })

  bench(`100 points on 3x3 grid (linear interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, {
      ...SMALL_GRID,
      interpolationStrategy: InterpolationStrategy.LINEAR,
    })
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 9; j++) {
        grid.getPoint({ u: i / 9, v: j / 9 })
      }
    }
  })
})

describe(`getLines`, () => {
  bench(`3x3 grid - straight lines (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, SMALL_GRID)
    grid.getLines()
  })

  bench(`3x3 grid - curved lines (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, {
      ...SMALL_GRID,
      lineStrategy: LineStrategy.CURVES,
    })
    grid.getLines()
  })

  bench(`8x8 grid - straight lines (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, MEDIUM_GRID)
    grid.getLines()
  })

  bench(`8x8 grid - curved lines (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, {
      ...MEDIUM_GRID,
      lineStrategy: LineStrategy.CURVES,
    })
    grid.getLines()
  })

  bench(`20x20 grid - straight lines (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, LARGE_GRID)
    grid.getLines()
  })

  bench(`20x20 grid - straight lines (linear interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, {
      ...LARGE_GRID,
      interpolationStrategy: InterpolationStrategy.LINEAR,
    })
    grid.getLines()
  })
})

describe(`getIntersections`, () => {
  bench(`3x3 grid (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, SMALL_GRID)
    grid.getIntersections()
  })

  bench(`8x8 grid (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, MEDIUM_GRID)
    grid.getIntersections()
  })

  bench(`20x20 grid (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, LARGE_GRID)
    grid.getIntersections()
  })
})

describe(`getCellBounds`, () => {
  bench(`single cell on 3x3 grid (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, SMALL_GRID)
    grid.getCellBounds(1, 1)
  })

  bench(`single cell on 8x8 grid (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, MEDIUM_GRID)
    grid.getCellBounds(4, 4)
  })

  bench(`single cell on 20x20 grid (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, LARGE_GRID)
    grid.getCellBounds(10, 10)
  })
})

describe(`getAllCellBounds`, () => {
  bench(`3x3 grid (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, SMALL_GRID)
    grid.getAllCellBounds()
  })

  bench(`8x8 grid (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, MEDIUM_GRID)
    grid.getAllCellBounds()
  })

  bench(`20x20 grid (even interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, LARGE_GRID)
    grid.getAllCellBounds()
  })

  bench(`3x3 grid (linear interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, {
      ...SMALL_GRID,
      interpolationStrategy: InterpolationStrategy.LINEAR,
    })
    grid.getAllCellBounds()
  })

  bench(`8x8 grid (linear interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, {
      ...MEDIUM_GRID,
      interpolationStrategy: InterpolationStrategy.LINEAR,
    })
    grid.getAllCellBounds()
  })

  bench(`20x20 grid (linear interpolation)`, () => {
    const grid = warpGrid(boundingCurvesValid, {
      ...LARGE_GRID,
      interpolationStrategy: InterpolationStrategy.LINEAR,
    })
    grid.getAllCellBounds()
  })
})

describe(`nested grids - 2k cells with 7-cell nested grids`, () => {
  const OUTER_GRID = { columns: 50, rows: 40 }
  const NESTED_GRID = { columns: 7, rows: 1 }

  bench(`even interpolation`, () => {
    const outer = warpGrid(boundingCurvesValid, OUTER_GRID)
    const cellBounds = outer.getAllCellBounds()
    for (const bounds of cellBounds) {
      const nested = warpGrid(bounds, NESTED_GRID)
      nested.getAllCellBounds()
    }
  })

  bench(`linear interpolation`, () => {
    const outerDef = {
      ...OUTER_GRID,
      interpolationStrategy: InterpolationStrategy.LINEAR,
    }
    const nestedDef = {
      ...NESTED_GRID,
      interpolationStrategy: InterpolationStrategy.LINEAR,
    }
    const outer = warpGrid(boundingCurvesValid, outerDef)
    const cellBounds = outer.getAllCellBounds()
    for (const bounds of cellBounds) {
      const nested = warpGrid(bounds, nestedDef)
      nested.getAllCellBounds()
    }
  })
})

describe(`interpolatePointOnCurve`, () => {
  const curve = boundingCurvesValid.top

  const evenlySpaced = interpolatePointOnCurveEvenlySpacedFactory({
    precision: 20,
    bezierEasing: [0, 0, 1, 1],
  })

  const evenlySpacedHighPrecision = interpolatePointOnCurveEvenlySpacedFactory({
    precision: 50,
    bezierEasing: [0, 0, 1, 1],
  })

  const linear = interpolatePointOnCurveLinearFactory({
    precision: 20,
    bezierEasing: [0, 0, 1, 1],
  })

  bench(`evenly spaced (default precision)`, () => {
    evenlySpaced(0.5, curve)
  })

  bench(`evenly spaced (high precision)`, () => {
    evenlySpacedHighPrecision(0.5, curve)
  })

  bench(`linear`, () => {
    linear(0.5, curve)
  })
})
