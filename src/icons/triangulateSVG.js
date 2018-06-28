const parseSVGPath = require('parse-svg-path');
const getPathContours = require('svg-path-contours');

function TriangulateSVG (svg) {
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

window.triangulateSVG = function (svg) {
  const
    rings = TriangulateSVG(svg),
    vertices = [],
    ringIndex = [];

  let r = 0;
  rings.forEach((ring, i) => {
    ring.forEach(point => {
      vertices.push(...point);
    });
    if (i) {
      r += rings[i-1].length;
      ringIndex.push(r);
    }
  });

  const triangles = earcut(vertices, ringIndex);

  const res = [];
  for (let t = 0; t < triangles.length-2; t+=3) {
    const i1 = triangles[t  ]*3;
    const i2 = triangles[t+1]*3;
    const i3 = triangles[t+2]*3;

    const a = [ vertices[i1], vertices[i1+1] ];
    const b = [ vertices[i2], vertices[i2+1] ];
    const c = [ vertices[i3], vertices[i3+1] ];

    res.push([a, b, c]);
  }

  return res;
};

// webpack src/icons/triangulateSVG.js -o lib/triangulateSVG.js --mode production
