// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const boundingCurvesValid = {
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
// Set 'skipSnapshot' falsetrue' for each item to skip the snapshot
const allFixtures = [
  {
    name: `3x3 grid`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: 3,
        rows: 3,
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
  {
    name: `3x3 grid with gutter as number`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: 3,
        rows: 3,
        gutter: 0.1,
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
  {
    name: `3x3 grid with gutter as array`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: 3,
        rows: 3,
        gutter: [0.1, 0.2],
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
  {
    name: `3x3 grid with gutter as px-string`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: 3,
        rows: 3,
        gutter: `10px`,
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
  {
    name: `3x3 grid with gutter as array including 0`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: 3,
        rows: 3,
        gutter: [0, 0.2],
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
  {
    name: `3x3 grid with linear interpolationStrategy`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: 3,
        rows: 3,
        interpolationStrategy: `linear`,
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
  {
    name: `3x3 grid with curves lineStrategy`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: 3,
        rows: 3,
        lineStrategy: `curves`,
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
  {
    name: `Mixed relative columns and rows`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: [5, 1, 5, 4, 5, 1, 5, 1, 5],
        rows: [5, 1, 5, 3, 5, 1, 10],
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
  {
    name: `Mixed relative columns and rows`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: [5, 1, 5, 4, 5, 1, 5, 1, 5],
        rows: [5, 1, 5, 3, 5, 1, 10],
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
  {
    name: `Mixed columns, gutters and rows`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: [
          { value: 5 },
          1,
          { value: 2, isGutter: true },
          4,
          1,
          `20px`,
          1,
          { value: `20px` },
        ],
        rows: [
          { value: 1 },
          2,
          { value: 3, isGutter: true },
          `10px`,
          3,
          { value: `10px` },
        ],
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
  {
    name: `3x3 grid with absolute gutter value`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: 3,
        rows: 3,
        gutter: `2px`,
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
  {
    name: `3x3 grid with mixed gutter values`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: 3,
        rows: 3,
        gutter: [`2px`, 0.1],
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
  {
    name: `3x3 grid with uOpposite and vOpposite values`,
    input: {
      bounds: boundingCurvesValid,
      grid: {
        columns: 3,
        rows: 3,
      },
      api: {
        getPoint: { args: [{ u: 0.5, v: 0.25, uOpposite: 1, vOpposite: 0.7 }] },
        getCellBounds: { args: [2, 2] },
      },
    },
  },
]

const fixtures = allFixtures.filter(({ skipTest }) => skipTest !== true)

export default fixtures
