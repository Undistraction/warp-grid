import getCoonsPatch from '../src/'
import fixture3X3Grid from './fixtures/patch3x3Grid'
import fixtureVariantColumnsAndRows from './fixtures/patchVariantColumnsAndRows'
// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const boundsValid = {
  top: {
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 100, y: 0 },
    controlPoint1: { x: 10, y: -10 },
    controlPoint2: { x: 90, y: -10 },
  },
  bottom: {
    startPoint: { x: 0, y: 100 },
    endPoint: { x: 100, y: 100 },
    controlPoint1: { x: -10, y: 110 },
    controlPoint2: { x: 110, y: 110 },
  },
  left: {
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 0, y: 100 },
    controlPoint1: { x: -10, y: -10 },
    controlPoint2: { x: -10, y: 110 },
  },
  right: {
    startPoint: { x: 100, y: 0 },
    endPoint: { x: 100, y: 100 },
    controlPoint1: { x: 110, y: -10 },
    controlPoint2: { x: 110, y: 110 },
  },
}

const gridWithNumericColumns = {
  columns: 3,
  rows: 3,
}

const variants = [
  {
    name: '3x3 grid',
    input: {
      grid: gridWithNumericColumns,
    },
    fixture: fixture3X3Grid,
  },
  {
    name: 'Variant columns and rows',
    input: {
      grid: {
        columns: [5, 1, 5, 4, 5, 1, 5, 1, 5],
        rows: [5, 1, 5, 3, 5, 1, 10],
      },
    },
    fixture: fixtureVariantColumnsAndRows,
  },
]

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const clone = (value) => JSON.parse(JSON.stringify(value))

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe(`getCoonsPatch`, () => {
  describe(`validations`, () => {
    describe(`boundingCurves`, () => {
      it(`throws if no boundingCurves is supplied`, () => {
        expect(() => {
          getCoonsPatch()
        }).toThrow('You must supply boundingCurves(Object)')
      })

      it(`throws if boundingCurves is not an object`, () => {
        expect(() => {
          getCoonsPatch([])
        }).toThrow('boundingCurves must be an object')
      })

      it(`throws if top and left bounding curves don't meet`, () => {
        expect(() => {
          const bounds = clone(boundsValid)
          bounds.top.startPoint.x = -10
          getCoonsPatch(bounds)
        }).toThrow(
          'top curve startPoint and left curve startPoint must have same coordinates'
        )
      })

      it(`throws if top and right bounding curves don't meet`, () => {
        expect(() => {
          const bounds = clone(boundsValid)
          bounds.right.startPoint.x = -10
          getCoonsPatch(bounds)
        }).toThrow(
          'top curve endPoint and right curve startPoint must have the same coordinates'
        )
      })

      it(`throws if bottom and left bounding curves don't meet`, () => {
        expect(() => {
          const bounds = clone(boundsValid)
          bounds.left.endPoint.x = -10
          getCoonsPatch(bounds)
        }).toThrow(
          'bottom curve startPoint and left curve endPoint must have the same coordinates'
        )
      })

      it(`throws if bottom and right bounding curves don't meet`, () => {
        expect(() => {
          const bounds = clone(boundsValid)
          bounds.right.endPoint.x = -10
          getCoonsPatch(bounds)
        }).toThrow(
          'bottom curve endPoint and right curve endPoint must have the same coordinates'
        )
      })
    })

    describe(`grid`, () => {
      it(`throws if no grid is supplied`, () => {
        expect(() => {
          getCoonsPatch(boundsValid)
        }).toThrow('You must supply a grid(Object)')
      })

      it(`throws if no columns are supplied`, () => {
        expect(() => {
          getCoonsPatch(boundsValid, {})
        }).toThrow('You must supply grid.columns(Array or Int)')
      })

      it(`throws if no rows are supplied`, () => {
        expect(() => {
          getCoonsPatch(boundsValid, { columns: [] })
        }).toThrow('You must supply grid.rows(Array or Int)')
      })

      it(`throws if columns are not Array or Int`, () => {
        expect(() => {
          getCoonsPatch(boundsValid, { columns: {} })
        }).toThrow('grid.columns must be an Array of Ints or Int')
      })

      it(`throws if rows are not Array or Int`, () => {
        expect(() => {
          getCoonsPatch(boundsValid, { columns: [], rows: {} })
        }).toThrow('grid.rows must be an Array of Ints or Int')
      })
    })
  })

  // Loop through different types of grid
  describe.each(variants)(
    `For a $name returns correct patch`,
    ({ fixture, input }) => {
      const patch = getCoonsPatch(boundsValid, input.grid)

      describe('config', () => {
        const { config } = patch

        it(`with original boundingCurves`, () => {
          expect(config.boundingCurves).toEqual(boundsValid)
        })

        it(`with arrays of column and row values`, () => {
          expect(config.columns).toEqual(fixture.config.columns)
          expect(config.rows).toEqual(fixture.config.rows)
        })
      })

      describe(`with an API`, () => {
        const { api } = patch

        describe(`getGridCellBounds`, () => {
          it(`provides bounds for the grid square at the supplied coordinates`, () => {
            const args = [2, 2]
            const gridSquareBounds = api.getGridCellBounds(...args)
            expect(gridSquareBounds).toEqual(
              fixture.api.getGridCellBounds(...args)
            )
          })
        })

        describe(`getIntersections`, () => {
          it(`returns all intersections between curves`, () => {
            const intersectons = api.getIntersections()
            expect(intersectons).toEqual(fixture.api.getIntersections())
          })
        })

        describe(`getPoint`, () => {
          it(`returns point at supplied coordinates`, () => {
            const args = [0.5, 0.25]
            const point = api.getPoint(...args)

            expect(point).toEqual(fixture.api.getPoint(...args))
          })
        })

        describe(`getyLines`, () => {
          it(`returns curves along x and y axes`, () => {
            const curves = api.getyLines()
            expect(curves).toEqual(fixture.api.getyLines())
          })
        })

        describe(`getAllGridCellBounds`, () => {
          it(`returns grid cell bounds for all cells, ordered left-to-right, top-to-bottom`, () => {
            const gridCellBounds = api.getAllGridCellBounds()
            expect(gridCellBounds).toEqual(fixture.api.getAllGridCellBounds())
          })
        })
      })
    }
  )
})
