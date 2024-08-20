# README

This package allows you to create a grid and distort it in 2D space, then access information about its metrics - its bounds, rows, columns, gutters and cells.

It provides a lot of flexiblity and allows for some complex grids that are very hard to generate using traditional graphics software, and to do so with fine programatic control.

There is an [interactive demo](https://warp-grid.undistraction.com) which allows you to generate and manipulate a grid, and save it to you browser's local storage. .

This package does not handle any rendering itself, but provides you with all the data you need to render the grid using SVG, Canvas or anything else you like.

This package makes use of [coons-patch](https://coons-patch.undistraction.com) to model the grid, and rather than duplicate information about the underlying architecture here you can see the project's README.

## Install package

```bash
npm add warp-grid
# or
yarn add warp-grid
# or
pnpm add warp-grid
```

[Documenation](http://warp-grid-docs.undistraction.com/)

This package is written in TypeScript and exports its types.

## Quick-start

The basic workflow is that you pass bounds representing the edges of a square, and a grid configuration object describing the grid you'd like to map onto the square, and in return you receive an object with information about the coons patch, and a small API to allow you to get metrics describing the patch. This means no expensive calculations are done up front, but all the API functions are memoized to ensure expensive calculations only happen when needed.

```javaScript
import warpGrid from 'warp-grid'

// Define bounding curves for the patch
const boundingCurves = {
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

const gridConfig = {
  rows: 5,
  columns: 10
}

const coonsPatch = getGrid(
  boundingCurves,
  grid
)

// Get a point on the patch at the provided horizontal and vertical ratios (0–1)
const point = coonsPatch.getPoint(0.5, 0.75)

// Get an object with `u` and `v` keys. Each key contains an Array containing data representing all the sub-curves that make up each curve along that axis.
const curves = coonsPatch.getLines()

// Get an array of points representing every grid intersection
const intersections = coonsPatch.getIntersections()

// Get the bounds for the grid-square at the supplied coordinates
const bounds = coonsPatch.getCellBounds(3, 8)
```

There are a large number of validations that ensure that if you supply invalid data you will receive a helpful error message.

# Discussion

There are a number of data types that are used by the package to describe aspects of the grid:

Points look like this:

```javaScript
{
  x: 34,
  y: 44
}
```

All curves are represented by cubic Bezier curves:

```javaScript
{
  startPoint: { x: 0, y: 0},
  controlPoint1: { x: 0, y: 33},
  controlPoint2: { x: 0, y: 66},
  endPoint: { x: 0, y: 100}
}
```

Bounding curves look like this, where each item is curve.

```javaScript
{
  top,
  bottom,
  left,
  right
}
```

## The grid

The easiest way to think about the grid is as a series of ratios. The bounds use absolute values, but the columns, rows and gutters describe ratios of the width and height. The package will model the grid based on whateve you provide.

### Columns and Rows

The grid object describes the grid that will be interpolated onto the bounds. It has two main fields, `colums` and `rows`. Columns is made up of one or more columns, and rows is made up of one or more rows. The generic name for columns and rows is 'steps'.

These fields can be one of the following:

1. An integer, in which case that integer will represent the number of columns or rows (steps). For example `columns: 2`, will result in a grid with two columns.
2. An array of integers, in which case the number of steps will equal the number of items in the array, with the size of each step consiting of the value of that array item as an integer of the total of all the values. For example, `columns: [3, 5, 1, 1] will result in a total of 10 (3 + 5 + 1 + 1), meaning that the first column will be 30% of the grid width, the second column 50%, and the remaining two columns 10% each.
3. An array of objects, each with a `value` key: (`{ value: 2}`). This will work the same as the previous example, with the combined value of all the `value` keys dictating the total value, and the `value` key dictating the size of each step

### Gutters

If supplied, `gutter` will describe the width of horizontal gutters and the height of vertical gutters (the spaces between the grid cells). If `gutter` is a number, it describes both horizontal and vertical gutters. If it is an array of two numbers, the first number describes the horizontal gutter and the second number describes the vertical gutter. Like columns and rows, gutters are also a ratio of the total value, for example, if columns are `[1,4,3]` and gutters are `1`, There will be three rows of 10%, 40% and 30% percent with two gutters of `10%` between them.

There is an additional way to add gutters without using the gutters property. You can add them to the rows or columns arrays, using an object with a `value` property, but also adding and `isGutter` property set to `true`: (`{ value: 2. isGutter: true}`). This allows you to define gutters of different widths/heights in the same way you can define columns or rows of different widths/heights.

### Interpolations

The grid also allows configuration params that change how it calculates the grid-elements.

- `interpolationStrategy` can be either `even` (the default) or `linear`. This changes the algorythm used to interplate the position of a point along a curve. If `linear` interplation is used, the effect is to exagerate the effect of curvature on the distance between rows and columns. `even` uses a more complex approach and usually results in more pleasing results. However it is significantly more memory intensive.

- `lineStrategy` can be either `straightLines` or `curves`. The lines returned from `getCurves` and the bounds returned from `getCellBounds` and `getAllCellBounds` are always cubic Bezier curves, however if the `lineStrategy` is `straightLines`, the calculations are significantly simplified and all lines will be straight. For more accurate calcualtions choose `curves` which will draw curved cubic Bezier curves. The default is `straightLines`.

- `precision` If you choose to use `even`, this parameter control how precise the interpolation is. Higher values are more memory-intensive but more accurate. The default value is `20`. With `linear` this will have no effect.

Here is an example of a grid definition:

```javaScript
{
  columns: 8,
  rows: [10, 5, 20, 5, 10],
  gutters: [5, 3],
  interpolationStategy: `even`,
  lineStrategy: 'curves',
  precision: 30,
}

```

#### Return value

The return value is a `warp grid` object representing the patch and providing an API to interrogate it.

```javaScript
{
  config: {
    columns,
    rows,
    boundingCurves
  }
  getLines,
  getIntersections,
  getCurves,
  getCellBounds,
  getAllCellBounds,
}
```

### Model object

`model` provides access to the resolved configuration data that was used to generate the patch. The configuration data is not the same as the data you passed in, but is instead the internal representation of that data.

- `columns` contains an array of column values. This will always be made up of objects, regardless of how you supplied them.
- `rows` contains an array of row values. This will always be made up of objects, regardless of how you supplied them.
- `boundingCurves` contains the bounding curves object that was passed in.

### API

- `getPoint(x, y)` return the point on the grid at the supplied x and y ratios, for example, an x of 0 and a y of 0 would return a point in the top left corner. An x of 1 and a y of 1 would return a point the top right corner.

- `getLines()` returns an object with `xAxis` and `yAxis` keys, each of which contains a 2D array of all the curves for each step along that axis. This includes curves for all four edges.

- `getIntersections()` returns an array of points, one for every point that a column and a row intersect.

- `getCellBounds(row, column)` returns a set of bounding curves for the cell at the supplied row and colunn.

- `getAllCellBounds()` returns an array of bounding curves for all the cells in the grid.

### Dependencies

This project has two dependencies:

- [fast-memoize](https://www.npmjs.com/package/fast-memoize) for memoization
- [matrix-js](https://www.npmjs.com/package/matrix-js) for matrix math

### Thanks

Thanks to pomax for his help (and code) for curve fitting (which is much more complex than it might seem). His [A Primer on Bézier Curves](https://pomax.github.io/bezierinfo/) is a thing of wonder.

## Project

### Install

```bash

pnpm install

```

### Build

```bash
pnpm run build # Build once
pnpm run build-watch # Build and watch for changes
```

### Preview build

```bash
pnpm run preview
```

### Generate docs

```bash
pnpm run docs
```

### Run tests

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

### Lint

```bash
pnpm run lint-prettier
pnpm run lint-eslint
```

### Release

Releases are via semantic-release and executed on CI via Github actions. Docs are deployed to Vercel.

### Linking

To link into the local version of `coons-patch` for local testing run:

```
pnpm run link
```

To unlink (and use the package from npm):

```
pnpm run unlink
```
