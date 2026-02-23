import { warpGrid } from '../src/index'
import fixtures, { boundingCurvesValid } from './fixtures'
import { CellBoundsOrder } from '../src/enums'
import { roundDeep } from './helpers'

import type { BoundingCurvesWithMeta } from '../src/types'

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const getExpectedOrder = (
  order: CellBoundsOrder,
  totalColumns: number,
  totalRows: number
) => {
  const cells: { column: number; row: number }[] = []

  switch (order) {
    case CellBoundsOrder.TTB_LTR:
      for (let r = 0; r < totalRows; r++)
        for (let c = 0; c < totalColumns; c++) cells.push({ column: c, row: r })
      break
    case CellBoundsOrder.TTB_RTL:
      for (let r = 0; r < totalRows; r++)
        for (let c = totalColumns - 1; c >= 0; c--)
          cells.push({ column: c, row: r })
      break
    case CellBoundsOrder.BTT_LTR:
      for (let r = totalRows - 1; r >= 0; r--)
        for (let c = 0; c < totalColumns; c++) cells.push({ column: c, row: r })
      break
    case CellBoundsOrder.BTT_RTL:
      for (let r = totalRows - 1; r >= 0; r--)
        for (let c = totalColumns - 1; c >= 0; c--)
          cells.push({ column: c, row: r })
      break
    case CellBoundsOrder.LTR_TTB:
      for (let c = 0; c < totalColumns; c++)
        for (let r = 0; r < totalRows; r++) cells.push({ column: c, row: r })
      break
    case CellBoundsOrder.LTR_BTT:
      for (let c = 0; c < totalColumns; c++)
        for (let r = totalRows - 1; r >= 0; r--)
          cells.push({ column: c, row: r })
      break
    case CellBoundsOrder.RTL_TTB:
      for (let c = totalColumns - 1; c >= 0; c--)
        for (let r = 0; r < totalRows; r++) cells.push({ column: c, row: r })
      break
    case CellBoundsOrder.RTL_BTT:
      for (let c = totalColumns - 1; c >= 0; c--)
        for (let r = totalRows - 1; r >= 0; r--)
          cells.push({ column: c, row: r })
      break
  }

  return cells
}

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const allOrders = [
  CellBoundsOrder.TTB_LTR,
  CellBoundsOrder.TTB_RTL,
  CellBoundsOrder.BTT_LTR,
  CellBoundsOrder.BTT_RTL,
  CellBoundsOrder.LTR_TTB,
  CellBoundsOrder.LTR_BTT,
  CellBoundsOrder.RTL_TTB,
  CellBoundsOrder.RTL_BTT,
]

const cellBoundsOrderFixture = allOrders.map((key) => {
  return {
    name: key,
    input: key,
  }
})

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe(`warpGrid`, () => {
  describe(`regression`, () => {
    // Coons-patch was incorrectly failing validations of bounding curves if
    // they had a meta property.
    describe(`nested grid`, () => {
      it(`Supports nested grids`, () => {
        const outerGrid = warpGrid(boundingCurvesValid, { columns: 3, rows: 3 })
        const cellBounds = outerGrid.getCellBounds(1, 1)
        const grid = warpGrid(cellBounds, { columns: 3, rows: 3 })
        expect(grid.model.boundingCurves).toEqual(cellBounds)
        expect(() => grid.getCellBounds(1, 1)).not.toThrow()
      })
    })
  })

  // Loop through different types of grid
  describe.each(fixtures)(`for fixture: '$name' supplies …`, ({ input }) => {
    const grid = warpGrid(input.bounds, input.grid)

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
          expect(roundDeep(point)).toMatchSnapshot()
        })
      })

      describe(`getIntersections`, () => {
        it(`returns all intersections between curves`, () => {
          const intersections = grid.getIntersections()
          expect(roundDeep(intersections)).toMatchSnapshot()
        })
      })

      describe(`getLinesXAxis`, () => {
        it(`returns curves along x axis`, () => {
          const curves = grid.getLinesXAxis()
          expect(roundDeep(curves)).toMatchSnapshot()
        })
      })

      describe(`getLinesYAxis`, () => {
        it(`returns curves along y axis`, () => {
          const curves = grid.getLinesYAxis()
          expect(roundDeep(curves)).toMatchSnapshot()
        })
      })

      describe(`getLines`, () => {
        it(`returns curves along x and y axes`, () => {
          const curves = grid.getLines()
          expect(roundDeep(curves)).toMatchSnapshot()
        })
      })

      describe(`getCellBounds`, () => {
        it(`provides bounds for the grid square at the supplied coordinates`, () => {
          const gridSquareBounds = grid.getCellBounds(
            ...input.api.getCellBounds.args
          )
          expect(roundDeep(gridSquareBounds)).toMatchSnapshot()
        })
      })

      describe(`getAllCellBounds`, () => {
        it(`returns grid cell bounds for all cells, ordered left-to-right, top-to-bottom`, () => {
          const allGridCellBounds = grid.getAllCellBounds()
          expect(roundDeep(allGridCellBounds)).toMatchSnapshot()
        })

        describe(`when passing 'makeBoundsCurvesSequential' as 'true'`, () => {
          it(`provides bounds for the grid square at the supplied coordinates in clockwise orientation`, () => {
            const allGridCellBounds = grid.getAllCellBounds({
              makeBoundsCurvesSequential: true,
            })
            expect(roundDeep(allGridCellBounds)).toMatchSnapshot()
          })
        })

        describe.each(cellBoundsOrderFixture)(
          `For cellBoundsOrder with key of $name`,
          (cellBoundsOrderFixture) => {
            it(`provides bounds for all grid squares in the correct order`, () => {
              const allGridCellBounds = grid.getAllCellBounds({
                cellBoundsOrder: cellBoundsOrderFixture.input,
              }) as BoundingCurvesWithMeta[]

              const totalColumns = grid.model.columnsNonGutter.length
              const totalRows = grid.model.rowsNonGutter.length
              const expectedOrder = getExpectedOrder(
                cellBoundsOrderFixture.input,
                totalColumns,
                totalRows
              )

              expect(allGridCellBounds).toHaveLength(expectedOrder.length)
              const actualOrder = allGridCellBounds.map((cell) => cell.meta)
              expect(actualOrder).toEqual(expectedOrder)
            })
          }
        )
      })
    })
  })
})
