
  function isVertical(polygon) {
    var n;

    for (var i = 0, il = polygon.length - 2; i < il; i++) {
      n = getNormal(polygon[i], polygon[i + 1], polygon[i + 2]);

      if (n[0] === 0 && n[1] === 0 && n[2] === 0) {
        continue;
      }

      if (n[2] === 1 || n[2] === -1) {
        //return false;
        continue;
      }

      return !n[2] || Math.round(n[2] * 10) === 0;
    }
  }

  Triangulate.addTriangle = function (data, a, b, c, color, index) {
    var n = getNormal(a, b, c);
  };
