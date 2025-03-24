import getGrid from '../src/'
import fixtures, { boundingCurvesValid } from './fixtures.js'

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const enumValues = [
  `topToBottom-leftToRight`,
  `topToBottom-rightToLeft`,
  `bottomToTop-leftToRight`,
  `bottomToTop-rightToLeft`,
  `leftToRight-topToBottom`,
  `leftToRight-bottomToTop`,
  `rightToLeft-topToBottom`,
  `rightToLeft-bottomToTop`,
]

const cellBoundsOrderFixture = enumValues.map((key) => {
  return {
    name: key,
    input: key,
  }
})

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe(`getGrid`, () => {
  describe(`regression`, () => {
    // Coons-patch was incorrectly failing validations of bounding curves if
    // they had a meta property.
    describe(`nested grid`, () => {
      it(`Supports nested grids`, () => {
        const outerGrid = getGrid(boundingCurvesValid, { columns: 3, rows: 3 })
        const cellBounds = outerGrid.getCellBounds(1, 1)
        const grid = getGrid(cellBounds, { columns: 3, rows: 3 })
        expect(grid.model.boundingCurves).toEqual(cellBounds)
        expect(() => grid.getCellBounds(1, 1)).not.toThrow()
      })
    })
  })

  // Loop through different types of grid
  describe.each(fixtures)(`for fixture: '$name' supplies …`, ({ input }) => {
    const grid = getGrid(input.bounds, input.grid)

    describe(`model`, () => {
      const { model } = grid
      it(`with original boundingCurves`, () => {
        expect(model.boundingCurves).toEqual(input.bounds)
      })

      it(`with arrays of column and row values`, () => {
        expect(model.columns).toMatchSnapshot()
        expect(model.rows).toMatchSnapshot()
      })
    })

    describe(`api`, () => {
      describe(`getPoint`, () => {
        it(`returns point at supplied coordinates`, () => {
          const point = grid.getPoint(...input.api.getPoint.args)

          expect(point).toMatchSnapshot()
        })
      })

      describe(`getIntersections`, () => {
        it(`returns all intersections between curves`, () => {
          const intersections = grid.getIntersections()
          expect(intersections).toMatchSnapshot()
        })
      })

      describe(`getLinesXAxis`, () => {
        it(`returns curves along x axis`, () => {
          const curves = grid.getLinesXAxis()
          expect(curves).toMatchSnapshot()
        })
      })

      describe(`getLinesYAxis`, () => {
        it(`returns curves along y axis`, () => {
          const curves = grid.getLinesYAxis()
          expect(curves).toMatchSnapshot()
        })
      })

      describe(`getLines`, () => {
        it(`returns curves along x and y axes`, () => {
          const curves = grid.getLines()
          expect(curves).toMatchSnapshot()
        })
      })

      describe(`getCellBounds`, () => {
        it(`provides bounds for the grid square at the supplied coordinates`, () => {
          const gridSquareBounds = grid.getCellBounds(
            ...input.api.getCellBounds.args
          )
          expect(gridSquareBounds).toMatchSnapshot()
        })

        describe(`when passing 'makeBoundsCurvesSequential' as 'true'`, () => {
          it(`provides bounds for the grid square at the supplied coordinates in clockwise orientation`, () => {
            const gridSquareBounds = grid.getCellBounds(
              ...input.api.getCellBounds.args,
              { makeBoundsCurvesSequential: true }
            )
            expect(gridSquareBounds).toMatchSnapshot()
          })
        })
      })

      describe(`getAllCellBounds`, () => {
        it(`returns grid cell bounds for all cells, ordered left-to-right, top-to-bottom`, () => {
          const allGridCellBounds = grid.getAllCellBounds()
          expect(allGridCellBounds).toMatchSnapshot()
        })

        describe(`when passing 'makeBoundsCurvesSequential' as 'true'`, () => {
          it(`provides bounds for the grid square at the supplied coordinates in clockwise orientation`, () => {
            const allGridCellBounds = grid.getAllCellBounds({
              makeBoundsCurvesSequential: true,
            })
            expect(allGridCellBounds).toMatchSnapshot()
          })
        })

        describe.each(cellBoundsOrderFixture)(
          `For cellBoundsOrder with key of $name`,
          ({ input }) => {
            it(`provides bounds for the grid square at the supplied coordinates in clockwise orientation`, () => {
              const allGridCellBounds = grid.getAllCellBounds({
                cellBoundsOrder: input,
              })
              expect(allGridCellBounds).toMatchSnapshot()
            })
          }
        )
      })
    })
  })
})
