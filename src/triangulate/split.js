
var split = {

  NUM_Y_SEGMENTS: 24,
  NUM_X_SEGMENTS: 32,

  //function isVertical(a, b, c) {
  //  return Math.abs(normal(a, b, c)[2]) < 1/5000;
  //}

  quad: function(buffers, a, b, c, d, color) {
    this.triangle(buffers, a, b, c, color);
    this.triangle(buffers, c, d, a, color);
  },

  triangle: function(buffers, a, b, c, color) {
    var n = vec3.normal(a, b, c);
    [].push.apply(buffers.vertices, [].concat(a, c, b));
    [].push.apply(buffers.normals,  [].concat(n, n, n));
    [].push.apply(buffers.colors,   [].concat(color, color, color));
    buffers.texCoords.push(0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
  },

  circle: function(buffers, center, radius, zPos, color) {
    zPos = zPos || 0;
    var u, v;
    for (var i = 0; i < this.NUM_X_SEGMENTS; i++) {
      u = i/this.NUM_X_SEGMENTS;
      v = (i+1)/this.NUM_X_SEGMENTS;
      this.triangle(
        buffers,
        [ center[0] + radius * Math.sin(u*Math.PI*2), center[1] + radius * Math.cos(u*Math.PI*2), zPos ],
        [ center[0],                                  center[1],                                  zPos ],
        [ center[0] + radius * Math.sin(v*Math.PI*2), center[1] + radius * Math.cos(v*Math.PI*2), zPos ],
        color
      );
    }
  },

  polygon: function(buffers, rings, zPos, color) {
    zPos = zPos || 0;
    var
      vertexBuffer = [], ringIndex = [],
      index = 0,
      i, il,
      j, jl,
      ri, rij;

    for (i = 0, il = rings.length; i < il; i++) {
      ri = rings[i];
      for (j = 0; j < ri.length; j++) {
        rij = ri[j];
        vertexBuffer.push(rij[0], rij[1], zPos + (rij[2] || 0));
      }
      if (i) {
        index += rings[i-1].length;
        ringIndex.push(index);
      }
    }

    var
      vertices = earcut(vertexBuffer, ringIndex, 3),
      v1, v2, v3;

    for (i = 0, il = vertices.length-2; i < il; i+=3) {
      v1 = vertices[i  ]*3;
      v2 = vertices[i+1]*3;
      v3 = vertices[i+2]*3;
      this.triangle(
        buffers,
        [ vertexBuffer[v1], vertexBuffer[v1+1], vertexBuffer[v1+2] ],
        [ vertexBuffer[v2], vertexBuffer[v2+1], vertexBuffer[v2+2] ],
        [ vertexBuffer[v3], vertexBuffer[v3+1], vertexBuffer[v3+2] ],
        color
      );
    }
  },

  //polygon3d: function(buffers, rings, color) {
  //  var ring = rings[0];
  //  var ringLength = ring.length;
  //  var vertices, t, tl;
  //
////  { r:255, g:0, b:0 }
//
  //  if (ringLength <= 4) { // 3: a triangle
  //    this.triangle(
  //      buffers,
  //      ring[0],
  //      ring[2],
  //      ring[1], color
  //    );
  //
  //    if (ringLength === 4) { // 4: a quad (2 triangles)
  //      this.triangle(
  //        buffers,
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
  //        buffers,
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
  //      buffers,
  //      [ vertices[t  ][0], vertices[t  ][1], vertices[t  ][2] ],
  //      [ vertices[t+1][0], vertices[t+1][1], vertices[t+1][2] ],
  //      [ vertices[t+2][0], vertices[t+2][1], vertices[t+2][2] ], color
  //    );
  //  }
  //},

  cube: function(buffers, sizeX, sizeY, sizeZ, X, Y, zPos, color) {
    X = X || 0;
    Y = Y || 0;
    zPos = zPos || 0;

    var a = [X,       Y,       zPos];
    var b = [X+sizeX, Y,       zPos];
    var c = [X+sizeX, Y+sizeY, zPos];
    var d = [X,       Y+sizeY, zPos];

    var A = [X,       Y,       zPos+sizeZ];
    var B = [X+sizeX, Y,       zPos+sizeZ];
    var C = [X+sizeX, Y+sizeY, zPos+sizeZ];
    var D = [X,       Y+sizeY, zPos+sizeZ];

    this.quad(buffers, b, a, d, c, color);
    this.quad(buffers, A, B, C, D, color);
    this.quad(buffers, a, b, B, A, color);
    this.quad(buffers, b, c, C, B, color);
    this.quad(buffers, c, d, D, C, color);
    this.quad(buffers, d, a, A, D, color);
  },

  cylinder: function(buffers, center, radius1, radius2, height, zPos, color) {
    zPos = zPos || 0;
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
        buffers,
        [ center[0] + radius1*currSin, center[1] + radius1*currCos, zPos ],
        [ center[0] + radius2*nextSin, center[1] + radius2*nextCos, zPos+height ],
        [ center[0] + radius1*nextSin, center[1] + radius1*nextCos, zPos ],
        color
      );

      if (radius2 !== 0) {
        this.triangle(
          buffers,
          [ center[0] + radius2*currSin, center[1] + radius2*currCos, zPos+height ],
          [ center[0] + radius2*nextSin, center[1] + radius2*nextCos, zPos+height ],
          [ center[0] + radius1*currSin, center[1] + radius1*currCos, zPos ],
          color
        );
      }
    }
  },

  dome: function(buffers, center, radius, height, zPos, color) {
    zPos = zPos || 0;
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
      nextZ = zPos - nextSin*height;

      this.cylinder(buffers, center, nextRadius, currRadius, nextHeight, nextZ, color);
    }
  },

  // TODO
  sphere: function(buffers, center, radius, height, zPos, color) {
    zPos = zPos || 0;
    var vertexCount = 0;
    vertexCount += this.circle(buffers, center, radius, zPos, color);
    vertexCount += this.cylinder(buffers, center, radius, radius, height, zPos, color);
    vertexCount += this.circle(buffers, center, radius, zPos+height, color);
    return vertexCount;
  },

  pyramid: function(buffers, polygon, center, height, zPos, color) {
    zPos = zPos || 0;
    polygon = polygon[0];
    for (var i = 0, il = polygon.length-1; i < il; i++) {
      this.triangle(
        buffers,
        [ polygon[i  ][0], polygon[i  ][1], zPos ],
        [ polygon[i+1][0], polygon[i+1][1], zPos ],
        [ center[0], center[1], zPos+height ],
        color
      );
    }
  },

  extrusion: function(buffers, polygon, height, zPos, color, texCoord) {
    zPos = zPos || 0;
    var
      ring, a, b,
      L,
      v0, v1, v2, v3, n,
      tx1, tx2,
      ty1 = texCoord[2]*height, ty2 = texCoord[3]*height,
      i, il,
      r, rl;

    for (i = 0, il = polygon.length; i < il; i++) {
      ring = polygon[i];
        for (r = 0, rl = ring.length-1; r < rl; r++) {
        a = ring[r];
        b = ring[r+1];
        L = vec2.len(vec2.sub(a, b));

        v0 = [ a[0], a[1], zPos];
        v1 = [ b[0], b[1], zPos];
        v2 = [ b[0], b[1], zPos+height];
        v3 = [ a[0], a[1], zPos+height];

        n = vec3.normal(v0, v1, v2);
        [].push.apply(buffers.vertices, [].concat(v0, v2, v1, v0, v3, v2));
        [].push.apply(buffers.normals,  [].concat(n, n, n, n, n, n));
        [].push.apply(buffers.colors,   [].concat(color, color, color, color, color, color));

        tx1 = (texCoord[0]*L) <<0;
        tx2 = (texCoord[1]*L) <<0;

        buffers.texCoords.push(
          tx1, ty2,
          tx2, ty1,
          tx2, ty2,

          tx1, ty2,
          tx1, ty1,
          tx2, ty1
        );
      }
    }
  }//,

  // extrusionXX: function(buffers, a, b, height, zPos, color) {
  //   zPos = zPos || 0;
  //   var v0, v1, v2, v3, n;
  //
  //   v0 = [ a[0], a[1], zPos];
  //   v1 = [ b[0], b[1], zPos];
  //   v2 = [ b[0], b[1], zPos+height+(b[2] || 0)];
  //   v3 = [ a[0], a[1], zPos+height+(a[2] || 0)];
  //
  //   n = vec3.normal(v0, v1, v2);
  //   [].push.apply(buffers.vertices, [].concat(v0, v2, v1, v0, v3, v2));
  //   [].push.apply(buffers.normals,  [].concat(n, n, n, n, n, n));
  //   [].push.apply(buffers.colors,   [].concat(color, color, color, color, color, color));
  //
  //   buffers.texCoords.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  // }

};
