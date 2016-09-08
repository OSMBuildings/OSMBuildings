
var vec3 = {
  len: function(a) {
    return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
  },

  sub: function(a, b) {
    return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
  },

  unit: function(a) {
    var l = this.len(a);
    return [a[0]/l, a[1]/l, a[2]/l];
  },

  normal: function(a, b, c) {
    var d1 = this.sub(a, b);
    var d2 = this.sub(b, c);
    // normalized cross product of d1 and d2
    return this.unit([
      d1[1]*d2[2] - d1[2]*d2[1],
      d1[2]*d2[0] - d1[0]*d2[2],
      d1[0]*d2[1] - d1[1]*d2[0]
    ]);
  }
};
