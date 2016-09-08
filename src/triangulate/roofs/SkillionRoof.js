
function SkillionRoof(properties, coordinates, center, height) {

  var
    i, il,
    outerRing = coordinates[0],
    direction = vec2.scale(getRoofDirection(properties, outerRing), 1000),
    // get farthest intersection of polygon and slope line
    intersections = getPolygonIntersections(outerRing, [vec2.sub(center, direction), vec2.add(center, direction)]),
    segment,
    ridge,
    distance = 0,
    maxDistance = -1;

  for (i = 0, il = intersections.length; i<il; i++) {
    segment = [outerRing[intersections[i]], outerRing[intersections[i]+1]]
    distance = getDistanceToLine(center, segment);
    if (distance > maxDistance) {
      ridge = segment;
      maxDistance = distance;
    }
  }

  if (ridge === undefined) {
    return;
  }

  maxDistance = 0.01;
  var distances = [];
  for (i = 0, il = outerRing.length; i<il; i++) {
    distances[i] = getDistanceToLine(outerRing[i], ridge);
    if (distances[i] > maxDistance) {
      maxDistance = distances[i];
    }
  }

  // TODO: modify inner rings too
  var relativeDistance = 0;
  for (i = 0, il = outerRing.length; i<il; i++) {
    outerRing[i][2] = (1-distances[i]/maxDistance) * height;
  }

  return [outerRing];
  // return { coordinates:[outerRing], ridge:ridge };
}
