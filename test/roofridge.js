function roundPoint(point, f = 1e12) {
  return [
    Math.round(point[0]*f) / f,
    Math.round(point[1]*f) / f
  ]
}

function pointOnSegment (point, segment) {
  point = roundPoint(point);
  segment[0] = roundPoint(segment[0]);
  segment[1] = roundPoint(segment[1]);
  return (
    point[0] >= Math.min(segment[0][0], segment[1][0]) &&
    point[0] <= Math.max(segment[1][0], segment[0][0]) &&
    point[1] >= Math.min(segment[0][1], segment[1][1]) &&
    point[1] <= Math.max(segment[0][1], segment[1][1])
  );
}

function getVectorSegmentIntersection (point1, vector1, segment) {
  var
    point2 = segment[0],
    vector2 = [segment[1][0] - segment[0][0], segment[1][1] - segment[0][1]],
    n1, n2, m1, m2, xy;

  if (vector1[0] === 0 && vector2[0] === 0) {
    return;
  }

  if (vector1[0] !== 0) {
    m1 = vector1[1] / vector1[0];
    n1 = point1[1] - m1 * point1[0];
  }

  if (vector2[0] !== 0) {
    m2 = vector2[1] / vector2[0];
    n2 = point2[1] - m2 * point2[0];
  }

  if (vector1[0] === 0) {
    xy = [point1[0], m2 * point1[0] + n2];
    if (pointOnSegment(xy, segment)) {
      return xy;
    }
  }

  if (vector2[0] === 0) {
    xy = [point2[0], m1 * point2[0] + n1];
    if (pointOnSegment(xy, segment)) {
      return xy;
    }
  }

  if (m1 === m2) {
    return;
  }

  var x = (n2 - n1) / (m1 - m2);
  xy = [x, m1 * x + n1];
  if (pointOnSegment(xy, segment)) {
    return xy;
  }
}


var center = [34.38861856657201, 53.09939710879374];
var direction = [0.008726535498373897, 0.9999619230641713];
var polygon = [
  [28.8386407438249,   41.85612853858462],
  [39.72615704679365,  41.744809048072405],
  [39.93859638931913,  64.45398516951508],
  [28.997970250671845, 64.45398516951508],
  [28.8386407438249,   41.85612853858462]
];

console.log('center', center, 'dir', direction);

for (var i = 0; i < polygon.length - 1; i++) {
  // if (i === 2) debugger
  var point = getVectorSegmentIntersection(center, direction, [polygon[i], polygon[i + 1]]);
  console.log('i', i, 'point', point, 'A', polygon[i], 'B', polygon[i + 1]);
}