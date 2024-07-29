import { beforeAll } from '@jest/globals'
import path from 'path'
import getCoonsPatch from '../src/'
import fixtures, { boundsValid } from './fixtures.js'
import { __dirname, readFileAsync } from './helpers.js'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const clone = (value) => JSON.parse(JSON.stringify(value))

const fixturesFiltered = fixtures.filter(({ skipTest }) => skipTest !== true)

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
        }).toThrow(
          'grid.rows must be an Int, an Array of Ints, or an Array of objects'
        )
      })
    })
  })

  // Loop through different types of grid
  describe.each(fixturesFiltered)(
    `For '$name' returns correct patch`,
    ({ name, input }) => {
      const patch = getCoonsPatch(input.bounds, input.grid)
      let output

      beforeAll(async () => {
        const filePath = path.join(__dirname, `./fixtures/${name}.json`)
        const fixureJSON = await readFileAsync(filePath)
        output = JSON.parse(fixureJSON)
      })

      describe('config', () => {
        const { config } = patch

        it(`with original boundingCurves`, () => {
          expect(config.boundingCurves).toEqual(boundsValid)
        })

        it(`with arrays of column and row values`, () => {
          expect(config.columns).toEqual(output.config.columns)
          expect(config.rows).toEqual(output.config.rows)
        })
      })

      describe(`with an API`, () => {
        const { api } = patch

        describe(`getGridCellBounds`, () => {
          it(`provides bounds for the grid square at the supplied coordinates`, () => {
            const args = [2, 2]
            const gridSquareBounds = api.getGridCellBounds(...args)
            console.log('@@', output)
            console.log('@@', output.config)
            expect(gridSquareBounds).toEqual(output.api.getGridCellBounds)
          })
        })

        describe(`getIntersections`, () => {
          it(`returns all intersections between curves`, () => {
            const intersectons = api.getIntersections()
            expect(intersectons).toEqual(output.api.getIntersections)
          })
        })

        describe(`getPoint`, () => {
          it(`returns point at supplied coordinates`, () => {
            const args = [0.5, 0.25]
            const point = api.getPoint(...args)

            expect(point).toEqual(output.api.getPoint)
          })
        })

        describe(`getLines`, () => {
          it(`returns curves along x and y axes`, () => {
            const curves = api.getLines()
            expect(curves).toEqual(output.api.getLines)
          })
        })

        describe(`getAllGridCellBounds`, () => {
          it(`returns grid cell bounds for all cells, ordered left-to-right, top-to-bottom`, () => {
            const gridCellBounds = api.getAllGridCellBounds()
            expect(gridCellBounds).toEqual(output.api.getAllGridCellBounds)
          })
        })
      })
    }
  )
})
