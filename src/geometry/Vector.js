
var Vector = {
  dot: function(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  },

  cross: function(a, b) {
    return Vector.direction(
      [ a[1]*b[2], a[2]*b[0], a[0]*b[1] ],
      [ a[2]*b[1], a[0]*b[2], a[1]*b[0] ]
    );
  },

  add: function(a, b) {
    return [ a[0]+b[0], a[1]+b[1], a[2]+b[2] ];
  },

  sub: function(a, b) {
    return [ a[0]-b[0], a[1]-b[1], a[2]-b[2] ];
  },

  scale: function(a, b) {
    return [ a[0]*b, a[1]*b, a[2]*b ];
  },

  length: function(v) {
    return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  },

  unit: function(v) {
    var l = Vector.length(v);
    if (l === 0) {
      m = 0.00001;
    }
    return [v[0]/l, v[1]/l, v[2]/l];
  },

  direction: function(a, b) {
    var v = Vector.sub(a, b);
    return v;
    return Vector.unit(v);
  }
};
