import { beforeAll } from '@jest/globals'
import getGrid from '../src/'
import fixtures, { boundingCurvesValid } from './fixtures.js'
import { loadFixtureData } from './helpers.js'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const clone = (value) => JSON.parse(JSON.stringify(value))

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
          const bounds = clone(boundingCurvesValid)
          bounds.top.startPoint.x = -10
          getGrid(bounds)
        }).toThrow(
          'top curve startPoint and left curve startPoint must have same coordinates'
        )
      })

      it(`throws if top and right bounding curves don't meet`, () => {
        expect(() => {
          const bounds = clone(boundingCurvesValid)
          bounds.right.startPoint.x = -10
          getGrid(bounds)
        }).toThrow(
          'top curve endPoint and right curve startPoint must have the same coordinates'
        )
      })

      it(`throws if bottom and left bounding curves don't meet`, () => {
        expect(() => {
          const bounds = clone(boundingCurvesValid)
          bounds.left.endPoint.x = -10
          getGrid(bounds)
        }).toThrow(
          'bottom curve startPoint and left curve endPoint must have the same coordinates'
        )
      })

      it(`throws if bottom and right bounding curves don't meet`, () => {
        expect(() => {
          const bounds = clone(boundingCurvesValid)
          bounds.right.endPoint.x = -10
          getGrid(bounds)
        }).toThrow(
          'bottom curve endPoint and right curve endPoint must have the same coordinates'
        )
      })
    })

    describe(`grid`, () => {
      describe(`columns and rows`, () => {
        it(`throws if no columns are supplied`, () => {
          expect(() => {
            getGrid(boundingCurvesValid, {})
          }).toThrow('You must supply grid.columns(Array or Int)')
        })

        it(`throws if no rows are supplied`, () => {
          expect(() => {
            getGrid(boundingCurvesValid, { columns: [] })
          }).toThrow('You must supply grid.rows(Array or Int)')
        })

        it(`throws if columns are not Array or Int`, () => {
          expect(() => {
            getGrid(boundingCurvesValid, { columns: {} })
          }).toThrow('grid.columns must be an Array of Ints or Int')
        })

        it(`throws if rows are not Array or Int`, () => {
          expect(() => {
            getGrid(boundingCurvesValid, { columns: [], rows: {} })
          }).toThrow(
            'grid.rows must be an Int, an Array of Ints, or an Array of objects'
          )
        })
      })

      describe(`interpolationStrategy`, () => {
        it('throws if interpolationStrategy name is not recognised', () => {
          expect(() => {
            getGrid(boundingCurvesValid, {
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
            getGrid(boundingCurvesValid, {
              columns: 4,
              rows: 3,
              precision: 'abc',
            })
          }).toThrow(
            `Precision must be a positive integer greater than 0, but was 'abc`
          )

          expect(() => {
            getGrid(boundingCurvesValid, {
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
            getGrid(boundingCurvesValid, {
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
            const grid = getGrid(boundingCurvesValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              grid.getPoint(-1, 0)
            }).toThrow(`u value must be between 0 and 1, but was '-1'`)
          })
          it(`throws if u value is greater than 1`, () => {
            const grid = getGrid(boundingCurvesValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              grid.getPoint(2, 0)
            }).toThrow(`u value must be between 0 and 1, but was '2'`)
          })
          it(`throws if v value is less than 0`, () => {
            const grid = getGrid(boundingCurvesValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              grid.getPoint(0, -1)
            }).toThrow(`v value must be between 0 and 1, but was '-1'`)
          })
          it(`throws if v value is greater than 1`, () => {
            const grid = getGrid(boundingCurvesValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              grid.getPoint(0, 2)
            }).toThrow(`v value must be between 0 and 1, but was '2'`)
          })
        })
        describe(`getGridCellBounds`, () => {
          it(`throws if gridCell x coordinate is greater than number of columns -1`, () => {
            const grid = getGrid(boundingCurvesValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              grid.getGridCellBounds(4, 2)
            }).toThrow(
              `Grid is '4' columns wide but coordinates are zero-based, and you passed x:'4'`
            )
          })

          it(`throws if gridCell y coordinate is greater than number of rows -1`, () => {
            const grid = getGrid(boundingCurvesValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              grid.getGridCellBounds(3, 3)
            }).toThrow(
              `Grid is '3' rows high but coordinates are zero-based, and you passed y:'3'`
            )
          })

          it(`throws if gridCell coordinates are negative`, () => {
            const grid = getGrid(boundingCurvesValid, {
              columns: 4,
              rows: 3,
            })
            expect(() => {
              grid.getGridCellBounds(-1, 1)
            }).toThrow(
              `Coordinates must not be negative. You supplied x:'-1' x y:'1'`
            )
            expect(() => {
              grid.getGridCellBounds(1, -1)
            }).toThrow(
              `Coordinates must not be negative. You supplied x:'1' x y:'-1'`
            )
          })
        })
      })
    })
  })

  // Loop through different types of grid
  describe.each(fixtures)(
    `For fixture: '$name' supplies …`,
    ({ name, input }) => {
      const grid = getGrid(input.bounds, input.grid)
      let output

      beforeAll(async () => {
        output = await loadFixtureData(name)
      })

      describe('model', () => {
        const { model } = grid

        it(`with original boundingCurves`, () => {
          expect(model.boundingCurves).toEqual(boundingCurvesValid)
        })

        it(`with arrays of column and row values`, () => {
          expect(model.columns).toEqual(output.model.columns)
          expect(model.rows).toEqual(output.model.rows)
        })
      })

      describe(`API`, () => {
        describe(`getPoint`, () => {
          it(`returns point at supplied coordinates`, () => {
            const point = grid.getPoint(...input.api.getPoint.args)

            expect(point).toEqual(output.getPoint)
          })
        })

        describe(`getIntersections`, () => {
          it(`returns all intersections between curves`, () => {
            const intersectons = grid.getIntersections()
            expect(intersectons).toEqual(output.getIntersections)
          })
        })

        describe(`getLines`, () => {
          it(`returns curves along x and y axes`, () => {
            const curves = grid.getLines()
            expect(curves).toEqual(output.getLines)
          })
        })

        describe(`getGridCellBounds`, () => {
          it(`provides bounds for the grid square at the supplied coordinates`, () => {
            const gridSquareBounds = grid.getGridCellBounds(
              ...input.api.getGridCellBounds.args
            )
            expect(gridSquareBounds).toEqual(output.getGridCellBounds)
          })
        })

        describe(`getAllGridCellBounds`, () => {
          it(`returns grid cell bounds for all cells, ordered left-to-right, top-to-bottom`, () => {
            const gridCellBounds = grid.getAllGridCellBounds()
            expect(gridCellBounds).toEqual(output.getAllGridCellBounds)
          })
        })
      })
    }
  )
})
