

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




  Triangulate.quad = function(data, a, b, c, d, color) {
    Triangulate.addTriangle(data, a, b, c, color);
    Triangulate.addTriangle(data, b, d, c, color);
  };

  Triangulate.circle = function(data, center, radius, z, color) {
    var u, v;
    for (var i = 0; i < LON_SEGMENTS; i++) {
      u = i/LON_SEGMENTS;
      v = (i+1)/LON_SEGMENTS;
      Triangulate.addTriangle(
        data,
        [ center[0] + radius * Math.sin(u*Math.PI*2), center[1] + radius * Math.cos(u*Math.PI*2), z ],
        [ center[0],                                  center[1],                                  z ],
        [ center[0] + radius * Math.sin(v*Math.PI*2), center[1] + radius * Math.cos(v*Math.PI*2), z ],
        color
      );
    }
  };

  Triangulate.polygon = function(data, polygon, z, color) {
    var triangles = earcut(polygon);
    for (var t = 0, tl = triangles.length-2; t < tl; t+=3) {
      Triangulate.addTriangle(
        data,
        [ triangles[t  ][0], triangles[t  ][1], z ],
        [ triangles[t+1][0], triangles[t+1][1], z ],
        [ triangles[t+2][0], triangles[t+2][1], z ],
        color
      );
    }
  };

  Triangulate.polygon3d = function(data, polygon, color) {
    var ring = polygon[0];
    var ringLength = ring.length;
    var triangles, t, tl;

//  { r:255, g:0, b:0 }

    if (ringLength <= 4) { // 3: a triangle
      Triangulate.addTriangle(
        data,
        ring[0],
        ring[2],
        ring[1],
        color
      );

      if (ringLength === 4) { // 4: a quad (2 triangles)
        this.addTriangle(
          data,
          ring[0],
          ring[3],
          ring[2],
          color
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
          data,
          [ triangles[t  ][2], triangles[t  ][1], triangles[t  ][0] ],
          [ triangles[t+1][2], triangles[t+1][1], triangles[t+1][0] ],
          [ triangles[t+2][2], triangles[t+2][1], triangles[t+2][0] ],
          color
        );
      }

      return;
    }

    triangles = earcut(polygon);
    for (t = 0, tl = triangles.length-2; t < tl; t+=3) {
      Triangulate.addTriangle(
        data,
        [ triangles[t  ][0], triangles[t  ][1], triangles[t  ][2] ],
        [ triangles[t+1][0], triangles[t+1][1], triangles[t+1][2] ],
        [ triangles[t+2][0], triangles[t+2][1], triangles[t+2][2] ],
        color
      );
    }
  };

  Triangulate.cylinder = function(data, center, radiusBottom, radiusTop, minHeight, height, color) {
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
        data,
        [ center[0] + radiusBottom*sinPhi1, center[1] + radiusBottom*cosPhi1, minHeight ],
        [ center[0] + radiusTop   *sinPhi2, center[1] + radiusTop   *cosPhi2, height    ],
        [ center[0] + radiusBottom*sinPhi2, center[1] + radiusBottom*cosPhi2, minHeight ],
        color
      );

      if (radiusTop !== 0) {
        Triangulate.addTriangle(
          data,
          [ center[0] + radiusTop   *sinPhi1, center[1] + radiusTop   *cosPhi1, height    ],
          [ center[0] + radiusTop   *sinPhi2, center[1] + radiusTop   *cosPhi2, height    ],
          [ center[0] + radiusBottom*sinPhi1, center[1] + radiusBottom*cosPhi1, minHeight ],
          color
        );
      }
    }
  };

  Triangulate.pyramid = function(data, polygon, center, minHeight, height, color) {
    polygon = polygon[0];
    for (var i = 0, il = polygon.length-1; i < il; i++) {
      Triangulate.addTriangle(
        data,
        [ polygon[i  ][0], polygon[i  ][1], minHeight ],
        [ polygon[i+1][0], polygon[i+1][1], minHeight ],
        [ center[0], center[1], height ],
        color
      );
    }
  };

  Triangulate.dome = function(data, center, radius, minHeight, height, color) {
  };

  Triangulate.sphere = function(data, center, radius, minHeight, height, color) {
    var theta, sinTheta, cosTheta;

    for (var i = 0; i < latSegments; i++) {
      theta = i * Math.PI / LAT_SEGMENTS;
      sinTheta = Math.sin(theta);
      cosTheta = Math.cos(theta);
      Triangulate.cylinder(data, center, radiusBottom, radiusTop, minHeight, height, color);
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

  Triangulate.extrusion = function(data, polygon, minHeight, height, color) {
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
          data,
          [ a[0], a[1], z0 ],
          [ b[0], b[1], z0 ],
          [ a[0], a[1], z1 ],
          [ b[0], b[1], z1 ],
          color
        );
      }
    }
  };

  Triangulate.addTriangle = function(data, a, b, c, color) {
    data.vertices.push(
      a[0], a[1], a[2],
      c[0], c[1], c[2],
      b[0], b[1], b[2]
    );

    var n = normal(
      a[0], a[1], a[2],
      b[0], b[1], b[2],
      c[0], c[1], c[2]
    );

    data.normals.push(
      n[0], n[1], n[2],
      n[0], n[1], n[2],
      n[0], n[1], n[2]
    );

    data.colors.push(
      color.r, color.g, color.b,
      color.r, color.g, color.b,
      color.r, color.g, color.b
    );
  };

}());
