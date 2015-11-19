

var Triangulate = {};

(function() {

  var LAT_SEGMENTS = 16, LON_SEGMENTS = 24;

  function isVertical(a, b, c) {
    var d1x = a[0]-b[0];
    var d1y = a[1]-b[1];
    var d1z = a[2]-b[2];

    var d2x = b[0]-c[0];
    var d2y = b[1]-c[1];
    var d2z = b[2]-c[2];

    var nx = d1y*d2z - d1z*d2y;
    var ny = d1z*d2x - d1x*d2z;
    var nz = d1x*d2y - d1y*d2x;

    var n = unit(nx, ny, nz);
    return Math.round(n[2]*5000) === 0;
  }

  Triangulate.quad = function(tris, a, b, c, d) {
    var vertexCount = 0;
    vertexCount += this.addTriangle(tris, a, b, c);
    vertexCount += this.addTriangle(tris, b, d, c);
    return vertexCount;
  };

  Triangulate.circle = function(tris, center, radius, z) {
    var u, v;
    var vertexCount = 0;
    for (var i = 0; i < LON_SEGMENTS; i++) {
      u = i/LON_SEGMENTS;
      v = (i+1)/LON_SEGMENTS;
      vertexCount += this.addTriangle(
        tris,
        [ center[0] + radius * Math.sin(u*Math.PI*2), center[1] + radius * Math.cos(u*Math.PI*2), z ],
        [ center[0],                                  center[1],                                  z ],
        [ center[0] + radius * Math.sin(v*Math.PI*2), center[1] + radius * Math.cos(v*Math.PI*2), z ]
      );
    }
    return vertexCount;
  };

  Triangulate.polygon = function(tris, polygon, z) {
    // flatten data
    var
      inVertices = [], inHoleIndex = [],
      index = 0,
      i, il;
    for (i = 0, il = polygon.length; i < il; i++) {
      for (var j = 0; j < polygon[i].length; j++) {
        inVertices.push(polygon[i][j][0], polygon[i][j][1]);
      }
      if (i) {
        index += polygon[i - 1].length;
        inHoleIndex.push(index);
      }
    }

    var vertices = earcut(inVertices, inHoleIndex, 2);

    var vertexCount = 0;
    for (i = 0, il = vertices.length-2; i < il; i+=3) {
      vertexCount += this.addTriangle(
        tris,
        [ inVertices[ vertices[i  ]*2 ], inVertices[ vertices[i  ]*2+1 ], z ],
        [ inVertices[ vertices[i+1]*2 ], inVertices[ vertices[i+1]*2+1 ], z ],
        [ inVertices[ vertices[i+2]*2 ], inVertices[ vertices[i+2]*2+1 ], z ]
      );
    }
    return vertexCount;
  };

  Triangulate.polygon3d = function(tris, polygon) {
    var ring = polygon[0];
    var ringLength = ring.length;
    var vertices, t, tl;
    var vertexCount = 0;

    if (ringLength <= 4) { // 3: a triangle
      vertexCount += this.addTriangle(
        tris,
        ring[0],
        ring[2],
        ring[1]
      );

      if (ringLength === 4) { // 4: a quad (2 triangles)
        vertexCount += this.addTriangle(
          tris,
          ring[0],
          ring[3],
          ring[2]
        );
      }
      return vertexCount;
    }

    if (isVertical(ring[0], ring[1], ring[2])) {
      for (var i = 0, il = polygon[0].length; i < il; i++) {
        polygon[0][i] = [
          polygon[0][i][2],
          polygon[0][i][1],
          polygon[0][i][0]
        ];
      }

      vertices = earcut(polygon);
      for (t = 0, tl = vertices.length-2; t < tl; t+=3) {
        vertexCount += this.addTriangle(
          tris,
          [ vertices[t  ][2], vertices[t  ][1], vertices[t  ][0] ],
          [ vertices[t+1][2], vertices[t+1][1], vertices[t+1][0] ],
          [ vertices[t+2][2], vertices[t+2][1], vertices[t+2][0] ]
        );
      }

      return vertexCount;
    }

    vertices = earcut(polygon);
    for (t = 0, tl = vertices.length-2; t < tl; t+=3) {
      vertexCount += this.addTriangle(
        tris,
        [ vertices[t  ][0], vertices[t  ][1], vertices[t  ][2] ],
        [ vertices[t+1][0], vertices[t+1][1], vertices[t+1][2] ],
        [ vertices[t+2][0], vertices[t+2][1], vertices[t+2][2] ]
      );
    }

    return vertexCount;
  };

  Triangulate.cylinder = function(tris, center, radiusBottom, radiusTop, minHeight, height) {
    var
      vertexCount = 0,
      currAngle, nextAngle,
      currSin, currCos,
      nextSin, nextCos,
      num = LON_SEGMENTS,
      doublePI = Math.PI*2;

    for (var i = 0; i < num; i++) {
      currAngle = ( i   /num) * doublePI;
      nextAngle = ((i+1)/num) * doublePI;

      currSin = Math.sin(currAngle);
      currCos = Math.cos(currAngle);

      nextSin = Math.sin(nextAngle);
      nextCos = Math.cos(nextAngle);

      vertexCount += this.addTriangle(
        tris,
        [ center[0] + radiusBottom*currSin, center[1] + radiusBottom*currCos, minHeight ],
        [ center[0] + radiusTop   *nextSin, center[1] + radiusTop   *nextCos, height    ],
        [ center[0] + radiusBottom*nextSin, center[1] + radiusBottom*nextCos, minHeight ]
      );

      if (radiusTop !== 0) {
        vertexCount += this.addTriangle(
          tris,
          [ center[0] + radiusTop   *currSin, center[1] + radiusTop   *currCos, height    ],
          [ center[0] + radiusTop   *nextSin, center[1] + radiusTop   *nextCos, height    ],
          [ center[0] + radiusBottom*currSin, center[1] + radiusBottom*currCos, minHeight ]
        );
      }
    }

    return vertexCount;
  };

  Triangulate.dome = function(tris, center, radius, minHeight, height) {
    var
      vertexCount = 0,
      currAngle, nextAngle,
      currSin, currCos,
      nextSin, nextCos,
      currRadius, nextRadius,
      currY, nextY,
      h = (height-minHeight),
      num = LAT_SEGMENTS/2,
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

      currY = minHeight - currSin*h;
      nextY = minHeight - nextSin*h;

      vertexCount += this.cylinder(tris, center, nextRadius, currRadius, nextY, currY);
    }

    return vertexCount;
  };

  Triangulate.pyramid = function(tris, polygon, center, minHeight, height) {
    polygon = polygon[0];
    var vertexCount = 0;
    for (var i = 0, il = polygon.length-1; i < il; i++) {
      vertexCount += this.addTriangle(
        tris,
        [ polygon[i  ][0], polygon[i  ][1], minHeight ],
        [ polygon[i+1][0], polygon[i+1][1], minHeight ],
        [ center[0], center[1], height ]
      );
    }
    return vertexCount;
  };

  Triangulate.extrusion = function(tris, polygon, minHeight, height) {
    var
      vertexCount = 0,
      ring, last,
      a, b, z0, z1;

    for (var c = 0, pl = polygon.length; c < pl; c++) {
      ring = polygon[c];
      last = ring.length-1;

      if (ring[0][0] !== ring[last][0] || ring[0][1] !== ring[last][1]) {
        ring.push(ring[0]);
        last++;
      }

      for (var r = 0; r < last; r++) {
        a = ring[r];
        b = ring[r+1];
        z0 = minHeight;
        z1 = height;
        vertexCount += this.quad(
          tris,
          [ a[0], a[1], z0 ],
          [ b[0], b[1], z0 ],
          [ a[0], a[1], z1 ],
          [ b[0], b[1], z1 ]
        );
      }
    }
    return vertexCount;
  };

  Triangulate.addTriangle = function(tris, a, b, c) {
    tris.vertices.push(
      a[0], a[1], a[2],
      c[0], c[1], c[2],
      b[0], b[1], b[2]
    );

    var n = normal(
      a[0], a[1], a[2],
      b[0], b[1], b[2],
      c[0], c[1], c[2]
    );

    tris.normals.push(
      n[0], n[1], n[2],
      n[0], n[1], n[2],
      n[0], n[1], n[2]
    );

    return 3;
  };

}());
