
// calculate simplification data using optimized Douglas-Peucker algorithm

function simplify (points, tolerance) {

  const
    sqTolerance = tolerance * tolerance,
    len = points.length,
    stack = [];

  let first = 0, last = len - 1;

  // avoid recursion by using a stack
  let maxSqDist, index;
  while (last) {
    maxSqDist = 0;

    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(points[i], points[first], points[last]);

      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      stack.push(first);
      stack.push(index);
      first = index;
    } else {
      last = stack.pop();
      first = stack.pop();
    }
  }
}

// square distance from a point to a segment
function getSqSegDist (p, a, b) {
  let
    x = a[0], y = a[1],
    bx = b[0], by = b[1],
    px = p[0], py = p[1],
    dx = bx - x,
    dy = by - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = bx;
      y = by;
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = px - x;
  dy = py - y;

  return dx * dx + dy * dy;
}
