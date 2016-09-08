
var vec2 = {
  len: function(a) {
    return Math.sqrt(a[0]*a[0] + a[1]*a[1]);
  },

  add: function(a, b) {
    return [a[0]+b[0], a[1]+b[1]];
  },

  sub: function(a, b) {
    return [a[0]-b[0], a[1]-b[1]];
  },

  dot: function(a, b) {
    return a[1]*b[0] - a[0]*b[1];
  },

  scale: function(a, f) {
    return [a[0]*f, a[1]*f];
  },

  equals: function(a, b) {
    return (a[0] === b[0] && a[1] === b[1]);
  }
};
