// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const boundsValid = {
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

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

// Define different sets of params to test
// Save the results to JSON files to import into tests
// Set 'skipSnapshot' to 'true' for each item to skip the snapshot
const fixtures = [
  {
    name: '3x3 grid',
    skipSnapshot: true,
    skipTest: false,
    input: {
      bounds: boundsValid,
      grid: {
        columns: 3,
        rows: 3,
      },
    },
  },
  {
    name: '3x3 grid with gutters',
    skipSnapshot: false,
    skipTest: false,
    input: {
      bounds: boundsValid,
      grid: {
        columns: 3,
        rows: 3,
        gutter: 0.1,
      },
    },
  },
  {
    name: 'Variant columns and rows',
    skipSnapshot: true,
    input: {
      bounds: boundsValid,
      grid: {
        columns: [5, 1, 5, 4, 5, 1, 5, 1, 5],
        rows: [5, 1, 5, 3, 5, 1, 10],
      },
    },
  },
]

export default fixtures
