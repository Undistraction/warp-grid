import { boundingCurvesValid } from '../fixtures'
import { clone } from '../helpers'
import { warpGrid } from '../../src'

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe(`validations`, () => {
  describe(`boundingCurves`, () => {
    it(`throws if no boundingCurves is supplied`, () => {
      expect(() => {
        warpGrid()
      }).toThrow(`You must supply boundingCurves(Object)`)
    })

    it(`throws if boundingCurves is not an object`, () => {
      expect(() => {
        warpGrid([])
      }).toThrow(`boundingCurves must be an object`)
    })

    describe(`curves`, () => {
      describe.each([
        { name: `top` },
        { name: `bottom` },
        { name: `left` },
        { name: `right` },
      ])(`For curve: '$name'`, ({ name }) => {
        it(`throws if curve is not an object`, () => {
          const bounds = clone(boundingCurvesValid)
          bounds[name] = `abc`
          expect(() => {
            warpGrid(bounds)
          }).toThrow(`Curve '${name}' must be an object`)
        })

        it(`throws if curve is not a valid point`, () => {
          const bounds = clone(boundingCurvesValid)
          bounds[name] = {}
          expect(() => {
            warpGrid(bounds)
          }).toThrow(
            `Bounding curve '${name}' startPoint must be a valid point`
          )
        })
      })
    })
  })

  describe(`grid`, () => {
    describe(`columns and rows`, () => {
      it(`throws if no columns are supplied`, () => {
        expect(() => {
          warpGrid(boundingCurvesValid, {})
        }).toThrow(`You must supply grid.columns(Array or Int)`)
      })

      it(`throws if no rows are supplied`, () => {
        expect(() => {
          warpGrid(boundingCurvesValid, { columns: [] })
        }).toThrow(`You must supply grid.rows(Array or Int)`)
      })

      it(`throws if columns are not Array or Int`, () => {
        expect(() => {
          warpGrid(boundingCurvesValid, { columns: {} })
        }).toThrow(
          `grid.columns must be an Int, an Array of Ints and/or pixel strings, or an Array of objects`
        )
      })

      it(`throws if rows are not Array or Int`, () => {
        expect(() => {
          warpGrid(boundingCurvesValid, { columns: [], rows: {} })
        }).toThrow(
          `grid.rows must be an Int, an Array of Ints and/or pixel strings, or an Array of objects`
        )
      })
    })

    describe(`interpolationStrategy`, () => {
      it(`throws if interpolationStrategy name is not recognised`, () => {
        expect(() => {
          warpGrid(boundingCurvesValid, {
            columns: 4,
            rows: 3,
            interpolationStrategy: `nope`,
          })
        }).toThrow(
          `Interpolation strategy 'nope' is not recognised. Must be one of 'linear,even'`
        )
      })
    })

    describe(`precision`, () => {
      it(`throws if precision is not an integer`, () => {
        expect(() => {
          warpGrid(boundingCurvesValid, {
            columns: 4,
            rows: 3,
            precision: `abc`,
          })
        }).toThrow(
          `Precision must be a positive integer greater than 0, but was 'abc`
        )
      })
    })

    describe(`lineStrategy`, () => {
      it(`throws if lineStrategy name is not recognised`, () => {
        expect(() => {
          warpGrid(boundingCurvesValid, {
            columns: 4,
            rows: 3,
            lineStrategy: `nope`,
          })
        }).toThrow(
          `Line strategy 'nope' is not recognised. Must be one of 'straightLines,curves'`
        )
      })
    })
  })
})
