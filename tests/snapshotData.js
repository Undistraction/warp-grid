import path from 'path'
import warpGrid from '../src/index'
import fixtures from './fixtures.js'
import { __dirname, writeFileAsync } from './helpers.js'

console.log('Generating data for fixtures', warpGrid)

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const print = (o) => console.log(JSON.stringify(o))

fixtures.forEach(async ({ name, input, skipSnapshot }) => {
  if (skipSnapshot) {
    console.log(`Skipping snapsot for '${name}'`)
    return
  }

  console.log('@@input', input)

  console.log('-----------------------------')
  console.log('-----------------------------')
  console.log(`Data for '${name}'`)
  console.log('-----------------------------')
  console.log('-----------------------------')
  const patch = warpGrid(input.bounds, input.grid)

  console.log('-----------------------------')
  console.log('api.getPoint')
  console.log('-----------------------------')
  const getPoint = patch.getPoint(...input.api.getPoint.args)
  print(getPoint)

  console.log('-----------------------------')
  console.log('api.getIntersections')
  console.log('-----------------------------')
  const getIntersections = patch.getIntersections()
  print(getIntersections)

  console.log('-----------------------------')
  console.log('api.getLines')
  console.log('-----------------------------')
  const getLines = patch.getLines()
  print(getLines)

  console.log('-----------------------------')
  console.log('api.warpGridCellBounds')
  console.log('-----------------------------')
  const warpGridCellBounds = patch.warpGridCellBounds(
    ...input.api.warpGridCellBounds.args
  )
  print(warpGridCellBounds)

  console.log('-----------------------------')
  console.log('api.getAllGridCellBounds')
  console.log('-----------------------------')
  const getAllGridCellBounds = patch.getAllGridCellBounds()
  print(getAllGridCellBounds)

  const snapshot = JSON.stringify(
    {
      model: patch.model,
      warpGridCellBounds,
      getIntersections,
      getPoint,
      getLines,
      getAllGridCellBounds,
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
