import { beforeAll } from '@jest/globals'
import path from 'path'
import getGrid from '../src/'
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

describe(`getGrid`, () => {
  describe(`validations`, () => {
    describe(`boundingCurves`, () => {
      it(`throws if no boundingCurves is supplied`, () => {
        expect(() => {
          getGrid()
        }).toThrow('You must supply boundingCurves(Object)')
      })

      it(`throws if boundingCurves is not an object`, () => {
        expect(() => {
          getGrid([])
        }).toThrow('boundingCurves must be an object')
      })

      it(`throws if top and left bounding curves don't meet`, () => {
        expect(() => {
          const bounds = clone(boundsValid)
          bounds.top.startPoint.x = -10
          getGrid(bounds)
        }).toThrow(
          'top curve startPoint and left curve startPoint must have same coordinates'
        )
      })

      it(`throws if top and right bounding curves don't meet`, () => {
        expect(() => {
          const bounds = clone(boundsValid)
          bounds.right.startPoint.x = -10
          getGrid(bounds)
        }).toThrow(
          'top curve endPoint and right curve startPoint must have the same coordinates'
        )
      })

      it(`throws if bottom and left bounding curves don't meet`, () => {
        expect(() => {
          const bounds = clone(boundsValid)
          bounds.left.endPoint.x = -10
          getGrid(bounds)
        }).toThrow(
          'bottom curve startPoint and left curve endPoint must have the same coordinates'
        )
      })

      it(`throws if bottom and right bounding curves don't meet`, () => {
        expect(() => {
          const bounds = clone(boundsValid)
          bounds.right.endPoint.x = -10
          getGrid(bounds)
        }).toThrow(
          'bottom curve endPoint and right curve endPoint must have the same coordinates'
        )
      })
    })

    describe(`grid`, () => {
      it(`throws if no grid is supplied`, () => {
        expect(() => {
          getGrid(boundsValid)
        }).toThrow('You must supply a grid(Object)')
      })

      describe(`columns and rows`, () => {
        it(`throws if no columns are supplied`, () => {
          expect(() => {
            getGrid(boundsValid, {})
          }).toThrow('You must supply grid.columns(Array or Int)')
        })

        it(`throws if no rows are supplied`, () => {
          expect(() => {
            getGrid(boundsValid, { columns: [] })
          }).toThrow('You must supply grid.rows(Array or Int)')
        })

        it(`throws if columns are not Array or Int`, () => {
          expect(() => {
            getGrid(boundsValid, { columns: {} })
          }).toThrow('grid.columns must be an Array of Ints or Int')
        })

        it(`throws if rows are not Array or Int`, () => {
          expect(() => {
            getGrid(boundsValid, { columns: [], rows: {} })
          }).toThrow(
            'grid.rows must be an Int, an Array of Ints, or an Array of objects'
          )
        })
      })

      describe(`interpolationStrategy`, () => {
        it('throws if interpolationStrategy name is not recognised', () => {
          expect(() => {
            getGrid(boundsValid, {
              columns: 4,
              rows: 3,
              interpolationStrategy: 'nope',
            })
          }).toThrow(
            `Interpolation strategy 'nope' is not recognised. Must be one of 'linear,even'`
          )
        })
      })

      describe(`precision`, () => {
        it('throws if precision is not a positive integer', () => {
          expect(() => {
            getGrid(boundsValid, {
              columns: 4,
              rows: 3,
              precision: 'abc',
            })
          }).toThrow(
            `Precision must be a positive integer greater than 0, but was 'abc`
          )

          expect(() => {
            getGrid(boundsValid, {
              columns: 4,
              rows: 3,
              precision: -3,
            })
          }).toThrow(
            `Precision must be a positive integer greater than 0, but was '-3`
          )
        })
      })

      describe(`lineStrategy`, () => {
        it('throws if lineStrategy name is not recognised', () => {
          expect(() => {
            getGrid(boundsValid, {
              columns: 4,
              rows: 3,
              lineStrategy: 'nope',
            })
          }).toThrow(
            `Line strategy 'nope' is not recognised. Must be one of 'straightLines,curves'`
          )
        })
      })

      describe(`api`, () => {
        describe(`getPoint`, () => {
          it(`throws if u value is less than 0`, () => {
            const patch = getGrid(boundsValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              patch.api.getPoint(-1, 0)
            }).toThrow(`u value must be between 0 and 1, but you supplied '-1'`)
          })
          it(`throws if u value is greater than 1`, () => {
            const patch = getGrid(boundsValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              patch.api.getPoint(2, 0)
            }).toThrow(`u value must be between 0 and 1, but you supplied '2'`)
          })
          it(`throws if v value is less than 0`, () => {
            const patch = getGrid(boundsValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              patch.api.getPoint(0, -1)
            }).toThrow(`v value must be between 0 and 1, but you supplied '-1'`)
          })
          it(`throws if v value is greater than 1`, () => {
            const patch = getGrid(boundsValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              patch.api.getPoint(0, 2)
            }).toThrow(`v value must be between 0 and 1, but you supplied '2'`)
          })
        })
        describe(`getGridCellBounds`, () => {
          it(`throws if gridCell x coordinate is greater than number of columns -1`, () => {
            const patch = getGrid(boundsValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              patch.api.getGridCellBounds(4, 2)
            }).toThrow(
              `Grid is '4' columns wide but coordinates are zero-based, and you passed x:'4'`
            )
          })

          it(`throws if gridCell y coordinate is greater than number of rows -1`, () => {
            const patch = getGrid(boundsValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              patch.api.getGridCellBounds(3, 3)
            }).toThrow(
              `Grid is '3' rows high but coordinates are zero-based, and you passed y:'3'`
            )
          })

          it(`throws if gridCell coordinates are negative`, () => {
            const patch = getGrid(boundsValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              patch.api.getGridCellBounds(-1, 1)
            }).toThrow(
              `Coordinates must not be negative. You supplied x:'-1' x y:'1'`
            )
            expect(() => {
              patch.api.getGridCellBounds(1, -1)
            }).toThrow(
              `Coordinates must not be negative. You supplied x:'1' x y:'-1'`
            )
          })
        })
      })
    })
  })

  // Loop through different types of grid
  describe.each(fixturesFiltered)(
    `For '$name' returns correct patch`,
    ({ name, input }) => {
      const patch = getGrid(input.bounds, input.grid)
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
