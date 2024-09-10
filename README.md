# README

This package allows you to create a grid and distort it in 2D space, then access information about its metrics - its bounds, rows, columns, gutters and cells.

It provides a lot of flexiblity and allows for some complex grids that are very hard to generate using traditional graphics software, and allows you to do so with fine programatic control.

There is an [interactive demo](https://warp-grid.undistraction.com) which allows you to generate and manipulate a grid, giving access to all the configuration available.

This package does not handle any rendering itself, but provides you with all the data you need to render the grid using SVG, Canvas or anything else you like.

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

The basic workflow is that you pass bounds representing the edges of your grid, and a grid configuration object describing the grid you'd like to map onto the square, and receive an object with information about the coons patch, and an API to allow you to get metrics describing the patch. This means no expensive calculations are done up front, and are only performed when you need them.Expensive calculations are memoized.

```typeScript
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

// Define a 10 x 5 grid
const gridDefinition = {
  columns: 10
  rows: 5,
}

const grid = warpGrid(
  boundingCurves,
  gridDefinition
)

// Get a point on the patch at the provided horizontal and vertical ratios (0–1)
const point = warpGrid.getPoint(0.5, 0.75)

// Get an object with `u` and `v` keys. Each key contains an Array containing data representing all the sub-curves that make up each curve along that axis.
const curves = warpGrid.getLines()

// Get an array of points representing every grid intersection
const intersections = warpGrid.getIntersections()

// Get the bounds for the grid-square at the supplied coordinates
const bounds = warpGrid.getCellBounds(3, 8)
```

There are a large number of validations that ensure that if you supply invalid data you will receive a helpful error message.

## Primatives

There are a number of data types that are used by the package to describe aspects of the grid:

Points look like this:

```typeScript
{
  x: 34,
  y: 44
}
```

All curves are represented by cubic Bezier curves:

```typeScript
{
  startPoint: { x: 0, y: 0},
  controlPoint1: { x: 0, y: 33},
  controlPoint2: { x: 0, y: 66},
  endPoint: { x: 0, y: 100}
}
```

Bounding curves look like this, where each item is curve.

```typeScript
{
  top,
  bottom,
  left,
  right
}
```

## Bounds

## Grid definition

The grid definition describes the grid to model, allowing access to a number of powerful options.

### Columns and Rows

The grid definition describes the grid that will be interpolated onto the bounds. It has two main fields, `colums` and `rows`. A grid has a minimum of one row and one column. The generic name for columns and rows is 'steps'.

These fields can be one of the following:

1. An integer, in which case that integer will represent the number of columns or rows (steps). For example `columns: 2`, will result in a grid with two columns.
2. An array of integers, in which case the number of steps will equal the number of items in the array, with the size of each step consiting of the value of that array item as an integer of the total of all the values. For example, `columns: [3, 5, 1, 1] will result in a total of 10 (3 + 5 + 1 + 1), meaning that the first column will be 3/10 (30%) of the grid width, the second column 5/10 (50%), and the remaining two columns 1/10 (10%) each.
3. An array of objects, each with a `value` key: (`{ value: 2}`). This will work the same as the previous example, with the combined value of all the `value` keys dictating the total value, and the `value` key dictating the size of each step.

### Gutters

If supplied, `gutter` will describe the width of horizontal gutters and the height of vertical gutters (the spaces between the grid cells). If `gutter` is a number, it describes both horizontal and vertical gutters. If it is an array of two numbers, the first number describes the horizontal gutter and the second number describes the vertical gutter. Like columns and rows, gutters are also a ratio of the total value, for example, if columns are `[1,4,3]` and gutters are `1` then the total will be 10 (1 + 4 + 3 + (2 \* 1)). There will be three rows of 1/10 (10%), 4/10 (40%) and 3/10 (30%) with two gutters of 1/10 (10%) between them.

There is an additional way to add gutters without using the gutters property. You can add them to the rows or columns arrays, using an object with a `value` property, but also adding and `isGutter` property set to `true`: (`{ value: 2. isGutter: true}`). This allows you to define gutters of different widths/heights in the same way you can define columns or rows of different widths/heights.

### Interpolations

The grid also supports configuration params that change how it calculates the grid-elements.

#### interpolationStrategy

`interpolationStrategy` changes the algorythm used to interpolate the position of points along a curve. This value can be either a string, a function, or a tupple of two functions.

If it's a string it can be either `even` (the default) or `linear`. If `linear` interplation is used, the effect is to exagerate the effect of curvature on the distance between rows and columns. `even` uses a more complex approach and usually results in more pleasing (and expected) results. However it is significantly more memory intensive.

Alternatively a single function, or a tupple of two functions (one for the u-axis and one for the v-axis) can be supplied.

Functions should have the signture:

```typeScript
(config: {precision: number, bezierEasing: BezierEasing}) => (t: number, curve: Curve): Point
```

#### lineStrategy

`lineStrategy` controls how lines are interpolated and can either be `straightLines` or `curves`. The lines returned from `getCurves` and the bounds returned from `getCellBounds` and `getAllCellBounds` are always represented by cubic Bezier curves, however if the `lineStrategy` is `straightLines`, the calculations are significantly simplified and all lines will be straight (`controlPoint1` will be the same as the `startPoint`, and `controlPoint2` will be the same as `endPoint`) For more accurate calcualtions choose `curves` which will draw curved cubic Bezier curves. The default is `straightLines`.

#### precision

If you choose to use a line strategy of `even`, this parameter controls how precise the interpolation is. Higher values are more memory-intensive but more accurate. The default value is `20`. With `linear` this will have no effect.

### bezierEasing

The grid provides a very powerful way of controlling the distribution of lines along each access using bezierEasing. Bezier easing is widely used for animation as a way of providing easing to a sequence of values. Instead of applying easing to an animation, here it is applied to the interpolation of points along an axis. `bezierEasing` is implemented by first creating an easing function, and then passing a value (in the range of 0–1) to it. The easing function requires four values (each from 0–1), so the value for `bezierEasing` will look like this:

```typeScript
{
  u: [0, 0, 1, 1]
  v: [0, 0, 1, 1]
}
```

The easiest way to understand the different values is to play with the [demo](https://warp-grid.undistraction.com).

Here is an example of a grid definition:

```typeScript
{
  columns: 8,
  rows: [10, 5, 20, 5, 10],
  gutters: [5, 3],
  interpolationStategy: `even`,
  lineStrategy: 'curves',
  precision: 30,
  bezierEasing: {
    u: [0, 0, 1, 1]
    v: [0, 0, 1, 1]
  }
}
```

#### Return value

The return value is a `warp grid` object representing the patch and providing an API to interrogate it.

```typeScript
{
  config: {
    columns,
    rows,
    boundingCurves
  },
  getPoint,
  getLinesXAxis,
  getLinesYAxis,
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

- `getLinesXAxis()` returns a 2D array of all the curves for each step along the x-axis. This includes curves for all left and right edges.

- `getLinesYAxis()` returns a 2D array of all the curves for each step along the y-axis. This includes curves for all top and bottom edges.

- `getLines()` returns an object with `xAxis` and `yAxis` keys, each of which contains a 2D array of all the curves for each step along that axis.

- `getIntersections()` returns an array of points, one for every point at which a column and a row intersect.

- `getCellBounds(row, column)` returns a set of bounding curves for the cell at the supplied row and colunn.

- `getAllCellBounds()` returns an array of bounding curves for all the cells in the grid. Important note: Due to the underlying architecture (which uses coons patches), and because cells can be used a bounds for nested grids, the order of the curves and their directions are the same as the those you supply for the grid bounds.

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
pnpm run test-coverage # Run tests and output a coverage report
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
