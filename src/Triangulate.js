
var Triangulate = {

  LAT_SEGMENTS: 32,
  LON_SEGMENTS: 32,

  quad: function(data, a, b, c, d, color) {
    this.addTriangle(data, a, b, c, color);
    this.addTriangle(data, b, d, c, color);
  },

  circle: function(data, center, radius, z, color) {
    var lonSegments = this.LON_SEGMENTS;
    var u, v;
    for (var i = 0; i < lonSegments; i++) {
      u = i/lonSegments;
      v = (i+1)/lonSegments;
      this.addTriangle(
        data,
        [ center[0] + radius * Math.sin(u*Math.PI*2), center[1] + radius * Math.cos(u*Math.PI*2), z ],
        [ center[0],                                  center[1],                                  z ],
        [ center[0] + radius * Math.sin(v*Math.PI*2), center[1] + radius * Math.cos(v*Math.PI*2), z ],
        color
      );
    }
  },

  polygon: function(data, polygon, z, color) {
    var triangles = earcut(polygon);

    for (var t = 0, tl = triangles.length-2; t < tl; t+=3) {
      this.addTriangle(
        data,
        [ triangles[t+0][0], triangles[t+0][1], z ],
        [ triangles[t+1][0], triangles[t+1][1], z ],
        [ triangles[t+2][0], triangles[t+2][1], z ],
        color
      );
    }
  },

  cylinder: function(data, center, radiusBottom, radiusTop, minHeight, height, color) {
    var lonSegments = this.LON_SEGMENTS;

    var u, v;
    var sinPhi1, cosPhi1;
    var sinPhi2, cosPhi2;

    for (var i = 0; i < lonSegments; i++) {
      u = i    /lonSegments;
      v = (i+1)/lonSegments;

      sinPhi1 = Math.sin(u*Math.PI*2);
      cosPhi1 = Math.cos(u*Math.PI*2);

      sinPhi2 = Math.sin(v*Math.PI*2);
      cosPhi2 = Math.cos(v*Math.PI*2);

      this.addTriangle(
        data,
        [ center[0] + radiusBottom*sinPhi1, center[1] + radiusBottom*cosPhi1, minHeight ],
        [ center[0] + radiusTop   *sinPhi2, center[1] + radiusTop   *cosPhi2, height    ],
        [ center[0] + radiusBottom*sinPhi2, center[1] + radiusBottom*cosPhi2, minHeight ],
        color
      );

      if (radiusTop !== 0) {
        this.addTriangle(
          data,
          [ center[0] + radiusTop   *sinPhi1, center[1] + radiusTop   *cosPhi1, height    ],
          [ center[0] + radiusTop   *sinPhi2, center[1] + radiusTop   *cosPhi2, height    ],
          [ center[0] + radiusBottom*sinPhi1, center[1] + radiusBottom*cosPhi1, minHeight ],
          color
        );
      }
    }
  },

  Sphere: function(data, center, radius, minHeight, height, color) {
    var latSegments = this.LAT_SEGMENTS;

    var theta, sinTheta, cosTheta;

    for (var i = 0; i < latSegments; i++) {
      theta = i * Math.PI / latSegments;
      sinTheta = Math.sin(theta);
      cosTheta = Math.cos(theta);
      Triangulate.cylinder(data, center, radiusBottom, radiusTop, minHeight, height, color);
  //  x = cosPhi * sinTheta;
  //  y = cosTheta;
  //  z = sinPhi * sinTheta;
  //  vertexPos.push(x*radius, y*radius, z*radius);
    }
  },

  Dome: function(data, center, radius, minHeight, height, color) {
    var latSegments = this.LAT_SEGMENTS/2;
  },

//Sphere: function(radius) {
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
//},

  extrusion: function(data, polygon, minHeight, height, color) {
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
          data,
          [ a[0], a[1], z0 ],
          [ b[0], b[1], z0 ],
          [ a[0], a[1], z1 ],
          [ b[0], b[1], z1 ],
          color
        );
      }
    }
  },

  addTriangle: function(data, a, b, c, color) {
    data.vertices.push(
      a[0], a[1], a[2],
      b[0], b[1], b[2],
      c[0], c[1], c[2]
    );

    var n = this.computeNormal(
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
  },

  computeNormal: function(ax, ay, az, bx, by, bz, cx, cy, cz) {
    var d1x = ax-bx;
    var d1y = ay-by;
    var d1z = az-bz;

    var d2x = bx-cx;
    var d2y = by-cy;
    var d2z = bz-cz;

    var nx = d1y*d2z - d1z*d2y;
    var ny = d1z*d2x - d1x*d2z;
    var nz = d1x*d2y - d1y*d2x;

    return unit(nx, ny, nz);
  }
};
