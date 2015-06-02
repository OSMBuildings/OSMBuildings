
var Plane = {
  normal: function(a, b, c) {
    var m = Vector.sub(a, b);
    var n = Vector.sub(b, c);
    return Vector.cross(m, n);
  },

  distance: function(normal, v) {
    return -Vector.dot(normal, v);
  },

  intersection: function(origin, direction, normal, distance) {
    var denom = Vector.dot(direction, normal);
    if (denom !== 0) {
      var t = (Vector.dot(origin, normal) + distance) / denom;
      if (t < 0) {
        return null;
      }
      var v0 = Vector.scale(direction, t);
      return Vector.sub(origin, v0);
    }

    if (Vector.dot(origin, normal) + distance === 0) {
      return origin;
    }

    return null;
  }
};
