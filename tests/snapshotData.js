import path from 'path'

import warpGrid from '../dist/index.js'
import fixtures from './fixtures.js'
import { __dirname, writeFileAsync } from './helpers.js'

console.log(`Generating data for fixtures`, warpGrid)

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const print = (o) => console.log(JSON.stringify(o))

fixtures.forEach(async ({ name, input, skipSnapshot }) => {
  if (skipSnapshot) {
    console.log(`Skipping snapsot for '${name}'`)
    return
  }

  console.log(`-----------------------------`)
  console.log(`-----------------------------`)
  console.log(`Data for '${name}'`)
  console.log(`-----------------------------`)
  console.log(`-----------------------------`)
  const patch = warpGrid(input.bounds, input.grid)

  console.log(`-----------------------------`)
  console.log(`api.getPoint`)
  console.log(`-----------------------------`)
  const getPoint = patch.getPoint(...input.api.getPoint.args)
  print(getPoint)

  console.log(`-----------------------------`)
  console.log(`api.getIntersections`)
  console.log(`-----------------------------`)
  const getIntersections = patch.getIntersections()
  print(getIntersections)

  console.log(`-----------------------------`)
  console.log(`api.getLinesXAxis`)
  console.log(`-----------------------------`)
  const getLinesXAxis = patch.getLinesXAxis()

  console.log(`-----------------------------`)
  console.log(`api.getLinesYAxis`)
  console.log(`-----------------------------`)
  const getLinesYAxis = patch.getLinesYAxis()

  console.log(`-----------------------------`)
  console.log(`api.getLines`)
  console.log(`-----------------------------`)
  const getLines = patch.getLines()
  print(getLines)

  console.log(`-----------------------------`)
  console.log(`api.getCellBounds`)
  console.log(`-----------------------------`)
  const getCellBounds = patch.getCellBounds(...input.api.getCellBounds.args)
  print(getCellBounds)

  console.log(`-----------------------------`)
  console.log(`api.getAllCellBounds`)
  console.log(`-----------------------------`)
  const getAllCellBounds = patch.getAllCellBounds()
  print(getAllCellBounds)

  const snapshot = JSON.stringify(
    {
      model: patch.model,
      getCellBounds,
      getIntersections,
      getPoint,
      getLinesXAxis,
      getLinesYAxis,
      getLines,
      getAllCellBounds,
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
