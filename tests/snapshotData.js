import { writeFile } from 'fs'
import path from 'path'
import getCoonsPatch from '../dist/coons-patch.js'
import fixtures from './fixtures.js'
import { __dirname } from './helpers.js'

console.log('Generating data for fixtures', getCoonsPatch)

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const print = (o) => console.log(JSON.stringify(o))

fixtures.forEach(({ name, input, skip = false }) => {
  if (skip) {
    console.log(`Skipping snapsot for '${name}'`)
    return
  }

  console.log('-----------------------------')
  console.log('-----------------------------')
  console.log(`Data for '${name}'`)
  console.log('-----------------------------')
  console.log('-----------------------------')
  const patch = getCoonsPatch(input.bounds, input.grid)

  console.log('-----------------------------')
  console.log('api.getGridCellBounds')
  console.log('-----------------------------')
  const getGridCellBounds = patch.api.getGridCellBounds(2, 2)
  print(getGridCellBounds)

  console.log('-----------------------------')
  console.log('api.getIntersections')
  console.log('-----------------------------')
  const getIntersections = patch.api.getIntersections()
  print(getIntersections)

  console.log('-----------------------------')
  console.log('api.getPoint')
  console.log('-----------------------------')
  const getPoint = patch.api.getPoint(0.5, 0.25)
  print(getPoint)

  console.log('-----------------------------')
  console.log('api.getLines')
  console.log('-----------------------------')
  const getLines = patch.api.getLines()
  print(getLines)

  console.log('-----------------------------')
  console.log('api.getAllGridCellBounds')
  console.log('-----------------------------')
  const getAllGridCellBounds = patch.api.getAllGridCellBounds()
  print(getAllGridCellBounds)

  const snapshot = JSON.stringify(
    {
      config: patch.config,
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

  writeFile(filepath, snapshot, (err) => {
    if (err) {
      console.error(`Error writing snapshot`, err)
    } else {
      console.log(`Wrote snapshot to '${filepath}'`)
    }
  })
})
