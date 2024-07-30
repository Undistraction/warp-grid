import path from 'path'
import getGrid from '../dist/warp-grid.js'
import fixtures from './fixtures.js'
import { __dirname, writeFileAsync } from './helpers.js'

console.log('Generating data for fixtures', getGrid)

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const print = (o) => console.log(JSON.stringify(o))

fixtures.forEach(async ({ name, input, skipSnapshot }) => {
  if (skipSnapshot) {
    console.log(`Skipping snapsot for '${name}'`)
    return
  }

  console.log('-----------------------------')
  console.log('-----------------------------')
  console.log(`Data for '${name}'`)
  console.log('-----------------------------')
  console.log('-----------------------------')
  const patch = getGrid(input.bounds, input.grid)

  console.log('-----------------------------')
  console.log('api.getGridCellBounds')
  console.log('-----------------------------')
  const getGridCellBounds = patch.getGridCellBounds(2, 2)
  print(getGridCellBounds)

  console.log('-----------------------------')
  console.log('api.getIntersections')
  console.log('-----------------------------')
  const getIntersections = patch.getIntersections()
  print(getIntersections)

  console.log('-----------------------------')
  console.log('api.getPoint')
  console.log('-----------------------------')
  const getPoint = patch.getPoint(0.5, 0.25)
  print(getPoint)

  console.log('-----------------------------')
  console.log('api.getLines')
  console.log('-----------------------------')
  const getLines = patch.getLines()
  print(getLines)

  console.log('-----------------------------')
  console.log('api.getAllGridCellBounds')
  console.log('-----------------------------')
  const getAllGridCellBounds = patch.getAllGridCellBounds()
  print(getAllGridCellBounds)

  const snapshot = JSON.stringify(
    {
      model: patch.model,
      api: {
        getGridCellBounds,
        getIntersections,
        getPoint,
        getLines,
        getAllGridCellBounds,
      },
    },
    null,
    2
  )

  const filepath = path.join(__dirname, `./fixtures/${name}.json`)

  try {
    await writeFileAsync(filepath, snapshot)
    console.log(`Wrote snapshot to '${filepath}'`)
  } catch (error) {
    console.error(`Error writing snapshot`, error)
  }
})
