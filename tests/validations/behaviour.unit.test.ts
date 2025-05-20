import { boundingCurvesValid } from '../fixtures'
import { clone } from '../helpers'
import { warpGrid } from '../../src'

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const validGridDefinition = { columns: 4, rows: 3 }

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe(`validations`, () => {
  describe(`boundingCurves`, () => {
    it(`throws if top and right bounding curves don't meet`, () => {
      expect(() => {
        const bounds = clone(boundingCurvesValid)
        bounds.right.startPoint.x = -10
        warpGrid(bounds, validGridDefinition)
      }).toThrow(
        `top curve endPoint and right curve startPoint must have the same coordinates`
      )
    })

    it(`throws if bottom and left bounding curves don't meet`, () => {
      expect(() => {
        const bounds = clone(boundingCurvesValid)
        bounds.left.endPoint.x = -10
        warpGrid(bounds, validGridDefinition)
      }).toThrow(
        `bottom curve startPoint and left curve endPoint must have the same coordinates`
      )
    })

    it(`throws if bottom and right bounding curves don't meet`, () => {
      expect(() => {
        const bounds = clone(boundingCurvesValid)
        bounds.right.endPoint.x = -10
        warpGrid(bounds, validGridDefinition)
      }).toThrow(
        `bottom curve endPoint and right curve endPoint must have the same coordinates`
      )
    })
  })

  describe(`grid`, () => {
    describe(`precision`, () => {
      it(`throws if precision is not a positive integer`, () => {
        expect(() => {
          warpGrid(boundingCurvesValid, {
            columns: 4,
            rows: 3,
            precision: -3,
          })
        }).toThrow(
          `Precision must be a positive integer greater than 0, but was '-3`
        )
      })
    })

    describe(`api`, () => {
      describe(`getPoint`, () => {
        it(`throws if x is less than 0`, () => {
          const grid = warpGrid(boundingCurvesValid, {
            columns: 4,
            rows: 3,
          })
          expect(() => {
            grid.getPoint({ u: -1, v: 0 })
          }).toThrow(`u must be between 0 and 1, but was '-1'`)
        })
        it(`throws if u is greater than 1`, () => {
          const grid = warpGrid(boundingCurvesValid, {
            columns: 4,
            rows: 3,
          })
          expect(() => {
            grid.getPoint({ u: 2, v: 0 })
          }).toThrow(`u must be between 0 and 1, but was '2'`)
        })
        it(`throws if v is less than 0`, () => {
          const grid = warpGrid(boundingCurvesValid, {
            columns: 4,
            rows: 3,
          })
          expect(() => {
            grid.getPoint({ u: 0, v: -1 })
          }).toThrow(`v must be between 0 and 1, but was '-1'`)
        })
        it(`throws if v is greater than 1`, () => {
          const grid = warpGrid(boundingCurvesValid, {
            columns: 4,
            rows: 3,
          })
          expect(() => {
            grid.getPoint({ u: 0, v: 2 })
          }).toThrow(`v must be between 0 and 1, but was '2'`)
        })
      })

      describe(`getCellBounds`, () => {
        it(`throws if gridCell x coordinate is greater than number of columns -1`, () => {
          const grid = warpGrid(boundingCurvesValid, {
            columns: 4,
            rows: 3,
          })
          expect(() => {
            grid.getCellBounds(4, 2)
          }).toThrow(
            `X is zero-based and cannot be greater than number of columns - 1. Grid is '4' columns wide and you passed x:'4'`
          )
        })

        it(`throws if gridCell y coordinate is greater than number of rows -1`, () => {
          const grid = warpGrid(boundingCurvesValid, {
            columns: 4,
            rows: 3,
          })
          expect(() => {
            grid.getCellBounds(3, 3)
          }).toThrow(
            `Y is zero-based and cannot be greater than number of rows - 1. Grid is '3' rows wide and you passed y:'3'`
          )
        })

        it(`throws if gridCell coordinates are negative`, () => {
          const grid = warpGrid(boundingCurvesValid, {
            columns: 4,
            rows: 3,
          })
          expect(() => {
            grid.getCellBounds(-1, 1)
          }).toThrow(
            `Coordinates must not be negative. You supplied x:'-1' x y:'1'`
          )
          expect(() => {
            grid.getCellBounds(1, -1)
          }).toThrow(
            `Coordinates must not be negative. You supplied x:'1' x y:'-1'`
          )
        })
      })
    })
  })
})
