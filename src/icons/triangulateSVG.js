// webpack src/icons/triangulateSVG.js -o lib/triangulateSVG.js --mode development

const parseSVGPath = require('parse-svg-path');
const getPathContours = require('svg-path-contours');

// TODO
// rectangles, circles
// colors from geometry
// scale
// simplify
// ignore fill:none
// <rect x="7.256" y="17.315" fill="none" width="57.489" height="35.508"/>
// <rect x="7.256" y="49.216" fill="#F07D00" width="56.363" height="3.607"/>
// <polygon fill="#003C64" stroke="#003C64" stroke-miterlimit="10" points="18.465,18.011 12.628,29.15 12.628,18.011 7.256,18.011 7.256,42.903 12.628,42.903 12.628,29.867 18.789,42.903 24.84,42.903 17.75,29.365 24.195,18.011"/>
// <circle cx="25" cy="75" r="20" stroke="red" fill="transparent" stroke-width="5"/>
// <ellipse cx="75" cy="75" rx="20" ry="5" stroke="red" fill="transparent" stroke-width="5"/>

function SVGtoPolygons (svg) {
  const res = [];

  let rx = /<path[^/]+d="([^"]+)"/g;
  let match;
  do {
    match = rx.exec(svg);
    if (match) {
      const path = parseSVGPath(match[1]);
      const contours = getPathContours(path);
      res.push(contours);
    }
  } while (match);

  rx = /<polygon[^/]+points="([^"]+)"/g;
  do {
    match = rx.exec(svg);
    if (match) {
      const points = match[1]
        .split(/\s+/g)
        .map(point => {
          const p = point.split(',');
          return [
            parseFloat(p[0]),
            parseFloat(p[1]),
          ];
        });
      res.push([points]);
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

window.triangulateSVG = function (svg) { // window... exposes it in webpack
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
