
var Vector = require('./Vector.js');

var Polygon = module.exports = {};

Polygon.getCentroid = function(polygon) {
  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (var i = 0, len = polygon.length; i < len; i++) {
    minX = min(minX, polygon[i][0]);
    maxX = max(maxX, polygon[i][0]);
    minY = min(minY, polygon[i][1]);
    maxY = max(maxY, polygon[i][1]);
  }
  return new Vector(minX+(maxX-minX)/2, minY+(maxY-minY)/2);
};

Polygon.getSegments = function(polygon) {
  var segments = [];
  for (var i = 0; i < polygon.length-1; i++) {
    segments.push(new Segment(new Vector(polygon[i][0], polygon[i][1]), new Vector(polygon[i+1][0], polygon[i+1][1])));
  }
  return segments;
};

Polygon.getSegmentIntersections = function(polygon, line) {
  var intersections = [], inters;
  var polySegments = Polygon.getSegments(polygon);
  for (var i = 0, len = polySegments.length; i < len; i++) {
    inters = line.getIntersection(polySegments[i]);
    if (inters !== undefined) {
      intersections.push(polySegments[i]);
    }
  }
  return intersections;
};
