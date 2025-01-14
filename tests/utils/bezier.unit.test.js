import { getBezierCurveLength } from '../../src/utils/bezier'

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe(`getBezierCurveLength`, () => {
  const curve = {
    startPoint: { x: 0, y: 0 },
    controlPoint1: { x: 50, y: 50 },
    controlPoint2: { x: 50, y: 150 },
    endPoint: { x: 100, y: 100 },
  }

  test(`should return the length of the bezier curve`, () => {
    expect(getBezierCurveLength(curve)).toBeCloseTo(168.31)
  })
})
