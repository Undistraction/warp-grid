import { COORDINATE } from '../const'

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const getCoordinateOnSurface = ({
  coordinateName,
  boundaryPoints: {
    pointOnTopBoundary,
    pointOnBottomBoundary,
    pointOnLeftBoundary,
    pointOnRightBoundary,
  },
  cornerPoints: {
    cornerPointTopLeft,
    cornerPointTopRight,
    cornerPointBottomLeft,
    cornerPointBottomRight,
  },
  u,
  v,
}) => {
  return (
    (1 - v) * pointOnTopBoundary[coordinateName] +
    v * pointOnBottomBoundary[coordinateName] +
    (1 - u) * pointOnLeftBoundary[coordinateName] +
    u * pointOnRightBoundary[coordinateName] -
    (1 - u) * (1 - v) * cornerPointTopLeft[coordinateName] -
    u * (1 - v) * cornerPointTopRight[coordinateName] -
    (1 - u) * v * cornerPointBottomLeft[coordinateName] -
    u * v * cornerPointBottomRight[coordinateName]
  )
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const getPointOnSurface = (
  { top, bottom, left, right },
  u,
  v,
  interpolatePointOnCurve
) => {
  const boundaryPoints = {
    pointOnTopBoundary: interpolatePointOnCurve(u, top),
    pointOnBottomBoundary: interpolatePointOnCurve(u, bottom),
    pointOnLeftBoundary: interpolatePointOnCurve(v, left),
    pointOnRightBoundary: interpolatePointOnCurve(v, right),
  }

  const cornerPoints = {
    cornerPointBottomLeft: bottom.startPoint,
    cornerPointBottomRight: bottom.endPoint,
    cornerPointTopLeft: top.startPoint,
    cornerPointTopRight: top.endPoint,
  }

  return {
    x: getCoordinateOnSurface({
      coordinateName: COORDINATE.X,
      boundaryPoints,
      cornerPoints,
      u,
      v,
    }),
    y: getCoordinateOnSurface({
      coordinateName: COORDINATE.Y,
      boundaryPoints,
      cornerPoints,
      u,
      v,
    }),
  }
}
