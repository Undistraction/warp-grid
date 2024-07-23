## TODO (MSCW)

### Must do

3.  getGridCells - return an array of cell data

### Should do

### Could do

2.  Add back easing

#### Add back easing

(See https://gre.github.io/bezier-easing-editor/example/), basically pass each ratio to an easing function before using it.

```
// const easeX = BezierEasing(0, 0, 1, 1)
// const easeY = BezierEasing(0, 0, 1, 1)
const easedRatioX = easeX(ratioX)
```
