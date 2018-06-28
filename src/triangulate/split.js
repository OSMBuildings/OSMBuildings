
const split = {

  NUM_Y_SEGMENTS: 24,
  NUM_X_SEGMENTS: 32,

  // isVertical = (a, b, c) => {
  //  return Math.abs(normal(a, b, c)[2]) < 1/5000;
  //}

  quad: (buffers, a, b, c, d, color) => {
    split.triangle(buffers, a, b, c, color);
    split.triangle(buffers, c, d, a, color);
  },

  triangle: (buffers, a, b, c, color) => {
    const n = vec3.normal(a, b, c);
    buffers.vertices.push(...a, ...c, ...b);
    buffers.normals.push(...n, ...n, ...n);
    buffers.colors.push(...color, ...color, ...color);
    buffers.texCoords.push(0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
  },

  circle: (buffers, center, radius, zPos, color) => {
    zPos = zPos || 0;
    let u, v;
    for (let i = 0; i < split.NUM_X_SEGMENTS; i++) {
      u = i/split.NUM_X_SEGMENTS;
      v = (i+1)/split.NUM_X_SEGMENTS;
      split.triangle(
        buffers,
        [ center[0] + radius * Math.sin(u*Math.PI*2), center[1] + radius * Math.cos(u*Math.PI*2), zPos ],
        [ center[0],                                  center[1],                                  zPos ],
        [ center[0] + radius * Math.sin(v*Math.PI*2), center[1] + radius * Math.cos(v*Math.PI*2), zPos ],
        color
      );
    }
  },

  polygon: (buffers, rings, zPos, color) => {
    zPos = zPos || 0;

    const
      vertexBuffer = [],
      ringIndex = [];

    let index = 0;
    rings.forEach((ring, i) => {
      ring.forEach(point => {
        vertexBuffer.push(point[0], point[1], zPos + (point[2] || 0));
      });
      if (i) {
        index += rings[i-1].length;
        ringIndex.push(index);
      }
    });

    const vertices = earcut(vertexBuffer, ringIndex, 3);

    for (let i = 0; i < vertices.length-2; i+=3) {
      const v1 = vertices[i  ]*3;
      const v2 = vertices[i+1]*3;
      const v3 = vertices[i+2]*3;
      split.triangle(
        buffers,
        [ vertexBuffer[v1], vertexBuffer[v1+1], vertexBuffer[v1+2] ],
        [ vertexBuffer[v2], vertexBuffer[v2+1], vertexBuffer[v2+2] ],
        [ vertexBuffer[v3], vertexBuffer[v3+1], vertexBuffer[v3+2] ],
        color
      );
    }
  },

  //polygon3d: (buffers, rings, color) => {
  //  const ring = rings[0];
  //  const ringLength = ring.length;
  //  const vertices, t, tl;
  //
////  { r:255, g:0, b:0 }
//
  //  if (ringLength <= 4) { // 3: a triangle
  //    split.triangle(
  //      buffers,
  //      ring[0],
  //      ring[2],
  //      ring[1], color
  //    );
  //
  //    if (ringLength === 4) { // 4: a quad (2 triangles)
  //      split.triangle(
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
  //    for (let i = 0, il = rings[0].length; i < il; i++) {
  //      rings[0][i] = [
  //        rings[0][i][2],
  //        rings[0][i][1],
  //        rings[0][i][0]
  //      ];
  //    }
  //
  //    vertices = earcut(rings);
  //    for (t = 0, tl = vertices.length-2; t < tl; t+=3) {
  //      split.triangle(
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
  //    split.triangle(
  //      buffers,
  //      [ vertices[t  ][0], vertices[t  ][1], vertices[t  ][2] ],
  //      [ vertices[t+1][0], vertices[t+1][1], vertices[t+1][2] ],
  //      [ vertices[t+2][0], vertices[t+2][1], vertices[t+2][2] ], color
  //    );
  //  }
  //},

  cube: (buffers, sizeX, sizeY, sizeZ, X, Y, zPos, color) => {
    X = X || 0;
    Y = Y || 0;
    zPos = zPos || 0;

    const
      a = [X,       Y,       zPos],
      b = [X+sizeX, Y,       zPos],
      c = [X+sizeX, Y+sizeY, zPos],
      d = [X,       Y+sizeY, zPos],
      A = [X,       Y,       zPos+sizeZ],
      B = [X+sizeX, Y,       zPos+sizeZ],
      C = [X+sizeX, Y+sizeY, zPos+sizeZ],
      D = [X,       Y+sizeY, zPos+sizeZ];

    split.quad(buffers, b, a, d, c, color);
    split.quad(buffers, A, B, C, D, color);
    split.quad(buffers, a, b, B, A, color);
    split.quad(buffers, b, c, C, B, color);
    split.quad(buffers, c, d, D, C, color);
    split.quad(buffers, d, a, A, D, color);
  },

  cylinder: (buffers, center, radius1, radius2, height, zPos, color) => {
    zPos = zPos || 0;

    const
      num = split.NUM_X_SEGMENTS,
      doublePI = Math.PI*2;

    let
      currAngle, nextAngle,
      currSin, currCos,
      nextSin, nextCos;

    for (let i = 0; i < num; i++) {
      currAngle = ( i   /num) * doublePI;
      nextAngle = ((i+1)/num) * doublePI;

      currSin = Math.sin(currAngle);
      currCos = Math.cos(currAngle);

      nextSin = Math.sin(nextAngle);
      nextCos = Math.cos(nextAngle);

      split.triangle(
        buffers,
        [ center[0] + radius1*currSin, center[1] + radius1*currCos, zPos ],
        [ center[0] + radius2*nextSin, center[1] + radius2*nextCos, zPos+height ],
        [ center[0] + radius1*nextSin, center[1] + radius1*nextCos, zPos ],
        color
      );

      if (radius2 !== 0) {
        split.triangle(
          buffers,
          [ center[0] + radius2*currSin, center[1] + radius2*currCos, zPos+height ],
          [ center[0] + radius2*nextSin, center[1] + radius2*nextCos, zPos+height ],
          [ center[0] + radius1*currSin, center[1] + radius1*currCos, zPos ],
          color
        );
      }
    }
  },

  dome: (buffers, center, radius, height, zPos, color, flip) => {
    zPos = zPos || 0;

    const
      yNum = split.NUM_Y_SEGMENTS/2,
      quarterCircle = Math.PI/2,
      circleOffset = flip ? 0 : -quarterCircle;

    let
      currYAngle, nextYAngle,
      x1, y1,
      x2, y2,
      radius1, radius2,
      newHeight, newZPos;

    // goes top-down
    for (let i = 0; i < yNum; i++) {
      currYAngle = ( i/yNum)*quarterCircle + circleOffset;
      nextYAngle = ((i + 1)/yNum)*quarterCircle + circleOffset;

      x1 = Math.cos(currYAngle);
      y1 = Math.sin(currYAngle);

      x2 = Math.cos(nextYAngle);
      y2 = Math.sin(nextYAngle);

      radius1 = x1*radius;
      radius2 = x2*radius;

      newHeight = (y2-y1)*height;
      newZPos = zPos - y2*height;

      split.cylinder(buffers, center, radius2, radius1, newHeight, newZPos, color);
    }
  },

  sphere: (buffers, center, radius, height, zPos, color) => {
    zPos = zPos || 0;
    let vertexCount = 0;
    vertexCount += split.dome(buffers, center, radius, height/2, zPos+height/2, color, true);
    vertexCount += split.dome(buffers, center, radius, height/2, zPos+height/2, color);
    return vertexCount;
  },

  pyramid: (buffers, polygon, center, height, zPos, color) => {
    zPos = zPos || 0;
    polygon = polygon[0];
    for (let i = 0, il = polygon.length-1; i < il; i++) {
      split.triangle(
        buffers,
        [ polygon[i  ][0], polygon[i  ][1], zPos ],
        [ polygon[i+1][0], polygon[i+1][1], zPos ],
        [ center[0], center[1], zPos+height ],
        color
      );
    }
  },

  extrusion: (buffers, polygon, height, zPos, color, texCoord) => {
    zPos = zPos || 0;
    let
      a, b,
      L,
      v0, v1, v2, v3, n,
      tx1, tx2,
      ty1 = texCoord[2]*height, ty2 = texCoord[3]*height,
      r, rl;

    polygon.forEach(ring => {
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
    });
  }
};
