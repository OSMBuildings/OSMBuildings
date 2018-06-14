const vec2 = {
  len: a => {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
  },

  add: (a, b) => {
    return [a[0] + b[0], a[1] + b[1]];
  },

  sub: (a, b) => {
    return [a[0] - b[0], a[1] - b[1]];
  },

  dot: (a, b) => {
    return a[1] * b[0] - a[0] * b[1];
  },

  scale: (a, f) => {
    return [a[0] * f, a[1] * f];
  },

  equals: (a, b) => {
    return (a[0] === b[0] && a[1] === b[1]);
  }
};
