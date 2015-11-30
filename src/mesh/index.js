
var mesh = {};

(function() {

  var LAT_SEGMENTS = 16, LON_SEGMENTS = 24;

  //function isVertical(a, b, c) {
  //  var d1x = a[0]-b[0];
  //  var d1y = a[1]-b[1];
  //  var d1z = a[2]-b[2];
  //
  //  var d2x = b[0]-c[0];
  //  var d2y = b[1]-c[1];
  //  var d2z = b[2]-c[2];
  //
  //  var nx = d1y*d2z - d1z*d2y;
  //  var ny = d1z*d2x - d1x*d2z;
  //  var nz = d1x*d2y - d1y*d2x;
  //
  //  var n = unit(nx, ny, nz);
  //  return Math.round(n[2]*5000) === 0;
  //}

  //*****************************************************************************

  mesh.create = function() {
    return { vertices: [], normals: [] };
  };

  mesh.addQuad = function(tris, a, b, c, d) {
    this.addTriangle(tris, a, b, c);
    this.addTriangle(tris, c, d, a);
  };

  mesh.addTriangle = function(tris, a, b, c) {
    tris.vertices.push(
      a[0], a[1], a[2],
      c[0], c[1], c[2],
      b[0], b[1], b[2]
    );

    var n = normal(
      a[0], a[1], a[2],
      c[0], c[1], c[2],
      b[0], b[1], b[2]
    );

    tris.normals.push(
      n[0], n[1], n[2],
      n[0], n[1], n[2],
      n[0], n[1], n[2]
    );
  };

  mesh.addCircle = function(tris, center, radius, Z) {
    Z = Z || 0;
    var u, v;
    for (var i = 0; i < LON_SEGMENTS; i++) {
      u = i/LON_SEGMENTS;
      v = (i+1)/LON_SEGMENTS;
      this.addTriangle(
        tris,
        [ center[0] + radius * Math.sin(u*Math.PI*2), center[1] + radius * Math.cos(u*Math.PI*2), Z ],
        [ center[0],                                  center[1],                                  Z ],
        [ center[0] + radius * Math.sin(v*Math.PI*2), center[1] + radius * Math.cos(v*Math.PI*2), Z ]
      );
    }
  };

  mesh.addPolygon = function(tris, polygon, Z) {
    Z = Z || 0;
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

    for (i = 0, il = vertices.length-2; i < il; i+=3) {
      this.addTriangle(
        tris,
        [ inVertices[ vertices[i  ]*2 ], inVertices[ vertices[i  ]*2+1 ], Z ],
        [ inVertices[ vertices[i+1]*2 ], inVertices[ vertices[i+1]*2+1 ], Z ],
        [ inVertices[ vertices[i+2]*2 ], inVertices[ vertices[i+2]*2+1 ], Z ]
      );
    }
  };

  //mesh.polygon3d = function(tris, polygon) {
  //  var ring = polygon[0];
  //  var ringLength = ring.length;
  //  var vertices, t, tl;
  //
////  { r:255, g:0, b:0 }
//
  //  if (ringLength <= 4) { // 3: a triangle
  //    this.addTriangle(
  //      tris,
  //      ring[0],
  //      ring[2],
  //      ring[1]
  //    );
  //
  //    if (ringLength === 4) { // 4: a quad (2 triangles)
  //      this.addTriangle(
  //        tris,
  //        ring[0],
  //        ring[3],
  //        ring[2]
  //      );
  //    }
//      return;
  //  }
  //
  //  if (isVertical(ring[0], ring[1], ring[2])) {
  //    for (var i = 0, il = polygon[0].length; i < il; i++) {
  //      polygon[0][i] = [
  //        polygon[0][i][2],
  //        polygon[0][i][1],
  //        polygon[0][i][0]
  //      ];
  //    }
  //
  //    vertices = earcut(polygon);
  //    for (t = 0, tl = vertices.length-2; t < tl; t+=3) {
  //      this.addTriangle(
  //        tris,
  //        [ vertices[t  ][2], vertices[t  ][1], vertices[t  ][0] ],
  //        [ vertices[t+1][2], vertices[t+1][1], vertices[t+1][0] ],
  //        [ vertices[t+2][2], vertices[t+2][1], vertices[t+2][0] ]
  //      );
  //    }
//      return;
  //  }
  //
  //  vertices = earcut(polygon);
  //  for (t = 0, tl = vertices.length-2; t < tl; t+=3) {
  //    this.addTriangle(
  //      tris,
  //      [ vertices[t  ][0], vertices[t  ][1], vertices[t  ][2] ],
  //      [ vertices[t+1][0], vertices[t+1][1], vertices[t+1][2] ],
  //      [ vertices[t+2][0], vertices[t+2][1], vertices[t+2][2] ]
  //    );
  //  }
  //};

  mesh.addCube = function(tris, sizeX, sizeY, sizeZ, X, Y, Z) {
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

    this.addQuad(tris, b, a, d, c);
    this.addQuad(tris, A, B, C, D);
    this.addQuad(tris, a, b, B, A);
    this.addQuad(tris, b, c, C, B);
    this.addQuad(tris, c, d, D, C);
    this.addQuad(tris, d, a, A, D);
  };

  //*****************************************************************************

  mesh.addCylinder = function(tris, center, radius1, radius2, height, Z) {
  Z = Z || 0;
    var
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

      this.addTriangle(
        tris,
      [ center[0] + radius1*currSin, center[1] + radius1*currCos, Z ],
      [ center[0] + radius2*nextSin, center[1] + radius2*nextCos, Z+height ],
      [ center[0] + radius1*nextSin, center[1] + radius1*nextCos, Z ]
      );

    if (radius2 !== 0) {
        this.addTriangle(
          tris,
        [ center[0] + radius2*currSin, center[1] + radius2*currCos, Z+height ],
        [ center[0] + radius2*nextSin, center[1] + radius2*nextCos, Z+height ],
        [ center[0] + radius1*currSin, center[1] + radius1*currCos, Z ]
        );
      }
    }
  };

mesh.addDome = function(tris, center, radius, height, Z) {
  Z = Z || 0;
    var
      currAngle, nextAngle,
      currSin, currCos,
      nextSin, nextCos,
      currRadius, nextRadius,
    nextHeight, nextZ,
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

    nextHeight = (nextSin-currSin)*height;
    nextZ = Z - nextSin*height;

    this.addCylinder(tris, center, nextRadius, currRadius, nextHeight, nextZ);
    }
  };

  mesh.addSphere = function(tris, center, radius, height, Z) {
    Z = Z || 0;
    // TODO
    return this.addCylinder(tris, center, radius, radius, height, Z);
  };

mesh.addPyramid = function(tris, polygon, center, height, Z) {
  Z = Z || 0;
    polygon = polygon[0];
    for (var i = 0, il = polygon.length-1; i < il; i++) {
      this.addTriangle(
        tris,
      [ polygon[i  ][0], polygon[i  ][1], Z ],
      [ polygon[i+1][0], polygon[i+1][1], Z ],
      [ center[0], center[1], Z+height ]
      );
    }
  };

mesh.addExtrusion = function(tris, polygon, height, Z) {
  Z = Z || 0;
  var ring, last, a, b;
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
        this.addQuad(
          tris,
        [ a[0], a[1], Z ],
        [ b[0], b[1], Z ],
        [ b[0], b[1], Z+height ],
        [ a[0], a[1], Z+height ]
        );
      }
    }
  };

}());
