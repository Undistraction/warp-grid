# README

This package allows you to generate a [Coons patch](https://en.wikipedia.org/wiki/Coons_patch) for a four sided shape whose bounds are defined by four cubic Bezier curves. The grid it calculates is very configurable, allowing you to modify a number of its features in some useful and interesting ways. It provides a simple API to allow you to retrieve metrics about the patch and grid to use however you need.

There is an [interactive demo](https://warp-grid.undistraction.com) which allows you to generate and manipulate a patch.

This package only models the coons patch and calculates the position of the curves that make up the grid, their intersections and the bounds of the grid squares. It doesn't handle the rendering of that data data to the screen, however it gives you all the underlying metrics you need to render a patch using SVG or HTML canvas. Both approaches are used in the demo, the code for which can be found in `/demo/`.

Note that calulating the curves that make up the grid (and therefore the grid cell bounds) is not a perfect process, and involves transforming a parametised into a cubic Bezier curve. Because there is no guarantee that the interpolated curve can be represented by a cubic Bezier, the Bezier has to fitted to the parametised curve. In some cases this means the edges will deviate from the bounds. In cases of a 1x1 grid, I cheat and just return the bounds of the grid, however with low numbers of columns and rows, and when curves are tighter at the corners, the curves will sometimes deviate from the bounds. This isn't a problem with higher numbers of rows/columns as each curve is made up of a different curve for each cell which gives more accurate results. Whilst it would certainly be possible to compose each grid-cell's bounds of multiple curves for increased accuracy, this would prevent one of the most useful bits of functionality - recursion, meaning you can use the bounds of any grid cell as the bounds for another nested grid.

It has two dependencies: [matrix.js](https://www.npmjs.com/package/matrix-js) for handling complex matrix transforms and [fast-memoize](fast-memoize) for function memoization.

## Install package

```bash
npm add warp-grid
yarn add warp-grid
pnpm add warp-grid
```

## Quick-start

The basic workflow is that you pass bounds representing the edges of a square, and a grid object describing the grid you'd like to map onto the square, and in return you receive an object with information about the coons patch, and a small API to allow you to get metrics describing the patch.

```javaScript
import getGrid from 'warp-grid'

const coonsPatch = getGrid(
  // See below
  boundingCurves,
  // See below
  grid)

// Get a point on the patch at the provided horizontal and vertical ratios (0–1)
const point = coonsPatch.getPoint(0.5, 0.75)

// Get an object wity `xAxis` and `yAxis` keys. Each key contains an Array containing data representing all the sub-curves that make up each curve along that axis.
const curves = coonsPatch.getLines()

// Get an array of points representing every grid intersection
const intersections = coonsPatch.getIntersections()

// Get the bounds for the grid-square at the supplied coordinates
const bounds = coonsPatch.getGridCellBounds(3, 8)
```

## API

### getGrid(boundingCurves, grid)

#### Argument 1: boundingCurves.

The first argument is `boundingCurves`, an object describing the four sides of the patch and comprising of four keys (`top`, `bottom`, `left` and `right`), each containing an object representing a cubic Bezier curve. Top and bottom curves run left-to-right, along the x-axis, left and and right curves run top-top bottom along the y-axis.

Here is an example:

```javaScript
{
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
```

#### Argument 2: grid

##### Columns / rows / gutter

The grid object describes the grid that will be interpolated onto the patch. It has two main fields, `colums` and `rows` both of which can be either an integer, or an Array of numbers. If an integer, the integer will be used as the value for the number of rows or columns, for example, if columns is `5` and rows is `9`, the grid will have five columns and nine rows, and therefore 45 cells. In this instance, all columns will be of uniform width based on the width of the bounds, divided by the number of columns, similarly, all rows will be of uniform height based on the height of the bounds divided by the number of rows.

Passing an array of numbers as the value of `columns` or `rows`, allows a great deal more control over the widths of the columns or rows, by allowing each value in the array to describe the width of the column (or height of the row) it represents. This is calculated by dividing the value by the total value of all the items in the array, and setting the resolved value to be a ratio of the total width or height. This allows the creation of a grid that supports variable column and row dimensions.

The grid also supports a `gutter` value which controls the gutters between the columns and rows. This is also treated as a ratio.

##### Other config

The grid also allows configuration params that change how it calculates the grid-elements.

- `interpolationStrategy` can be either `even` (the default) or `linear`. This changes the algorythm used to interplate the position of a point along a curve. If `linear` interplation is used, the effect is to exagerate the effect of curvature on the distance between rows and columns. `even` uses a more complex approach and usually results in more pleasing results. However it is significantly more memory intensive.

- `lineStrategy` can be either `straightLines` or `curves`. The lines returned from `getCurves` and the bounds returned from `getGridCellBounds` and `getAllGridCellBounds` are always cubic Bezier curves, however if the `lineStrategy` is `straightLines`, the calculations are significantly simplified and all lines will be straight. For more accurate calcualtions choose `curves` which will draw curved cubic Bezier curves. The default is `straightLines`.

- `precision` If you choose to use `even`, this parameter control how precise the interpolation is. Higher values are more memory-intensive but more accurate. The default value is `20`.

Here is an example of a grid:

```javaScript
{
  columns: 8,
  rows: [10, 5, 20, 5, 10]
  interpolationStategy: `even`,
  lineStrategy: 'curves',
  precision: 30,
}

```

#### Return value

The return value is a `coonsPatch` object representing the patch and providing an API to interrogate it.

## coonsPatch object

The `coonsPatch` object comprises of two fields, `config` and `api`.

### coonsPatch.config

`config` provides access to the resolved configuration data that was used to generate the patch. The configuration data is not the same as the data you passed in, but is instead the internal representation of that data.

- `columns` contains an array of column values.
- `rows` contains an array of row values
- `boundingCurves` contains the bounding curves object that was passed in.

### coonsPatch

`api` provides a small API to access metrics describing the API.

#### getPoint

TBD

#### getLines

TBD

#### getIntersections

TBD

#### getGridCellBounds

TBD

#### Validations

There are comprehensive run-time validations for all parameters which will throw helpful errors if any arguments are invalid.

# Project

## Install

```bash

pnpm install

```

## Build

```bash

pnpm run build # Build once
pnpm run build-watch # Build and watch for changes

```

## Preview build

```bash

pnpm run preview

```

## Run tests

Tests are written using Jest.

```bash

pnpm run test # Run tests once
pnpm run test-watch # Run tests and watch for changes

```

Due to the volume and complexity of the data returned from the API, the tests use snapshots of the data as test fixtures. These snapshots ar generated using:

```bash
pnpm run test-snapshot
```

This will generate data for all of the fixure definitions in `./tests/fixtures.js`. This command should only be run when absolutely necessary as the current snapshots capture the verified working state of the data. To add new fixtures add new definitions to `./tests/fixtures.js`.

## Lint

```bash
pnpm run lint-prettier
pnpm run lint-eslint
```

## Thanks

Thanks to pomax for his help (and code) for curve fitting (which is much more complex than it might seem). His [A Primer on Bézier Curves](https://pomax.github.io/bezierinfo/) is a thing of wonder.
