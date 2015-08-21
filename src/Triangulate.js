

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
    this.addTriangle(tris, a, b, c);
    this.addTriangle(tris, b, d, c);
  };

  Triangulate.circle = function(tris, center, radius, z) {
    var u, v;
    for (var i = 0; i < LON_SEGMENTS; i++) {
      u = i/LON_SEGMENTS;
      v = (i+1)/LON_SEGMENTS;
      this.addTriangle(
        tris,
        [ center[0] + radius * Math.sin(u*Math.PI*2), center[1] + radius * Math.cos(u*Math.PI*2), z ],
        [ center[0],                                  center[1],                                  z ],
        [ center[0] + radius * Math.sin(v*Math.PI*2), center[1] + radius * Math.cos(v*Math.PI*2), z ]
      );
    }
  };

  Triangulate.polygon = function(tris, polygon, z) {
    var triangles = earcut(polygon);
    for (var t = 0, tl = triangles.length-2; t < tl; t+=3) {
      this.addTriangle(
        tris,
        [ triangles[t  ][0], triangles[t  ][1], z ],
        [ triangles[t+1][0], triangles[t+1][1], z ],
        [ triangles[t+2][0], triangles[t+2][1], z ]
      );
    }
  };

  Triangulate.polygon3d = function(tris, polygon) {
    var ring = polygon[0];
    var ringLength = ring.length;
    var triangles, t, tl;

//  { r:255, g:0, b:0 }

    if (ringLength <= 4) { // 3: a triangle
      this.addTriangle(
        tris,
        ring[0],
        ring[2],
        ring[1]
      );

      if (ringLength === 4) { // 4: a quad (2 triangles)
        this.addTriangle(
          tris,
          ring[0],
          ring[3],
          ring[2]
        );
      }
      return;
    }

    if (isVertical(ring[0], ring[1], ring[2])) {
      for (var i = 0, il = polygon[0].length; i < il; i++) {
        polygon[0][i] = [
          polygon[0][i][2],
          polygon[0][i][1],
          polygon[0][i][0]
        ];
      }

      triangles = earcut(polygon);
      for (t = 0, tl = triangles.length-2; t < tl; t+=3) {
        this.addTriangle(
          tris,
          [ triangles[t  ][2], triangles[t  ][1], triangles[t  ][0] ],
          [ triangles[t+1][2], triangles[t+1][1], triangles[t+1][0] ],
          [ triangles[t+2][2], triangles[t+2][1], triangles[t+2][0] ]
        );
      }

      return;
    }

    triangles = earcut(polygon);
    for (t = 0, tl = triangles.length-2; t < tl; t+=3) {
      this.addTriangle(
        tris,
        [ triangles[t  ][0], triangles[t  ][1], triangles[t  ][2] ],
        [ triangles[t+1][0], triangles[t+1][1], triangles[t+1][2] ],
        [ triangles[t+2][0], triangles[t+2][1], triangles[t+2][2] ]
      );
    }
  };

  Triangulate.cylinder = function(tris, center, radiusBottom, radiusTop, minHeight, height) {
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
        [ center[0] + radiusBottom*currSin, center[1] + radiusBottom*currCos, minHeight ],
        [ center[0] + radiusTop   *nextSin, center[1] + radiusTop   *nextCos, height    ],
        [ center[0] + radiusBottom*nextSin, center[1] + radiusBottom*nextCos, minHeight ]
      );

      if (radiusTop !== 0) {
        this.addTriangle(
          tris,
          [ center[0] + radiusTop   *currSin, center[1] + radiusTop   *currCos, height    ],
          [ center[0] + radiusTop   *nextSin, center[1] + radiusTop   *nextCos, height    ],
          [ center[0] + radiusBottom*currSin, center[1] + radiusBottom*currCos, minHeight ]
        );
      }
    }
  };

  Triangulate.dome = function(tris, center, radius, minHeight, height) {
    var
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

      this.cylinder(tris, center, nextRadius, currRadius, nextY, currY);
    }
  };

  Triangulate.pyramid = function(tris, polygon, center, minHeight, height) {
    polygon = polygon[0];
    for (var i = 0, il = polygon.length-1; i < il; i++) {
      this.addTriangle(
        tris,
        [ polygon[i  ][0], polygon[i  ][1], minHeight ],
        [ polygon[i+1][0], polygon[i+1][1], minHeight ],
        [ center[0], center[1], height ]
      );
    }
  };

  Triangulate.extrusion = function(tris, polygon, minHeight, height) {
    var
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
        this.quad(
          tris,
          [ a[0], a[1], z0 ],
          [ b[0], b[1], z0 ],
          [ a[0], a[1], z1 ],
          [ b[0], b[1], z1 ]
        );
      }
    }
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
  };

}());
