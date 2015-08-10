

var Triangulate = {};

(function() {

  var LAT_SEGMENTS = 32, LON_SEGMENTS = 32;

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
    Triangulate.addTriangle(tris, a, b, c);
    Triangulate.addTriangle(tris, b, d, c);
  };

  Triangulate.circle = function(tris, center, radius, z) {
    var u, v;
    for (var i = 0; i < LON_SEGMENTS; i++) {
      u = i/LON_SEGMENTS;
      v = (i+1)/LON_SEGMENTS;
      Triangulate.addTriangle(
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
      Triangulate.addTriangle(
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
      Triangulate.addTriangle(
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
        Triangulate.addTriangle(
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
      Triangulate.addTriangle(
        tris,
        [ triangles[t  ][0], triangles[t  ][1], triangles[t  ][2] ],
        [ triangles[t+1][0], triangles[t+1][1], triangles[t+1][2] ],
        [ triangles[t+2][0], triangles[t+2][1], triangles[t+2][2] ]
      );
    }
  };

  Triangulate.cylinder = function(tris, center, radiusBottom, radiusTop, minHeight, height) {
    var u, v;
    var sinPhi1, cosPhi1;
    var sinPhi2, cosPhi2;

    for (var i = 0; i < LON_SEGMENTS; i++) {
      u = i    /LON_SEGMENTS;
      v = (i+1)/LON_SEGMENTS;

      sinPhi1 = Math.sin(u*Math.PI*2);
      cosPhi1 = Math.cos(u*Math.PI*2);

      sinPhi2 = Math.sin(v*Math.PI*2);
      cosPhi2 = Math.cos(v*Math.PI*2);

      Triangulate.addTriangle(
        tris,
        [ center[0] + radiusBottom*sinPhi1, center[1] + radiusBottom*cosPhi1, minHeight ],
        [ center[0] + radiusTop   *sinPhi2, center[1] + radiusTop   *cosPhi2, height    ],
        [ center[0] + radiusBottom*sinPhi2, center[1] + radiusBottom*cosPhi2, minHeight ]
      );

      if (radiusTop !== 0) {
        Triangulate.addTriangle(
          tris,
          [ center[0] + radiusTop   *sinPhi1, center[1] + radiusTop   *cosPhi1, height    ],
          [ center[0] + radiusTop   *sinPhi2, center[1] + radiusTop   *cosPhi2, height    ],
          [ center[0] + radiusBottom*sinPhi1, center[1] + radiusBottom*cosPhi1, minHeight ]
        );
      }
    }
  };

  Triangulate.pyramid = function(tris, polygon, center, minHeight, height) {
    polygon = polygon[0];
    for (var i = 0, il = polygon.length-1; i < il; i++) {
      Triangulate.addTriangle(
        tris,
        [ polygon[i  ][0], polygon[i  ][1], minHeight ],
        [ polygon[i+1][0], polygon[i+1][1], minHeight ],
        [ center[0], center[1], height ]
      );
    }
  };

  Triangulate.dome = function(tris, center, radius, minHeight, height) {
    var
      sin = Math.sin,
      cos = Math.cos,
      PI = Math.PI,
res = { vertices: [], texCoords: [] },
      azimuth1, x1, y1,
      azimuth2, x2, y2,
      polar1,
      polar2,
      A, B, C, D,
      tcLeft,
      tcRight,
      tcTop,
      tcBottom,
      tcs;

    for (var i = 0, j; i < LON_SEGMENTS; i++) {
      tcLeft = i/LON_SEGMENTS;
      azimuth1 = tcLeft*2*PI; // convert to radiants [0...2*PI]
      x1 = cos(azimuth1)*radius;
      y1 = sin(azimuth1)*radius;

      tcRight = (i+1)/LON_SEGMENTS;
      azimuth2 = tcRight*2*PI;
      x2 = cos(azimuth2)*radius;
      y2 = sin(azimuth2)*radius;

      for (j = 0; j < LAT_SEGMENTS; j++) {
        polar1 = j*PI/(LAT_SEGMENTS*2); //convert to radiants in [0..1/2*PI]
        polar2 = (j+1)*PI/(LAT_SEGMENTS*2);

        A = [x1*cos(polar1), y1*cos(polar1), radius*sin(polar1)];
        B = [x2*cos(polar1), y2*cos(polar1), radius*sin(polar1)];
        C = [x2*cos(polar2), y2*cos(polar2), radius*sin(polar2)];
        D = [x1*cos(polar2), y1*cos(polar2), radius*sin(polar2)];

        res.vertices.push.apply(res.vertices, A);
        res.vertices.push.apply(res.vertices, B);
        res.vertices.push.apply(res.vertices, C);
        res.vertices.push.apply(res.vertices, A);
        res.vertices.push.apply(res.vertices, C);
        res.vertices.push.apply(res.vertices, D);

        tcTop    = 1 - (j+1)/LAT_SEGMENTS;
        tcBottom = 1 - j/LAT_SEGMENTS;

        res.texCoords.push(tcLeft, tcBottom, tcRight, tcBottom, tcRight, tcTop, tcLeft, tcBottom, tcRight, tcTop, tcLeft, tcTop);
      }
    }

    return res;
  };

  Triangulate.sphere = function(tris, center, radius, minHeight, height) {
    var theta, sinTheta, cosTheta;

    for (var i = 0; i < latSegments; i++) {
      theta = i * Math.PI / LAT_SEGMENTS;
      sinTheta = Math.sin(theta);
      cosTheta = Math.cos(theta);
      Triangulate.cylinder(tris, center, radiusBottom, radiusTop, minHeight, height);
  //  x = cosPhi * sinTheta;
  //  y = cosTheta;
  //  z = sinPhi * sinTheta;
  //  vertexPos.push(x*radius, y*radius, z*radius);
    }
  };

//Triangulate._sphere = function(radius) {
//  var lat = 0, lon = 0;
//  var maxLat = 10, maxLon = 10;
//
//  var vertexPos = [];
//  var indexData = [];
//
//  var theta, sinTheta, cosTheta;
//  var phi, sinPhi, cosPhi;
//  var x, y, z;
//
//  for (lat = 0; lat < maxLat; lat++) {
//    theta = lat * Math.PI / maxLat;
//    sinTheta = Math.sin(theta);
//    cosTheta = Math.cos(theta);
//
//    for (lon = 0; lon <= maxLon; lon++) {
//      phi = lon * 2 * Math.PI / maxLon;
//      sinPhi = Math.sin(phi);
//      cosPhi = Math.cos(phi);
//
//      x = cosPhi * sinTheta;
//      y = cosTheta;
//      z = sinPhi * sinTheta;
//
//      vertexPos.push(radius * x, radius * y, radius * z);
//
//      var first = (lat * (maxLon + 1)) + lon;
//      var second = first + maxLon + 1;
//
//      indexData.push(first);
//      indexData.push(second);
//      indexData.push(first + 1);
//
//      indexData.push(second);
//      indexData.push(second + 1);
//      indexData.push(first + 1);
//    }
//  }
//};

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
        Triangulate.quad(
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
      b[0], b[1], b[2],
      c[0], c[1], c[2]
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
