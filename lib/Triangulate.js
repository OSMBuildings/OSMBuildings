
var Triangulate = {

  NUM_Y_SEGMENTS: 24,
  NUM_X_SEGMENTS: 32,

  //function isVertical(a, b, c) {
  //  return Math.abs(normal(a, b, c)[2]) < 1/5000;
  //}

  quad: function(data, a, b, c, d, color) {
    this.triangle(data, a, b, c, color);
    this.triangle(data, c, d, a, color);
  },

  triangle: function(data, a, b, c, color) {
    var n = normal(a, b, c);
    [].push.apply(data.vertices, [].concat(a, c, b));
    [].push.apply(data.normals,  [].concat(n, n, n));
    [].push.apply(data.colors,   [].concat(color, color, color));
    data.texCoords.push(0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
  },

  circle: function(data, center, radius, Z, color) {
    Z = Z || 0;
    var u, v;
    for (var i = 0; i < this.NUM_X_SEGMENTS; i++) {
      u = i/this.NUM_X_SEGMENTS;
      v = (i+1)/this.NUM_X_SEGMENTS;
      this.triangle(
        data,
        [ center[0] + radius * Math.sin(u*Math.PI*2), center[1] + radius * Math.cos(u*Math.PI*2), Z ],
        [ center[0],                                  center[1],                                  Z ],
        [ center[0] + radius * Math.sin(v*Math.PI*2), center[1] + radius * Math.cos(v*Math.PI*2), Z ],
        color
      );
    }
  },

  polygon: function(data, rings, Z, color) {
    Z = Z || 0;
    // flatten data
    var
      inVertices = [], inHoleIndex = [],
      index = 0,
      i, il;
    for (i = 0, il = rings.length; i < il; i++) {
      for (var j = 0; j < rings[i].length; j++) {
        inVertices.push(rings[i][j][0], rings[i][j][1]);
      }
      if (i) {
        index += rings[i - 1].length;
        inHoleIndex.push(index);
      }
    }

    var vertices = earcut(inVertices, inHoleIndex, 2);

    for (i = 0, il = vertices.length-2; i < il; i+=3) {
      this.triangle(
        data,
        [ inVertices[ vertices[i  ]*2 ], inVertices[ vertices[i  ]*2+1 ], Z ],
        [ inVertices[ vertices[i+1]*2 ], inVertices[ vertices[i+1]*2+1 ], Z ],
        [ inVertices[ vertices[i+2]*2 ], inVertices[ vertices[i+2]*2+1 ], Z ],
        color
      );
    }
  },

  //polygon3d: function(data, rings, color) {
  //  var ring = rings[0];
  //  var ringLength = ring.length;
  //  var vertices, t, tl;
  //
////  { r:255, g:0, b:0 }
//
  //  if (ringLength <= 4) { // 3: a triangle
  //    this.triangle(
  //      data,
  //      ring[0],
  //      ring[2],
  //      ring[1], color
  //    );
  //
  //    if (ringLength === 4) { // 4: a quad (2 triangles)
  //      this.triangle(
  //        data,
  //        ring[0],
  //        ring[3],
  //        ring[2], color
  //      );
  //    }
//      return;
  //  }
  //
  //  if (isVertical(ring[0], ring[1], ring[2])) {
  //    for (var i = 0, il = rings[0].length; i < il; i++) {
  //      rings[0][i] = [
  //        rings[0][i][2],
  //        rings[0][i][1],
  //        rings[0][i][0]
  //      ];
  //    }
  //
  //    vertices = earcut(rings);
  //    for (t = 0, tl = vertices.length-2; t < tl; t+=3) {
  //      this.triangle(
  //        data,
  //        [ vertices[t  ][2], vertices[t  ][1], vertices[t  ][0] ],
  //        [ vertices[t+1][2], vertices[t+1][1], vertices[t+1][0] ],
  //        [ vertices[t+2][2], vertices[t+2][1], vertices[t+2][0] ], color
  //      );
  //    }
//      return;
  //  }
  //
  //  vertices = earcut(rings);
  //  for (t = 0, tl = vertices.length-2; t < tl; t+=3) {
  //    this.triangle(
  //      data,
  //      [ vertices[t  ][0], vertices[t  ][1], vertices[t  ][2] ],
  //      [ vertices[t+1][0], vertices[t+1][1], vertices[t+1][2] ],
  //      [ vertices[t+2][0], vertices[t+2][1], vertices[t+2][2] ], color
  //    );
  //  }
  //},

  cube: function(data, sizeX, sizeY, sizeZ, X, Y, Z, color) {
    X = X || 0;
    Y = Y || 0;
    Z = Z || 0;

    var a = [X,       Y,       Z];
    var b = [X+sizeX, Y,       Z];
    var c = [X+sizeX, Y+sizeY, Z];
    var d = [X,       Y+sizeY, Z];

    var A = [X,       Y,       Z+sizeZ];
    var B = [X+sizeX, Y,       Z+sizeZ];
    var C = [X+sizeX, Y+sizeY, Z+sizeZ];
    var D = [X,       Y+sizeY, Z+sizeZ];

    this.quad(data, b, a, d, c, color);
    this.quad(data, A, B, C, D, color);
    this.quad(data, a, b, B, A, color);
    this.quad(data, b, c, C, B, color);
    this.quad(data, c, d, D, C, color);
    this.quad(data, d, a, A, D, color);
  },

  cylinder: function(data, center, radius1, radius2, height, Z, color) {
    Z = Z || 0;
    var
      currAngle, nextAngle,
      currSin, currCos,
      nextSin, nextCos,
      num = this.NUM_X_SEGMENTS,
      doublePI = Math.PI*2;

    for (var i = 0; i < num; i++) {
      currAngle = ( i   /num) * doublePI;
      nextAngle = ((i+1)/num) * doublePI;

      currSin = Math.sin(currAngle);
      currCos = Math.cos(currAngle);

      nextSin = Math.sin(nextAngle);
      nextCos = Math.cos(nextAngle);

      this.triangle(
        data,
        [ center[0] + radius1*currSin, center[1] + radius1*currCos, Z ],
        [ center[0] + radius2*nextSin, center[1] + radius2*nextCos, Z+height ],
        [ center[0] + radius1*nextSin, center[1] + radius1*nextCos, Z ],
        color
      );

      if (radius2 !== 0) {
        this.triangle(
          data,
          [ center[0] + radius2*currSin, center[1] + radius2*currCos, Z+height ],
          [ center[0] + radius2*nextSin, center[1] + radius2*nextCos, Z+height ],
          [ center[0] + radius1*currSin, center[1] + radius1*currCos, Z ],
          color
        );
      }
    }
  },

  dome: function(data, center, radius, height, Z, color) {
    Z = Z || 0;
    var
      currAngle, nextAngle,
      currSin, currCos,
      nextSin, nextCos,
      currRadius, nextRadius,
      nextHeight, nextZ,
      num = this.NUM_Y_SEGMENTS/2,
      halfPI = Math.PI/2;

    for (var i = 0; i < num; i++) {
      currAngle = ( i   /num) * halfPI - halfPI;
      nextAngle = ((i+1)/num) * halfPI - halfPI;

      currSin = Math.sin(currAngle);
      currCos = Math.cos(currAngle);

      nextSin = Math.sin(nextAngle);
      nextCos = Math.cos(nextAngle);

      currRadius = currCos*radius;
      nextRadius = nextCos*radius;

      nextHeight = (nextSin-currSin)*height;
      nextZ = Z - nextSin*height;

      this.cylinder(data, center, nextRadius, currRadius, nextHeight, nextZ, color);
    }
  },

  // TODO
  sphere: function(data, center, radius, height, Z, color) {
    Z = Z || 0;
    return this.cylinder(data, center, radius, radius, height, Z, color);
  },

  pyramid: function(data, polygon, center, height, Z, color) {
    Z = Z || 0;
    polygon = polygon[0];
    for (var i = 0, il = polygon.length-1; i < il; i++) {
      this.triangle(
        data,
        [ polygon[i  ][0], polygon[i  ][1], Z ],
        [ polygon[i+1][0], polygon[i+1][1], Z ],
        [ center[0], center[1], Z+height ],
        color
      );
    }
  },

  extrusion: function(data, polygon, height, Z, color, tx) {
    Z = Z || 0;
    var
      ring, last, a, b,
      L,
      v0, v1, v2, v3, n,
      tx1, tx2,
      ty1 = tx[2]*height, ty2 = tx[3]*height;

    for (var i = 0, il = polygon.length; i < il; i++) {
      ring = polygon[i];
      last = ring.length-1;

      if (ring[0][0] !== ring[last][0] || ring[0][1] !== ring[last][1]) {
        ring.push(ring[0]);
        last++;
      }

      for (var r = 0; r < last; r++) {
        a = ring[r];
        b = ring[r+1];
        L = len2(sub2(a, b));

        tx1 = (tx[0]*L) <<0;
        tx2 = (tx[1]*L) <<0;

        v0 = [ a[0], a[1], Z];
        v1 = [ b[0], b[1], Z];
        v2 = [ b[0], b[1], Z+height];
        v3 = [ a[0], a[1], Z+height];

        n = normal(v0, v1, v2);
        [].push.apply(data.vertices, [].concat(v0, v2, v1, v0, v3, v2));
        [].push.apply(data.normals,  [].concat(n, n, n, n, n, n));
        [].push.apply(data.colors,   [].concat(color, color, color, color, color, color));

        data.texCoords.push(
          tx1, ty2,
          tx2, ty1,
          tx2, ty2,
          tx1, ty2,
          tx1, ty1,
          tx2, ty1
        );
      }
    }
  }
};
