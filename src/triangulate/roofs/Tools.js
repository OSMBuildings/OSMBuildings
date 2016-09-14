
function getSqDist(p1, p2) {
  var dx = p1[0] - p2[0], dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}

function simplify(polygon, sqTolerance) {
  var prevPoint = polygon[0],
    newPoints = [prevPoint],
    point;

  for (var i = 1, len = polygon.length; i < len; i++) {
    point = polygon[i];
    if (getSqDist(point, prevPoint) > sqTolerance) {
      newPoints.push(point);
      prevPoint = point;
    }
  }

  if (prevPoint !== point) {
    newPoints.push(point);
  }

  return newPoints;
}

function getPolygonDirection(polygon) {
  var
    d,
    segmentLength = 0,
    maxSegmentLength = 0,
    maxSegment;

  var simplePolygon = simplify(polygon, 10);

  for (var i = 0, il = simplePolygon.length - 1; i<il; i++) {
    segmentLength = vec2.len(vec2.sub(simplePolygon[i+1], simplePolygon[i]));
    if (segmentLength>maxSegmentLength) {
      maxSegmentLength = segmentLength;
      maxSegment = [simplePolygon[i], simplePolygon[i + 1]];
    }
  }

  d = vec2.sub(maxSegment[1], maxSegment[0]);
  return [d[0]/maxSegmentLength, d[1]/maxSegmentLength];
}

function getPolygonIntersections(polygon, line) {
  var res = [], segment, intersection;
  for (var i = 0, il = polygon.length-1; i < il; i++) {
    segment = [polygon[i], polygon[i+1]];
    intersection = getLineIntersection(segment, line);
    if (intersection !== undefined) {
      res.push({ index:i, segment:segment });
    }
  }
  return res;
}

function getLineIntersection(line1, line2) {
  if (vec2.equals(line1[0], line2[0]) || vec2.equals(line1[0], line2[1]) || vec2.equals(line1[1], line2[0]) || vec2.equals(line1[1], line2[1])) {
    return;
  }

  var d1 = vec2.sub(line1[1], line1[0]), d2 = vec2.sub(line2[1], line2[0]);

  // calculate dot product;
  // if dot product is close to 0, the lines are parallel
  var denom = vec2.dot(d1, d2);
  if (Math.abs(denom) < 1e-10) {
    return;
  }

  // calculate vector for connection between line1[0] and line2[0]
  var amc = vec2.sub(line2[0], line1[0]);

  // calculate t so that intersection is at line1[0]+t*v
  var t = vec2.dot(amc, d2)/denom;
  if (t<0 || t>1) {
    return;
  }

  // calculate s so that intersection is at line2[0]+t*q
  var s = vec2.dot(amc, d1)/denom;
  if (s<0 || s>1) {
    return;
  }

  return vec2.add(line1[0], vec2.scale(d1, t));
}

// function getDistanceToSegment(point, line) {
//   var length = vec2.len(vec2.sub(line[1], line[0]));
//   if (length === 0) {
//     return vec2.len(vec2.sub(point, line[0]));
//   }
//
//   var t = ((point[0]-line[0][0]) * (line[1][0]-line[0][0]) + (point[1]-line[0][1]) * (line[1][1]-line[0][1])) / length;
//   t = Math.max(0, Math.min(1, t));
//
//   var d = vec2.len(vec2.sub(point, vec2.add(line[0], vec2.sub(line[1], vec2.scale(point, t)))));
//   return Math.sqrt(d);
// }

function getDistanceToLine(a, line) {
  var r1 = line[0];
  var r2 = line[1];
  if (r1[0] === r2[0] && r1[1] === r2[1]) {
    return;
  }

  var m1 = (r2[1] - r1[1]) / (r2[0] - r1[0]);
  var b1 = r1[1] - (m1*r1[0]);

  if (m1 === 0) {
    return Math.abs(b1-a[1]);
  }

  if (m1 === Infinity){
    return Math.abs(r1[0]-a[0]);
  }

  var m2 =- 1.0/m1;
  var b2 = a[1] - (m2*a[0]);

  var xs = (b2-b1)/(m1-m2);
  var ys = m1*xs+b1;

  var c1 = a[0]-xs;
  var c2 = a[1]-ys;

  return Math.sqrt(c1*c1+c2*c2);
}

function getSegmentCenter(seg) {
  return vec2.add(seg[0], vec2.scale(vec2.sub(seg[1], seg[0]), 0.5) );
}
