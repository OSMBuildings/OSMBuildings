
    return glx;

  }(context));
};

if (typeof define === 'function') {
  define([], GLX);
} else if (typeof exports === 'object') {
  module.exports = GLX;
} else {
  global.GLX = GLX;
}
