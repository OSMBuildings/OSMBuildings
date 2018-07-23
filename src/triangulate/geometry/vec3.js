const vec3 = {
  len: a => {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
  },

  sub: (a, b) => {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  },

  unit: a => {
    const l = vec3.len(a);
    return [a[0] / l, a[1] / l, a[2] / l];
  },

  normal: (a, b, c) => {
    const d1 = vec3.sub(a, b), d2 = vec3.sub(b, c);
    // normalized cross product of d1 and d2
    return vec3.unit([
      d1[1] * d2[2] - d1[2] * d2[1],
      d1[2] * d2[0] - d1[0] * d2[2],
      d1[0] * d2[1] - d1[1] * d2[0]
    ]);
  }
};
