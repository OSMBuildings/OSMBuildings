
function pointOnSegment(point, segment) {
  return (
    point[0] >= Math.min(segment[0][0], segment[1][0]) &&
    point[0] <= Math.max(segment[1][0], segment[0][0]) &&
    point[1] >= Math.min(segment[0][1], segment[1][1]) &&
    point[1] <= Math.max(segment[1][1], segment[0][1])
  );
}

function getVectorSegmentIntersection(point1, vector1, segment) {
  var
    point2 = segment[0],
    vector2 = [ segment[1][0]-segment[0][0], segment[1][1]-segment[0][1] ],
    n1, n2, m1, m2, xy;

  if (vector1[0] === 0 && vector2[0] === 0) {
    return;
  }
  if (vector1[0] !== 0) {
    m1 = vector1[1]/vector1[0];
    n1 = point1[1] - m1*point1[0];
  }
  if (vector2[0] !== 0) {
    m2 = vector2[1]/vector2[0];
    n2 = point2[1] - m2*point2[0];
  }
  if (vector1[0] === 0) {
    xy = [point1[0], m2*point1[0] + n2];
    if (pointOnSegment(xy, segment)) {
      return xy;
    }
  }
  if (vector2[0] === 0) {
    xy = [point2[0], m1*point2[0] + n1];
    if (pointOnSegment(xy, segment)) {
      return xy;
    }
  }
  if (m1 === m2) {
    return;
  }
  var x = (n2 - n1)/(m1 - m2);
  xy = [x, m1*x + n1];
  if (pointOnSegment(xy, segment)) {
    return xy;
  }
}


// function getVectorIntersection(point1, vector1, point2, vector2) {
//   var b1, b2, m1, m2, point;
//   if (vector1[0] === 0 && vector2[0] === 0) {
//     return false;
//   }
//   if (vector1[0] !== 0) {
//     m1 = vector1[1]/vector1[0];
//     b1 = point1[1] - m1*point1[0];
//   }
//   if (vector2[0] !== 0) {
//     m2 = vector2[1]/vector2[0];
//     b2 = point2[1] - m2*point2[0];
//   }
//   if (vector1[0] === 0) {
//     return [point1[0], m2*point1[0] + b2];
//   }
//   if (vector2[0] === 0) {
//     return [point2[0], m1*point2[0] + b1];
//   }
//   if (m1 === m2) {
//     return false;
//   }
//   point = [];
//   point[0] = (b2 - b1)/(m1 - m2);
//   point[1] = m1*point[0] + b1;
//   return point;
// }

function getDistanceToLine(point, line) {
  var
    r1 = line[0],
    r2 = line[1];
  if (r1[0] === r2[0] && r1[1] === r2[1]) {
    return;
  }

  var m1 = (r2[1] - r1[1]) / (r2[0] - r1[0]);
  var b1 = r1[1] - (m1*r1[0]);

  if (m1 === 0) {
    return Math.abs(b1-point[1]);
  }

  if (m1 === Infinity){
    return Math.abs(r1[0]-point[0]);
  }

  var m2 =- 1.0/m1;
  var b2 = point[1] - (m2*point[0]);

  var xs = (b2-b1)/(m1-m2);
  var ys = m1*xs+b1;

  var c1 = point[0]-xs;
  var c2 = point[1]-ys;

  return Math.sqrt(c1*c1+c2*c2);
}
