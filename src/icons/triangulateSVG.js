// webpack src/icons/triangulateSVG.js -o lib/triangulateSVG.js --mode development

const parseSVGPath = require('parse-svg-path');
const getPathContours = require('svg-path-contours');

function SVGtoPolygons (svg) {
  const rx = /<path\s+d="([^"]+)"/mg;

  const res = [];
  let match;
  do {
    match = rx.exec(svg);
    if (match) {
      const path = parseSVGPath(match[1]);
      const contours = getPathContours(path);
      res.push(contours);
    }
  } while (match);

  return res;
}

function getOffsetAndScale (polygons) {
  let
    minX = Infinity, maxX = -Infinity,
    minY = Infinity, maxY = -Infinity;

  polygons.forEach(poly => {
    poly.forEach(ring => {
      ring.forEach(point => {
        minX = Math.min(minX, point[0]);
        maxX = Math.max(maxX, point[0]);
        minY = Math.min(minY, point[1]);
        maxY = Math.max(maxY, point[1]);
      });
    });
  });

  return { offset: [minX, minY], scale: Math.max(maxX-minX, maxY-minY) };
}

window.triangulateSVG = function (svg) {
  const polygons = SVGtoPolygons(svg);

  const { offset, scale } = getOffsetAndScale(polygons);

  const res = [];

  polygons.forEach(poly => {
    const
      vertices = [],
      ringIndex = [];

    let r = 0;
    poly.forEach((ring, i) => {
      ring.forEach(point => {
        vertices.push(...point);
      });

      if (i) {
        r += poly[i - 1].length;
        ringIndex.push(r);
      }
    });

    const triangles = earcut(vertices, ringIndex);
    for (let t = 0; t < triangles.length-2; t+=3) {
      const i1 = triangles[t  ];
      const i2 = triangles[t+1];
      const i3 = triangles[t+2];

      const a = [ (vertices[i1*2]-offset[0])/scale, (vertices[i1*2+1]-offset[1])/scale ];
      const b = [ (vertices[i2*2]-offset[0])/scale, (vertices[i2*2+1]-offset[1])/scale ];
      const c = [ (vertices[i3*2]-offset[0])/scale, (vertices[i3*2+1]-offset[1])/scale ];

      res.push([a, b, c]);
    }
  });

  return res;
};
