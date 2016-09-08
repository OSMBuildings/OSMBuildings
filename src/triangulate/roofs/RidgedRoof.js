
function RidgedRoof(properties, outerRing, center, height, offset) {
  var direction = vec2.scale(getRoofDirection(properties, outerRing), 1000); // => normal();

  // calculate the two outermost intersections of the
  // quasi-infinite ridge line with segments of the polygon

  var intersections = getPolygonIntersections(outerRing, [vec2.sub(center.sub, direction), vec2.add(center, direction)]);

  if (intersections.length < 2) {
    throw new Error('can\'t handle ridged roof geometry');
  }

  // TODO: choose outermost instead of any pair of intersections
  // the roof cap that is closer to the first vertex of the ridge
  var cap1 = intersections[0];

  // TODO: choose outermost instead of any pair of intersections
  // the roof cap that is closer to the second vertex of the ridge
  var cap2 = intersections[1];

  // put ridge to the centers of the intersected segments
  var c1 = getSegmentCenter(cap1);
  var c2 = getSegmentCenter(cap2);

  if (offset === 0) {
    var index = cap1;
    outerRing = outerRing.splice(index, 1, c1);
    index = cap2 + (cap2 > index ? 1 : 0);
    outerRing = outerRing.splice(index, 1, c2);

    var segments = [
//     [this.ridge[0], this.cap1[0]],
//     [this.ridge[0], this.cap1[1]],
//     [this.ridge[1], this.cap2[0]],
//     [this.ridge[1], this.cap2[1]]
//   ];

    return { geometry:[outerRing], ridge:[c1, c2] };
  }

  // absolute distance of ridge to outline
  var ridgeOffset = vec2.scale(vec2.sub(c2, c1), offset);
  return [vec2.add(c1, ridgeOffset), vec2.sub(c2, ridgeOffset)];

  // // calculate maximum distance of any outline vertex to the ridge
  // var maxDistanceToRidge = 0;
  // for (var i = 0, len = outerRing.length; i < len; i++) {
  //   maxDistanceToRidge = Math.max(maxDistance, new Vector(outerRing[i][0], outerRing[i][1]).distanceToLine(ridge));
  // }
}
