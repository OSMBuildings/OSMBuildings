var OSMBuildings = (function(window) {


var earcut = (function() {

'use strict'

function earcut(points, returnIndices) {

    var outerNode = filterPoints(linkedList(points[0], true)),
        triangles = returnIndices ? {vertices: [], indices: []} : [];

    if (!outerNode) return triangles;

    var node, minX, minY, maxX, maxY, x, y, size, i,
        threshold = 80;

    for (i = 0; threshold >= 0 && i < points.length; i++) threshold -= points[i].length;

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (threshold < 0) {
        node = outerNode.next;
        minX = maxX = node.p[0];
        minY = maxY = node.p[1];
        do {
            x = node.p[0];
            y = node.p[1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            node = node.next;
        } while (node !== outerNode);

        // minX, minY and size are later used to transform coords into integers for z-order calculation
        size = Math.max(maxX - minX, maxY - minY);
    }

    if (points.length > 1) outerNode = eliminateHoles(points, outerNode);

    earcutLinked(outerNode, triangles, minX, minY, size);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(points, clockwise) {
    var sum = 0,
        len = points.length,
        i, j, p1, p2, last;

    // calculate original winding order of a polygon ring
    for (i = 0, j = len - 1; i < len; j = i++) {
        p1 = points[i];
        p2 = points[j];
        sum += (p2[0] - p1[0]) * (p1[1] + p2[1]);
    }

    // link points into circular doubly-linked list in the specified winding order
    if (clockwise === (sum > 0)) {
        for (i = 0; i < len; i++) last = insertNode(points[i], last);
    } else {
        for (i = len - 1; i >= 0; i--) last = insertNode(points[i], last);
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(start, end) {
    if (!end) end = start;

    var node = start,
        again;
    do {
        again = false;

        if (equals(node.p, node.next.p) || orient(node.prev.p, node.p, node.next.p) === 0) {

            // remove node
            node.prev.next = node.next;
            node.next.prev = node.prev;

            if (node.prevZ) node.prevZ.nextZ = node.nextZ;
            if (node.nextZ) node.nextZ.prevZ = node.prevZ;

            node = end = node.prev;

            if (node === node.next) return null;
            again = true;

        } else {
            node = node.next;
        }
    } while (again || node !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(ear, triangles, minX, minY, size, pass) {
    if (!ear) return;

    var indexed = triangles.vertices !== undefined;

    // interlink polygon nodes in z-order
    if (!pass && minX !== undefined) indexCurve(ear, minX, minY, size);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (isEar(ear, minX, minY, size)) {
            // cut off the triangle
            if (indexed) {
                addIndexedVertex(triangles, prev);
                addIndexedVertex(triangles, ear);
                addIndexedVertex(triangles, next);
            } else {
                triangles.push(prev.p);
                triangles.push(ear.p);
                triangles.push(next.p);
            }

            // remove ear node
            next.prev = prev;
            prev.next = next;

            if (ear.prevZ) ear.prevZ.nextZ = ear.nextZ;
            if (ear.nextZ) ear.nextZ.prevZ = ear.prevZ;

            // skipping the next vertice leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                earcutLinked(filterPoints(ear), triangles, minX, minY, size, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(ear, triangles);
                earcutLinked(ear, triangles, minX, minY, size, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(ear, triangles, minX, minY, size);
            }

            break;
        }
    }
}

function addIndexedVertex(triangles, node) {
    if (node.source) node = node.source;

    var i = node.index;
    if (i === null) {
        var dim = node.p.length;
        var vertices = triangles.vertices;
        node.index = i = vertices.length / dim;

        for (var d = 0; d < dim; d++) vertices.push(node.p[d]);
    }
    triangles.indices.push(i);
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(ear, minX, minY, size) {

    var a = ear.prev.p,
        b = ear.p,
        c = ear.next.p,

        ax = a[0], bx = b[0], cx = c[0],
        ay = a[1], by = b[1], cy = c[1],

        abd = ax * by - ay * bx,
        acd = ax * cy - ay * cx,
        cbd = cx * by - cy * bx,
        A = abd - acd - cbd;

    if (A <= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear;
    // the code below is a bit verbose and repetitive but this is done for performance

    var cay = cy - ay,
        acx = ax - cx,
        aby = ay - by,
        bax = bx - ax,
        p, px, py, s, t, k, node;

    // if we use z-order curve hashing, iterate through the curve
    if (minX !== undefined) {

        // triangle bbox; min & max are calculated like this for speed
        var minTX = ax < bx ? (ax < cx ? ax : cx) : (bx < cx ? bx : cx),
            minTY = ay < by ? (ay < cy ? ay : cy) : (by < cy ? by : cy),
            maxTX = ax > bx ? (ax > cx ? ax : cx) : (bx > cx ? bx : cx),
            maxTY = ay > by ? (ay > cy ? ay : cy) : (by > cy ? by : cy),

            // z-order range for the current triangle bbox;
            minZ = zOrder(minTX, minTY, minX, minY, size),
            maxZ = zOrder(maxTX, maxTY, minX, minY, size);

        // first look for points inside the triangle in increasing z-order
        node = ear.nextZ;

        while (node && node.z <= maxZ) {
            p = node.p;
            node = node.nextZ;
            if (p === a || p === c) continue;

            px = p[0];
            py = p[1];

            s = cay * px + acx * py - acd;
            if (s >= 0) {
                t = aby * px + bax * py + abd;
                if (t >= 0) {
                    k = A - s - t;
                    if ((k >= 0) && ((s && t) || (s && k) || (t && k))) return false;
                }
            }
        }

        // then look for points in decreasing z-order
        node = ear.prevZ;

        while (node && node.z >= minZ) {
            p = node.p;
            node = node.prevZ;
            if (p === a || p === c) continue;

            px = p[0];
            py = p[1];

            s = cay * px + acx * py - acd;
            if (s >= 0) {
                t = aby * px + bax * py + abd;
                if (t >= 0) {
                    k = A - s - t;
                    if ((k >= 0) && ((s && t) || (s && k) || (t && k))) return false;
                }
            }
        }

    // if we don't use z-order curve hash, simply iterate through all other points
    } else {
        node = ear.next.next;

        while (node !== ear.prev) {
            p = node.p;
            node = node.next;

            px = p[0];
            py = p[1];

            s = cay * px + acx * py - acd;
            if (s >= 0) {
                t = aby * px + bax * py + abd;
                if (t >= 0) {
                    k = A - s - t;
                    if ((k >= 0) && ((s && t) || (s && k) || (t && k))) return false;
                }
            }
        }
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(start, triangles) {
    var indexed = !!triangles.vertices;

    var node = start;
    do {
        var a = node.prev,
            b = node.next.next;

        // a self-intersection where edge (v[i-1],v[i]) intersects (v[i+1],v[i+2])
        if (intersects(a.p, node.p, node.next.p, b.p) && locallyInside(a, b) && locallyInside(b, a)) {

            if (indexed) {
                addIndexedVertex(triangles, a);
                addIndexedVertex(triangles, node);
                addIndexedVertex(triangles, b);
            } else {
                triangles.push(a.p);
                triangles.push(node.p);
                triangles.push(b.p);
            }

            // remove two nodes involved
            a.next = b;
            b.prev = a;

            var az = node.prevZ,
                bz = node.nextZ && node.nextZ.nextZ;

            if (az) az.nextZ = bz;
            if (bz) bz.prevZ = az;

            node = start = b;
        }
        node = node.next;
    } while (node !== start);

    return node;
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(start, triangles, minX, minY, size) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);

                // run earcut on each half
                earcutLinked(a, triangles, minX, minY, size);
                earcutLinked(c, triangles, minX, minY, size);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles(points, outerNode) {
    var len = points.length;

    var queue = [];
    for (var i = 1; i < len; i++) {
        var list = filterPoints(linkedList(points[i], false));
        if (list) queue.push(getLeftmost(list));
    }
    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        eliminateHole(queue[i], outerNode);
        outerNode = filterPoints(outerNode, outerNode.next);
    }

    return outerNode;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(holeNode, outerNode) {
    outerNode = findHoleBridge(holeNode, outerNode);
    if (outerNode) {
        var b = splitPolygon(outerNode, holeNode);
        filterPoints(b, b.next);
    }
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(holeNode, outerNode) {
    var node = outerNode,
        p = holeNode.p,
        px = p[0],
        py = p[1],
        qMax = -Infinity,
        mNode, a, b;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        a = node.p;
        b = node.next.p;

        if (py <= a[1] && py >= b[1]) {
            var qx = a[0] + (py - a[1]) * (b[0] - a[0]) / (b[1] - a[1]);
            if (qx <= px && qx > qMax) {
                qMax = qx;
                mNode = a[0] < b[0] ? node : node.next;
            }
        }
        node = node.next;
    } while (node !== outerNode);

    if (!mNode) return null;

    // look for points strictly inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var bx = mNode.p[0],
        by = mNode.p[1],
        pbd = px * by - py * bx,
        pcd = px * py - py * qMax,
        cpy = py - py,
        pcx = px - qMax,
        pby = py - by,
        bpx = bx - px,
        A = pbd - pcd - (qMax * by - py * bx),
        sign = A <= 0 ? -1 : 1,
        stop = mNode,
        tanMin = Infinity,
        mx, my, amx, s, t, tan;

    node = mNode.next;

    while (node !== stop) {

        mx = node.p[0];
        my = node.p[1];
        amx = px - mx;

        if (amx >= 0 && mx >= bx) {
            s = (cpy * mx + pcx * my - pcd) * sign;
            if (s >= 0) {
                t = (pby * mx + bpx * my + pbd) * sign;

                if (t >= 0 && A * sign - s - t >= 0) {
                    tan = Math.abs(py - my) / amx; // tangential
                    if (tan < tanMin && locallyInside(node, holeNode)) {
                        mNode = node;
                        tanMin = tan;
                    }
                }
            }
        }

        node = node.next;
    }

    return mNode;
}

// interlink polygon nodes in z-order
function indexCurve(start, minX, minY, size) {
    var node = start;

    do {
        if (node.z === null) node.z = zOrder(node.p[0], node.p[1], minX, minY, size);
        node.prevZ = node.prev;
        node.nextZ = node.next;
        node = node.next;
    } while (node !== start);

    node.prevZ.nextZ = null;
    node.prevZ = null;

    sortLinked(node);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    while (true) {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }

            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize === 0) {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                } else if (qSize === 0 || !q) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else if (p.z <= q.z) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;

        if (numMerges <= 1) return list;

        inSize *= 2;
    }
}

// z-order of a point given coords and size of the data bounding box
function zOrder(x, y, minX, minY, size) {
    // coords are transformed into (0..1000) integer range
    x = 1000 * (x - minX) / size;
    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = 1000 * (y - minY) / size;
    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(start) {
    var node = start,
        leftmost = start;
    do {
        if (node.p[0] < leftmost.p[0]) leftmost = node;
        node = node.next;
    } while (node !== start);

    return leftmost;
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(a, b) {
    return !intersectsPolygon(a, a.p, b.p) &&
           locallyInside(a, b) && locallyInside(b, a) &&
           middleInside(a, a.p, b.p);
}

// winding order of triangle formed by 3 given points
function orient(p, q, r) {
    var o = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    return o > 0 ? 1 :
           o < 0 ? -1 : 0;
}

// check if two points are equal
function equals(p1, p2) {
    return p1[0] === p2[0] && p1[1] === p2[1];
}

// check if two segments intersect
function intersects(p1, q1, p2, q2) {
    return orient(p1, q1, p2) !== orient(p1, q1, q2) &&
           orient(p2, q2, p1) !== orient(p2, q2, q1);
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(start, a, b) {
    var node = start;
    do {
        var p1 = node.p,
            p2 = node.next.p;

        if (p1 !== a && p2 !== a && p1 !== b && p2 !== b && intersects(p1, p2, a, b)) return true;

        node = node.next;
    } while (node !== start);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(a, b) {
    return orient(a.prev.p, a.p, a.next.p) === -1 ?
        orient(a.p, b.p, a.next.p) !== -1 && orient(a.p, a.prev.p, b.p) !== -1 :
        orient(a.p, b.p, a.prev.p) === -1 || orient(a.p, a.next.p, b.p) === -1;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(start, a, b) {
    var node = start,
        inside = false,
        px = (a[0] + b[0]) / 2,
        py = (a[1] + b[1]) / 2;
    do {
        var p1 = node.p,
            p2 = node.next.p;

        if (((p1[1] > py) !== (p2[1] > py)) &&
            (px < (p2[0] - p1[0]) * (py - p1[1]) / (p2[1] - p1[1]) + p1[0])) inside = !inside;

        node = node.next;
    } while (node !== start);

    return inside;
}

function compareX(a, b) {
    return a.p[0] - b.p[0];
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.p),
        b2 = new Node(b.p),
        an = a.next,
        bp = b.prev;

    a2.source = a;
    b2.source = b;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode(point, last) {
    var node = new Node(point);

    if (!last) {
        node.prev = node;
        node.next = node;

    } else {
        node.next = last.next;
        node.prev = last;
        last.next.prev = node;
        last.next = node;
    }
    return node;
}

function Node(p) {
    // vertex coordinates
    this.p = p;

    // previous and next vertice nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = null;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // used for indexed output
    this.source = null;
    this.index = null;
}


return earcut;

}());

var Color = (function(window) {


var w3cColors = {
  aqua:'#00ffff',
  black:'#000000',
  blue:'#0000ff',
  fuchsia:'#ff00ff',
  gray:'#808080',
  grey:'#808080',
  green:'#008000',
  lime:'#00ff00',
  maroon:'#800000',
  navy:'#000080',
  olive:'#808000',
  orange:'#ffa500',
  purple:'#800080',
  red:'#ff0000',
  silver:'#c0c0c0',
  teal:'#008080',
  white:'#ffffff',
  yellow:'#ffff00'
};

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q-p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q-p) * (2/3 - t) * 6;
  return p;
}

function clamp(v, max) {
  return Math.min(max, Math.max(0, v));
}

var Color = function(h, s, l, a) {
  this.H = h;
  this.S = s;
  this.L = l;
  this.A = a;
};

/*
 * str can be in any of these:
 * #0099ff rgb(64, 128, 255) rgba(64, 128, 255, 0.5)
 */
Color.parse = function(str) {
  var
    r = 0, g = 0, b = 0, a = 1,
    m;

  str = (''+ str).toLowerCase();
  str = w3cColors[str] || str;

  if ((m = str.match(/^#(\w{2})(\w{2})(\w{2})$/))) {
    r = parseInt(m[1], 16);
    g = parseInt(m[2], 16);
    b = parseInt(m[3], 16);
  } else if ((m = str.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)(\D+([\d.]+))?\)/))) {
    r = parseInt(m[1], 10);
    g = parseInt(m[2], 10);
    b = parseInt(m[3], 10);
    a = m[4] ? parseFloat(m[5]) : 1;
  } else {
    return;
  }

  return this.fromRGBA(r, g, b, a);
};

Color.fromRGBA = function(r, g, b, a) {
  if (typeof r === 'object') {
    g = r.g / 255;
    b = r.b / 255;
    a = r.a;
    r = r.r / 255;
  } else {
    r /= 255;
    g /= 255;
    b /= 255;
  }

  var
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    h, s, l = (max+min) / 2,
    d = max-min;

  if (!d) {
    h = s = 0; // achromatic
  } else {
    s = l > 0.5 ? d / (2-max-min) : d / (max+min);
    switch (max) {
      case r: h = (g-b) / d + (g < b ? 6 : 0); break;
      case g: h = (b-r) / d + 2; break;
      case b: h = (r-g) / d + 4; break;
    }
    h *= 60;
  }

  return new Color(h, s, l, a);
};

Color.prototype = {

  toRGBA: function() {
    var
      h = clamp(this.H, 360),
      s = clamp(this.S, 1),
      l = clamp(this.L, 1),
      rgba = { a: clamp(this.A, 1) };

    // achromatic
    if (s === 0) {
      rgba.r = l;
      rgba.g = l;
      rgba.b = l;
    } else {
      var
        q = l < 0.5 ? l * (1+s) : l + s - l*s,
        p = 2 * l-q;
        h /= 360;

      rgba.r = hue2rgb(p, q, h + 1/3);
      rgba.g = hue2rgb(p, q, h);
      rgba.b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(rgba.r*255),
      g: Math.round(rgba.g*255),
      b: Math.round(rgba.b*255),
      a: rgba.a
    };
  },

  toString: function() {
    var rgba = this.toRGBA();

    if (rgba.a === 1) {
      return '#' + ((1 <<24) + (rgba.r <<16) + (rgba.g <<8) + rgba.b).toString(16).slice(1, 7);
    }
    return 'rgba(' + [rgba.r, rgba.g, rgba.b, rgba.a.toFixed(2)].join(',') + ')';
  },

  hue: function(h) {
    return new Color(this.H*h, this.S, this.L, this.A);
  },

  saturation: function(s) {
    return new Color(this.H, this.S*s, this.L, this.A);
  },

  lightness: function(l) {
    return new Color(this.H, this.S, this.L*l, this.A);
  },

  alpha: function(a) {
    return new Color(this.H, this.S, this.L, this.A*a);
  }
};

return Color; }(this));

var GLMap = function(containerId, options) {

  options = options || {};

  this._listeners = {};
  this._layers = [];
  this._container = document.getElementById(containerId);

  this.minZoom = parseFloat(options.minZoom) || 10;
  this.maxZoom = parseFloat(options.maxZoom) || 20;

  if (this.maxZoom < this.minZoom) {
    this.maxZoom = this.minZoom;
  }

  this._initState(options);
  this._initEvents(this._container);
  this._initRenderer(this._container);

  this.setDisabled(options.disabled);
};

GLMap.prototype = {

  _initState: function(options) {
    this._center = {};
    this._size = { width:0, height:0 };
    options = State.load(options);
    this.setCenter(options.center || { latitude:52.52000, longitude:13.41000 });
    this.setZoom(options.zoom || this.minZoom);
    this.setRotation(options.rotation || 0);
    this.setTilt(options.tilt || 0);

    this.on('change', function() {
      State.save(this);
    }.bind(this));

    State.save(this);
  },

  _initEvents: function(container) {
    this._startX = 0;
    this._startY = 0;
    this._startRotation = 0;
    this._startZoom = 0;

    this._hasTouch = ('ontouchstart' in window);
    this._dragStartEvent = this._hasTouch ? 'touchstart' : 'mousedown';
    this._dragMoveEvent  = this._hasTouch ? 'touchmove'  : 'mousemove';
    this._dragEndEvent   = this._hasTouch ? 'touchend'   : 'mouseup';

    addListener(container, this._dragStartEvent, this._onDragStart.bind(this));
    addListener(container, 'dblclick',   this._onDoubleClick.bind(this));
    addListener(document, this._dragMoveEvent, this._onDragMove.bind(this));
    addListener(document, this._dragEndEvent,  this._onDragEnd.bind(this));

    if (this._hasTouch) {
      addListener(container, 'gesturechange', this._onGestureChange.bind(this));
    } else {
      addListener(container, 'mousewheel',     this._onMouseWheel.bind(this));
      addListener(container, 'DOMMouseScroll', this._onMouseWheel.bind(this));
    }

    addListener(window, 'resize', this._onResize.bind(this));
  },

  _initRenderer: function(container) {
    var canvas = document.createElement('CANVAS');
    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';

    container.appendChild(canvas);

    // TODO: handle context loss
    try {
      gl = canvas.getContext('experimental-webgl', {
        antialias: true,
        depth: true,
        premultipliedAlpha: false
      });
    } catch(ex) {
      throw ex;
    }

    addListener(canvas, 'webglcontextlost', function(e) {
      cancelEvent(e);
      clearInterval(this._loop);
    }.bind(this));

    addListener(canvas, 'webglcontextrestored', this._initGL.bind(this));

    this._initGL();
  },

  _initGL: function() {
    this.setSize({ width:this._container.offsetWidth, height:this._container.offsetHeight });

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    this._loop = setInterval(this._render.bind(this), 17);
  },

  _render: function() {
    requestAnimationFrame(function() {
      gl.clearColor(0.5, 0.5, 0.5, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//    for (var i = this._layers.length-1; i >= 0; i--) {
      for (var i = 0; i < this._layers.length; i++) {
        this._layers[i].render(this._projection);
      }
    }.bind(this));
  },

  _onDragStart: function(e) {
    if (this._isDisabled || (e.button !== undefined && e.button !== 0)) {
      return;
    }

    cancelEvent(e);

    if (e.touches !== undefined) {
      this._startRotation = this._rotation;
      this._startZoom = this._zoom;
      if (e.touches.length > 1) {
        return;
      }
      e = e.touches[0];
    }

    this._startX = e.clientX;
    this._startY = e.clientY;

    this._isDragging = true;
  },

  _onDragMove: function(e) {
    if (this._isDisabled || !this._isDragging) {
      return;
    }

    if (e.touches !== undefined) {
      if (e.touches.length > 1) {
        return;
      }
      e = e.touches[0];
    }

    var dx = e.clientX-this._startX;
    var dy = e.clientY-this._startY;
    var r = this._rotatePoint(dx, dy, this._rotation * Math.PI / 180);
    this.setCenter(unproject(this._origin.x-r.x, this._origin.y-r.y, this._worldSize));

    this._startX = e.clientX;
    this._startY = e.clientY;
  },

  _onDragEnd: function(e) {
    if (this._isDisabled || !this._isDragging) {
      return;
    }

    if (e.touches !== undefined) {
      if (e.touches.length > 1) {
        return;
      }
      e = e.touches[0];
    }

    this._isDragging = false;

    var dx = e.clientX-this._startX;
    var dy = e.clientY-this._startY;
    var r = this._rotatePoint(dx, dy, this._rotation * Math.PI / 180);
    this.setCenter(unproject(this._origin.x-r.x, this._origin.y-r.y, this._worldSize));
  },

  _rotatePoint: function(x, y, angle) {
    return {
      x: Math.cos(angle)*x - Math.sin(angle)*y,
      y: Math.sin(angle)*x + Math.cos(angle)*y
    };
  },

  _onGestureChange: function(e) {
    if (this._isDisabled) {
      return;
    }
    cancelEvent(e);
    this.setRotation(this._startRotation-e.rotation);
    this.setZoom(this._startZoom + (e.scale - 1));
  },

  _onDoubleClick: function(e) {
    if (this._isDisabled) {
      return;
    }
    cancelEvent(e);
    this.setZoom(this._zoom + 1, e);
  },

  _onMouseWheel: function(e) {
    if (this._isDisabled) {
      return;
    }
    cancelEvent(e);
    var delta = 0;
    if (e.wheelDeltaY) {
      delta = e.wheelDeltaY;
    } else if (e.wheelDelta) {
      delta = e.wheelDelta;
    } else if (e.detail) {
      delta = -e.detail;
    }

    var adjust = 0.2 * (delta > 0 ? 1 : delta < 0 ? -1 : 0);

    this.setZoom(this._zoom + adjust, e);
  },

  _onResize: function() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(function() {
      var container = this._container;
      if (this._size.width !== container.offsetWidth || this._size.height !== container.offsetHeight) {
        this.setSize({ width:container.offsetWidth, height:container.offsetHeight });
      }
    }.bind(this), 250);
  },

  _emit: function(type) {
    if (!this._listeners[type]) {
      return;
    }
    var listeners = this._listeners[type];
    for (var i = 0, il = listeners.length; i < il; i++) {
      listeners[i]();
    }
  },

  addLayer: function(layer) {
    this._layers.push(layer);
  },

  removeLayer: function(layer) {
    for (var i = 0; i < this._layers.length; i++) {
      if (this._layers[i] === layer) {
        this._layers[i].splice(i, 1);
        return;
      }
    }
  },

  setDisabled: function(flag) {
    this._isDisabled = !!flag;
  },

  on: function(type, listener) {
    var listeners = this._listeners[type] || (this._listeners[type] = []);
    listeners.push(listener);
    return this;
  },

  _setOrigin: function(origin) {
    this._origin = origin;
  },

  off: function(type, listener) {
    return this;
  },

  getZoom: function() {
    return this._zoom;
  },

  setZoom: function(zoom, e) {
    zoom = clamp(parseFloat(zoom), this.minZoom, this.maxZoom);

    if (this._zoom !== zoom) {
      if (!e) {
        this._zoom = zoom;
        this._worldSize = TILE_SIZE * Math.pow(2, zoom);
        this._setOrigin(project(this._center.latitude, this._center.longitude, this._worldSize));
      } else {
        var size = this.getSize();
        var dx = size.width /2 - e.clientX;
        var dy = size.height/2 - e.clientY;
        var geoPos = unproject(this._origin.x - dx, this._origin.y - dy, this._worldSize);

        this._zoom = zoom;
        this._worldSize = TILE_SIZE * Math.pow(2, zoom);

        var pxPos = project(geoPos.latitude, geoPos.longitude, this._worldSize);
        this._setOrigin({ x:pxPos.x+dx, y:pxPos.y+dy });
        this._center = unproject(this._origin.x, this._origin.y, this._worldSize);
      }

      this._emit('change');
    }

    return this;
  },

  getCenter: function() {
    return this._center;
  },

  setCenter: function(center) {
    center.latitude  = clamp(parseFloat(center.latitude),   -90,  90);
    center.longitude = clamp(parseFloat(center.longitude), -180, 180);

    if (this._center.latitude !== center.latitude || this._center.longitude !== center.longitude) {
      this._center = center;
      this._setOrigin(project(center.latitude, center.longitude, this._worldSize));
      this._emit('change');
    }

    return this;
  },

  getBounds: function() {
    var centerXY = project(this._center.latitude, this._center.longitude, this._worldSize);

    var size = this.getSize();
    var halfWidth  = size.width/2;
    var halfHeight = size.height/2;

    var nw = unproject(centerXY.x - halfWidth, centerXY.y - halfHeight, this._worldSize);
    var se = unproject(centerXY.x + halfWidth, centerXY.y + halfHeight, this._worldSize);

    return {
      n: nw.latitude,
      w: nw.longitude,
      s: se.latitude,
      e: se.longitude
    };
  },

  setSize: function(size) {
    var canvas = gl.canvas;
    if (size.width !== this._size.width || size.height !== this._size.height) {
      canvas.width  = this._size.width  = size.width;
      canvas.height = this._size.height = size.height;
      gl.viewport(0, 0, size.width, size.height);
      this._projection = Matrix.perspective(20, size.width, size.height, 40000);
      this._emit('resize');
    }

    return this;
  },

  getSize: function() {
    return this._size;
  },

  getOrigin: function() {
    return this._origin;
  },

  getRotation: function() {
    return this._rotation;
  },

  setRotation: function(rotation) {
    rotation = parseFloat(rotation)%360;
    if (this._rotation !== rotation) {
      this._rotation = rotation;
      this._emit('change');
    }
    return this;
  },

  getTilt: function() {
    return this._tilt;
  },

  setTilt: function(tilt) {
    tilt = clamp(parseFloat(tilt), 0, 70);
    if (this._tilt !== tilt) {
      this._tilt = tilt;
      this._emit('change');
    }
    return this;
  },

  getContext: function() {
    return gl;
  },

  destroy: function() {
    var canvas = gl.canvas;
    canvas.parentNode.removeChild(canvas);
    gl = null;

    // TODO: stop render loop
//  clearInterval(...);
    this._listeners = null;

    for (var i = 0; i < this._layers.length; i++) {
      this._layers[i].destroy();
    }
    this._layers = null;
  }
};


var State = {};

(function() {

  function save(map) {
    if (!history.replaceState) {
      return;
    }

    var params = [];
    var center = map.getCenter();
    params.push('latitude=' + center.latitude.toFixed(5));
    params.push('longitude=' + center.longitude.toFixed(5));
    params.push('zoom=' + map.getZoom().toFixed(1));
    params.push('tilt=' + map.getTilt().toFixed(1));
    params.push('rotation=' + map.getRotation().toFixed(1));
    history.replaceState({}, '', '?'+ params.join('&'));
  }

  State.load = function(options) {
    var query = location.search;
    if (query) {
      var state = {};
      query = query.substring(1).replace( /(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
        if ($1) {
          state[$1] = $2;
        }
      });

      if (state.latitude !== undefined && state.longitude !== undefined) {
        options.center = { latitude:parseFloat(state.latitude), longitude:parseFloat(state.longitude) };
      }
      if (state.zoom !== undefined) {
        options.zoom = parseFloat(state.zoom);
      }
      if (state.rotation !== undefined) {
        options.rotation = parseFloat(state.rotation);
      }
      if (state.tilt !== undefined) {
        options.tilt = parseFloat(state.tilt);
      }
    }
    return options;
  };

  var timer;
  State.save = function(map) {
    clearTimeout(timer);
    timer = setTimeout(function() {
      save(map);
    }, 1000);
  };

}());


var Map, Renderer;

var OSMBuildings = function(options) {
  options = options || {};

  Grid.fixedZoom = 16;

  // src=false and src=null would disable the data grid
  if (options.src === undefined) {
    Grid.src = DATA_SRC.replace('{k}', options.dataKey || DATA_KEY);
  } else if (typeof options.src === 'string') {
    Grid.src = options.src;
  }

  if (options.map) {
    this.addTo(options.map);
  }

  if (options.style) {
    this.setStyle(options.style);
  }
};

(function() {

  function onMapChange() {
    Grid.onMapChange();
  }

  function onMapResize() {
    Grid.onMapResize();
    Renderer.onMapResize();
  }

  OSMBuildings.VERSION     = '0.1.5';
  OSMBuildings.ATTRIBUTION = '&copy; <a href="http://osmbuildings.org">OSM Buildings</a>';

  OSMBuildings.prototype = {

    addTo: function(map) {
      map.addLayer(this);

      Map = {};

      map.on('change', function() {
        Map.zoom     = map.getZoom();
        Map.bounds   = map.getBounds();
        Map.origin   = map.getOrigin();
        Map.rotation = map.getRotation();
        Map.tilt     = map.getTilt();
        onMapChange();
      });

      map.on('resize', function() {
        Map.size   = map.getSize();
        Map.bounds = map.getBounds();
        onMapResize();
      });

  //  map.addAttribution(OSMBuildings.ATTRIBUTION);

      Map.size     = map.getSize();
      Map.zoom     = map.getZoom();
      Map.bounds   = map.getBounds();
      Map.origin   = map.getOrigin();
      Map.rotation = map.getRotation();
      Map.tilt     = map.getTilt();

      Renderer = new GLRenderer(map.getContext());

      onMapChange();
      onMapResize();

      return this;
    },

    remove: function() {},

    render: function() {
      Renderer.render();
      return this;
    },

    destroy: function() {
      Grid.destroy();
    },

    setStyle: function(style) {
      var color = style.color || style.wallColor;
      if (color) {
        DEFAULT_COLOR = Color.parse(color).toRGBA();
      }
      return this;
    },

    addMesh: function(url) {
      var mesh = new Mesh(url);
      Data.add(mesh);
      if (typeof url === 'string') {
        mesh.load(url);
      }
      return this;
    }
  };

}());


var PI = Math.PI;

var MIN_ZOOM = 14.5;

var TILE_SIZE = 256;

var DATA_KEY = 'anonymous';
var DATA_SRC = 'http://{s}.data.osmbuildings.org/0.2/{k}/tile/{z}/{x}/{y}.json';

var DEFAULT_HEIGHT = 10;

var DEFAULT_COLOR = Color.parse('rgb(220, 210, 200)').toRGBA();
var STYLE = {
  zoomAlpha: {
    min: { zoom: 17, alpha: 1.0 },
    max: { zoom: 20, alpha: 1.0 }
  }
};

var gl;


var XHR = {};

(function() {

  var loading = {};

  XHR.loadJSON = function(url, callback) {
    if (loading[url]) {
      return loading[url];
    }

    var req = new XMLHttpRequest();

    req.onreadystatechange = function() {
      if (req.readyState !== 4) {
        return;
      }

      delete loading[url];

      if (!req.status || req.status < 200 || req.status > 299) {
        return;
      }

      if (req.responseText) {
        var json;
        try {
          json = JSON.parse(req.responseText);
        } catch(ex) {
          console.error('Could not parse JSON from '+ url +'\n'+ ex.message);
        }
        callback(json);
      }
    };

    loading[url] = req;
    req.open('GET', url);
    req.send(null);

    return {
      abort: function() {
        req.abort();
        delete loading[url];
      }
    };
  };

  XHR.abortAll = function() {
    for (var url in loading) {
      loading[url].abort();
    }
    loading = {};
  };

}());


function clamp(value, min, max) {
  return Math.min(max, Math.max(value, min));
}

function normalize(value, min, max) {
  var range = max-min;
  return clamp((value-min)/range, 0, 1);
}

function adjust(inValue, style, inProperty, outProperty) {
  var min = style.min, max = style.max;
  var normalized = normalize(inValue, min[inProperty], max[inProperty]);
  return min[outProperty] + (max[outProperty]-min[outProperty]) * normalized;
}

function project(latitude, longitude, worldSize) {
  var
    x = longitude/360 + 0.5,
    y = Math.min(1, Math.max(0, 0.5 - (Math.log(Math.tan((Math.PI/4) + (Math.PI/2)*latitude/180)) / Math.PI) / 2));
  return { x: x*worldSize, y: y*worldSize };
}

function unproject(x, y, worldSize) {
  x /= worldSize;
  y /= worldSize;
  return {
    latitude: (2 * Math.atan(Math.exp(Math.PI * (1 - 2*y))) - Math.PI/2) * (180/Math.PI),
    longitude: x*360 - 180
  };
}

function pattern(str, param) {
  return str.replace(/\{(\w+)\}/g, function(tag, key) {
    return param[key] || tag;
  });
}

function addListener(target, type, fn) {
  target.addEventListener(type, fn, false);
}

function removeListener(target, type, fn) {
  target.removeEventListener(type, fn, false);
}

function cancelEvent(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.returnValue = false;
}

var SHADERS = {"tileplane":{"src":{"vertex":"\nprecision mediump float;\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uMatrix;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vTexCoord = aTexCoord;\n}\n","fragment":"\nprecision mediump float;\nuniform sampler2D uTileImage;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_FragColor = texture2D(uTileImage, vec2(vTexCoord.x, -vTexCoord.y));\n}\n"},"attributes":["aPosition","aTexCoord"],"uniforms":["uMatrix","uTileImage"]},"default":{"src":{"vertex":"\nprecision mediump float;\nattribute vec4 aPosition;\nattribute vec3 aNormal;\nattribute vec3 aColor;\nuniform mat4 uMatrix;\nuniform mat3 uNormalTransform;\nuniform vec3 uLightDirection;\nuniform vec3 uLightColor;\nvarying vec3 vColor;\nvarying vec4 vPosition;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vPosition = aPosition;\n  vec3 transformedNormal = aNormal * uNormalTransform;\n  float intensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;\n  vColor = aColor + uLightColor * intensity;\n}","fragment":"\nprecision mediump float;\nuniform float uAlpha;\nvarying vec4 vPosition;\nvarying vec3 vColor;\nfloat gradientHeight = 90.0;\nfloat maxGradientStrength = 0.3;\nvoid main() {\n  float shading = clamp((gradientHeight-vPosition.z) / (gradientHeight/maxGradientStrength), 0.0, maxGradientStrength);\n  gl_FragColor = vec4(vColor - shading, uAlpha);\n//  float fog = clamp((10.0-vPosition.y)/20.0, 0.0, 0.5);\n//  gl_FragColor = vec4(vColor - shading, uAlpha-fog);\n}\n"},"attributes":["aPosition","aColor","aNormal"],"uniforms":["uNormalTransform","uMatrix","uAlpha","uLightColor","uLightDirection"]}};


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
        [ triangles[t  ][0], triangles[t  ][1], z ],
        [ triangles[t+1][0], triangles[t+1][1], z ],
        [ triangles[t+2][0], triangles[t+2][1], z ],
        color
      );
    }
  },

  polygon3d: function(data, polygon, color) {
    var ring = polygon[0];
    var ringLength = ring.length;
    var triangles, t, tl;

//  { r:255, g:0, b:0 }

    if (ringLength <= 4) { // 3: a triangle
      this.addTriangle(
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
        this.addTriangle(
          data,
          [ triangles[t  ][2], triangles[t  ][1], triangles[t  ][0] ],
          [ triangles[t+1][2], triangles[t+1][1], triangles[t+1][0] ],
          [ triangles[t+2][2], triangles[t+2][1], triangles[t+2][0] ],
          color
        );

        //if (n[0] < 0) { //  NE & SE
        //  this.addTriangle(
        //    data,
        //    [ triangles[t  ][2], triangles[t  ][1], triangles[t  ][0] ],
        //    [ triangles[t+2][2], triangles[t+2][1], triangles[t+2][0] ],
        //    [ triangles[t+1][2], triangles[t+1][1], triangles[t+1][0] ],
        //    color
        //  );
        //} else { // NW & SW
        //  this.addTriangle(
        //    data,
        //    [ triangles[t  ][2], triangles[t  ][1], triangles[t  ][0] ],
        //    [ triangles[t+1][2], triangles[t+1][1], triangles[t+1][0] ],
        //    [ triangles[t+2][2], triangles[t+2][1], triangles[t+2][0] ],
        //    color
        //  );
        //}
      }

      return;
    }

    triangles = earcut(polygon);
    for (t = 0, tl = triangles.length-2; t < tl; t+=3) {
      this.addTriangle(
        data,
        [ triangles[t  ][0], triangles[t  ][1], triangles[t  ][2] ],
        [ triangles[t+1][0], triangles[t+1][1], triangles[t+1][2] ],
        [ triangles[t+2][0], triangles[t+2][1], triangles[t+2][2] ],
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

  pyramid: function(data, polygon, center, minHeight, height, color) {
    polygon = polygon[0];
    for (var i = 0, il = polygon.length-1; i < il; i++) {
      this.addTriangle(
        data,
        [ polygon[i  ][0], polygon[i  ][1], minHeight ],
        [ polygon[i+1][0], polygon[i+1][1], minHeight ],
        [ center[0], center[1], height ],
        color
      );
    }
  },

  _dome: function(data, center, radius, minHeight, height, color) {
    var latSegments = this.LAT_SEGMENTS/2;
  },

  _sphere: function(data, center, radius, minHeight, height, color) {
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

//_sphere: function(radius) {
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

  Pyramid: function() {},

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
      c[0], c[1], c[2],
      b[0], b[1], b[2]
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


var Grid = {};

(function() {

  var isDelayed;
  var index = {};

  function update(delay) {
    var zoom = Grid.fixedZoom || Math.round(Map.zoom);

    var
      mapBounds = Map.bounds,
      worldSize = TILE_SIZE <<zoom,
      min = project(mapBounds.n, mapBounds.w, worldSize),
      max = project(mapBounds.s, mapBounds.e, worldSize);

    Grid.bounds = {
      zoom: zoom,
      minX: min.x/TILE_SIZE <<0,
      minY: min.y/TILE_SIZE <<0,
      maxX: Math.ceil(max.x/TILE_SIZE),
      maxY: Math.ceil(max.y/TILE_SIZE)
    };

    // TODO: signal, if bbox changed => for loadTiles() + Data.getVisibleItems()

    if (!delay) {
      loadTiles();
      return;
    }

    if (!isDelayed) {
      isDelayed = setTimeout(function() {
        isDelayed = null;
        loadTiles();
      }, delay);
    }
  }

  function loadTiles() {
    var tileX, tileY;
    var queue = [], queueLength;
    var gridBounds = Grid.bounds;
    var key;

    for (tileY = gridBounds.minY; tileY <= gridBounds.maxY; tileY++) {
      for (tileX = gridBounds.minX; tileX <= gridBounds.maxX; tileX++) {
        key = [tileX, tileY, gridBounds.zoom].join(',');
        if (index[key]) {
          continue;
        }
        queue.push({ tileX:tileX, tileY:tileY, zoom:gridBounds.zoom, key:key });
      }
    }

    if (!(queueLength = queue.length)) {
      return;
    }

    // TODO: currently viewport center but could be aligned to be camera pos
    var tileAnchor = {
      x:gridBounds.minX + (gridBounds.maxX-gridBounds.minX-1)/2,
      y:gridBounds.minY + (gridBounds.maxY-gridBounds.minY-1)/2
    };

    queue.sort(function(b, a) {
      return distance2(a, tileAnchor) - distance2(b, tileAnchor);
    });

    var tile, q;
    for (var i = 0; i < queueLength; i++) {
      q = queue[i];
      Data.add( tile = new DataTile(q.tileX, q.tileY, q.zoom) );
      tile.load(getURL(q.tileX, q.tileY, q.zoom));
      index[q.key] = tile;
    }

    purge();
  }

  function purge() {
    for (var key in index) {
      if (!index[key].isVisible(1)) { // testing with buffer of n tiles around viewport TODO: this is bad with fixedTileSIze
        Data.remove(index[key]);
        delete index[key];
      }
    }
  }

  function getURL(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(Grid.src, { s:s, x:x, y:y, z:z });
  }
  //***************************************************************************

  Grid.onMapChange = function() {
    if (!this.src) {
      return;
    }
    update(100);
  };

  Grid.onMapResize = function() {
    if (!this.src) {
      return;
    }
    update();
  };

  Grid.destroy = function() {
    clearTimeout(isDelayed);
  };

}());


var DataTile = function(tileX, tileY, zoom) {
  this.x = tileX*TILE_SIZE;
  this.y = tileY*TILE_SIZE;
  this.zoom = zoom;
};

(function() {

  function createBuffer(itemSize, data) {
    var buffer = gl.createBuffer();
    buffer.itemSize = itemSize;
    buffer.numItems = data.length/itemSize;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }

  //***************************************************************************

  DataTile.prototype.load = function(url) {
    this.request = XHR.loadJSON(url, this.onLoad.bind(this));
  };

  DataTile.prototype.onLoad = function(json) {
    this.request = null;
    var geom = GeoJSON.read(this.x, this.y, this.zoom, json);
    this.vertexBuffer = createBuffer(3, new Float32Array(geom.vertices));
    this.normalBuffer = createBuffer(3, new Float32Array(geom.normals));
    this.colorBuffer  = createBuffer(3, new Uint8Array(geom.colors));
    geom = null; json = null;
    this.isReady = true;
  };

  DataTile.prototype.isVisible = function(buffer) {
    if (!this.isReady) {
      return false;
    }

    buffer = buffer || 0;
    var
      gridBounds = Grid.bounds,
      tileX = this.x/TILE_SIZE,
      tileY = this.y/TILE_SIZE;

    return (this.zoom === gridBounds.zoom &&
      (tileX >= gridBounds.minX-buffer && tileX <= gridBounds.maxX+buffer && tileY >= gridBounds.minY-buffer && tileY <= gridBounds.maxY+buffer));
  };

  DataTile.prototype.render = function(program, projection) {
    if (!this.isVisible()) {
      return;
    }

    var ratio = 1/Math.pow(2, this.zoom-Map.zoom);
    var viewport = Map.size;
    var origin = Map.origin;

    var matrix = Matrix.create();

    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.65);
    matrix = Matrix.translate(matrix, this.x*ratio - origin.x, this.y*ratio - origin.y, 0);
    matrix = Matrix.rotateZ(matrix, Map.rotation);
    matrix = Matrix.rotateX(matrix, Map.tilt);
    matrix = Matrix.translate(matrix, viewport.width/2, viewport.height/2, 0);
    matrix = Matrix.multiply(matrix, projection);

    gl.uniformMatrix4fv(program.uniforms.uMatrix, false, new Float32Array(matrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(program.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(program.attributes.aNormal, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(program.attributes.aColor, this.colorBuffer.itemSize, gl.UNSIGNED_BYTE, true, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);
  };

  DataTile.prototype.destroy = function() {
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.normalBuffer);
    gl.deleteBuffer(this.colorBuffer);

    if (this.request) {
      this.request.abort();
    }
  };

}());


function TileGrid(url, options) {
  this._url = url;

  options = options || {};
  this._tileSize  = options.tileSize || TILE_SIZE;

  this._tiles = {};

  this._shader = new Shader('tileplane');
}

GLMap.TileLayer = TileGrid;

TileGrid.prototype = {

  _updateTileBounds: function() {
    var
      bounds = this._map.getBounds(),
      tileSize = this._tileSize,
      zoom = this._zoom = Math.round(this._map.getZoom()),
      worldSize = tileSize <<zoom,
      min = project(bounds.n, bounds.w, worldSize),
      max = project(bounds.s, bounds.e, worldSize);


    this._tileBounds = {
      minX: min.x/tileSize <<0,
      minY: min.y/tileSize <<0,
      maxX: Math.ceil(max.x/tileSize),
      maxY: Math.ceil(max.y/tileSize)
    };
  },

  _loadTiles: function() {
    var
      tileBounds = this._tileBounds,
      zoom = this._zoom,
      tiles = this._tiles,
      x, y, key,
      queue = [], queueLength;

    var tileAnchor = [
      tileBounds.minX + (tileBounds.maxX-tileBounds.minX-1)/2,
      tileBounds.maxY
    ];

    for (y = tileBounds.minY; y < tileBounds.maxY; y++) {
      for (x = tileBounds.minX; x < tileBounds.maxX; x++) {
        key = [x, y, zoom].join(',');
        if (tiles[key]) {
          continue;
        }
        tiles[key] = new MapTile(x, y, zoom);
        queue.push({ tile:tiles[key], dist:distance2([x, y], tileAnchor) });
      }
    }

    if (!(queueLength = queue.length)) {
      return;
    }

    queue.sort(function(a, b) {
      return a.dist-b.dist;
    });

    for (var i = 0; i < queueLength; i++) {
      queue[i].tile.load(this._getURL(queue[i].tile.tileX, queue[i].tile.tileY, queue[i].tile.zoom));
    }

    this._purge();
  },

  _getURL: function(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(this._url, { s:s, x:x, y:y, z:z });
  },

  _purge: function() {
    var
      key,
      tiles = this._tiles;
return
    for (key in tiles) {
      if (!tiles[key].isVisible(1)) {
        tiles[key].destroy();
        delete tiles[key];
      }
    }
  },

  addTo: function(map) {
    this._map = map;

    map.addLayer(this);

    this._updateTileBounds();
    this.update();

    map.on('change', function() {
      this._updateTileBounds();
      this.update(100);
    }.bind(this));

    map.on('resize', function() {
      this._updateTileBounds();
      this.update();
    }.bind(this));
  },

  remove: function() {
    this._map.remove(this);
    this._map = null;
  },

  update: function(delay) {
    if (!delay) {
      this._loadTiles();
      return;
    }

    if (!this._isWaiting) {
      this._isWaiting = setTimeout(function() {
        this._isWaiting = null;
        this._loadTiles();
      }.bind(this), delay);
    }
  },

  // TODO: try to use tiles from other zoom levels when some are missing
  render: function(projection) {
    var program = this._shader.use();
    var tiles = this._tiles;

    for (var key in tiles) {
      if (tiles[key].isVisible()) {
        tiles[key].render(program, projection, this._map);
      }
    }
    program.end();
  },

  destroy: function() {
    clearTimeout(this._isWaiting);

    for (var key in this._tiles) {
      this._tiles[key].destroy();
    }
    this._tiles = null;
  }
};

var GL = {};

GL.createTexture = function(img) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D);

  //  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  //  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  //  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

//  img = null;
  return texture;
};

GL.createBuffer = function(itemSize, data) {
  var buffer = gl.createBuffer();
  buffer.itemSize = itemSize;
  buffer.numItems = data.length / itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  data = null;
  return buffer;
};

//*****************************************************************************

function MapTile(tileX, tileY, zoom) {
  this.tileX = tileX;
  this.tileY = tileY;
  this.zoom = zoom;

  this._vertexBuffer   = GL.createBuffer(3, new Float32Array([255, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 0]));
  this._texCoordBuffer = GL.createBuffer(2, new Float32Array([1, 1, 1, 0, 0, 1, 0, 0]));
}

MapTile.prototype = {

  load: function(url) {
    var img = this._image = new Image();
    img.crossOrigin = '*';
    img.onload = this.onLoad.bind(this);
    img.src = url;
  },

  onLoad: function() {
    this._texture = GL.createTexture(this._image);
    this.isReady = true;
  },

  render: function(program, projection, map) {
    if (!this.isVisible()) {
      return;
    }

    var ratio = 1 / Math.pow(2, this.zoom - map.getZoom());
    var adaptedTileSize = TILE_SIZE * ratio;
    var size = map.getSize();
    var origin = map.getOrigin();

    var matrix = Matrix.create();

    matrix = Matrix.scale(matrix, ratio * 1.005, ratio * 1.005, 1);
    matrix = Matrix.translate(matrix, this.tileX * adaptedTileSize - origin.x, this.tileY * adaptedTileSize - origin.tileY, 0);
    matrix = Matrix.rotateZ(matrix, map.getRotation());
    matrix = Matrix.rotateX(matrix, map.getTilt());
    matrix = Matrix.translate(matrix, size.width / 2, size.height / 2, 0);
    matrix = Matrix.multiply(matrix, projection);

    gl.uniformMatrix4fv(program.uniforms.uMatrix, false, new Float32Array(matrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.vertexAttribPointer(program.attributes.aPosition, this._vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer);
    gl.vertexAttribPointer(program.attributes.aTexCoord, this._texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.uniform1i(program.uniforms.uTileImage, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this._vertexBuffer.numItems);
  },

    //var
    //  tileBounds = this._tileBounds,
    //  xyz = key.split(','),
    //  x = parseInt(xyz[0], 10), y = parseInt(xyz[1], 10), z = parseInt(xyz[2], 10);
    //
    //// TODO: do not invalidate all zoom levels immediately
    //if (z !== this._zoom) {
    //  return false;
    //}
    //
    //return (x >= tileBounds.minX-buffer && x <= tileBounds.maxX+buffer-1 && y >= tileBounds.minY-buffer && y <= tileBounds.maxY+buffer-1);

  isVisible: function(buffer) {
    if (!this.isReady) {
      return false;
    }

return true;

    buffer = buffer || 0;
    var
      gridBounds = TileGrid.bounds,
      tileX = this.tileX,
      tileY = this.tileY;

  //  return (this.zoom === gridBounds.zoom &&
  //  (tileX >= gridBounds.minX-buffer && tileX <= gridBounds.maxX+buffer-1 && tileY >= gridBounds.minY-buffer && tileY <= gridBounds.maxY+buffer-1));
  },

  getMatrix: function() {
  //  var ratio = 1/Math.pow(2, this.zoom-Map.zoom);
  //  var origin = Map.origin;
  //  var matrix = Matrix.create();
  //  matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.65);
  //  matrix = Matrix.translate(matrix, this.x*ratio - origin.x, this.y*ratio - origin.y, 0);
  //  return matrix;
  },

  destroy: function() {
    gl.deleteBuffer(this._vertexBuffer);
    gl.deleteBuffer(this._texCoordBuffer);

    this._image.src = '';

    if (this._texture) {
      gl.deleteTexture(this._texture);
    }
  }
};


var Data = {

  items: [],

  add: function(mesh) {
    this.items.push(mesh);
  },

  remove: function(item) {
    var items = this.items;
    for (var i = 0, il = items.length; i < il; i++) {
      if (items[i] === item) {
        items[i].destroy();
        items.splice(i, 1);
        return;
      }
    }
  }
};


var Mesh = function(data) {
  this.zoom = 16;

  if (typeof data === 'object') {
    this.onLoad(data);
  }
};

(function() {

  function createBuffer(itemSize, data) {
    var buffer = gl.createBuffer();
    buffer.itemSize = itemSize;
    buffer.numItems = data.length/itemSize;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }

  //***************************************************************************

  Mesh.prototype.load = function(url) {
    this.request = XHR.loadJSON(url, this.onLoad.bind(this));
  };

  Mesh.prototype.onLoad = function(json) {
    this.request = null;

    var
      worldSize = TILE_SIZE * Math.pow(2, this.zoom),
      p = project(json.offset.latitude, json.offset.longitude, worldSize);

    this.x = p.x;
    this.y = p.y;

    var geom = JS3D.read(this.x, this.y, this.zoom, json);
    this.vertexBuffer = createBuffer(3, new Float32Array(geom.vertices));
    this.normalBuffer = createBuffer(3, new Float32Array(geom.normals));
    this.colorBuffer  = createBuffer(3, new Uint8Array(geom.colors));
    geom = null; json = null;
    this.isReady = true;
  };

  Mesh.prototype.render = function(program, projection) {
    if (!this.isVisible()) {
      return;
    }

    var ratio = 1/Math.pow(2, this.zoom-Map.zoom);
    var size = Map.size;
    var origin = Map.origin;

    var matrix = Matrix.create();

    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.65);
    matrix = Matrix.translate(matrix, this.x*ratio - origin.x, this.y*ratio - origin.y, 0);
    matrix = Matrix.rotateZ(matrix, Map.rotation);
    matrix = Matrix.rotateX(matrix, Map.tilt);
    matrix = Matrix.translate(matrix, size.width/2, size.height/2, 0);
    matrix = Matrix.multiply(matrix, projection);

    gl.uniformMatrix4fv(program.uniforms.uMatrix, false, new Float32Array(matrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(program.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(program.attributes.aNormal, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(program.attributes.aColor, this.colorBuffer.itemSize, gl.UNSIGNED_BYTE, true, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);
  };

  Mesh.prototype.isVisible = function(key, buffer) {
    if (!this.isReady) {
      return false;
    }

    buffer = buffer || 0;
return true;
  };

  Mesh.prototype.destroy = function() {
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.normalBuffer);
    gl.deleteBuffer(this.colorBuffer);

    if (this.request) {
      this.request.abort();
    }
  };

}());


var GeoJSON = {};

(function() {

  var METERS_PER_LEVEL = 3;

  var materialColors = {
    brick:'#cc7755',
    bronze:'#ffeecc',
    canvas:'#fff8f0',
    concrete:'#999999',
    copper:'#a0e0d0',
    glass:'#e8f8f8',
    gold:'#ffcc00',
    plants:'#009933',
    metal:'#aaaaaa',
    panel:'#fff8f0',
    plaster:'#999999',
    roof_tiles:'#f08060',
    silver:'#cccccc',
    slate:'#666666',
    stone:'#996666',
    tar_paper:'#333333',
    wood:'#deb887'
  };

  var baseMaterials = {
    asphalt:'tar_paper',
    bitumen:'tar_paper',
    block:'stone',
    bricks:'brick',
    glas:'glass',
    glassfront:'glass',
    grass:'plants',
    masonry:'stone',
    granite:'stone',
    panels:'panel',
    paving_stones:'stone',
    plastered:'plaster',
    rooftiles:'roof_tiles',
    roofingfelt:'tar_paper',
    sandstone:'stone',
    sheet:'canvas',
    sheets:'canvas',
    shingle:'tar_paper',
    shingles:'tar_paper',
    slates:'slate',
    steel:'metal',
    tar:'tar_paper',
    tent:'canvas',
    thatch:'plants',
    tile:'roof_tiles',
    tiles:'roof_tiles'
  // cardboard
  // eternit
  // limestone
  // straw
  };

  function getMaterialColor(str) {
    str = str.toLowerCase();
    if (str[0] === '#') {
      return str;
    }
    return materialColors[baseMaterials[str] || str] || null;
  }

  function alignProperties(prop) {
    var item = {};
    var color;

    prop = prop || {};

    item.height    = prop.height    || (prop.levels   ? prop.levels  *METERS_PER_LEVEL : DEFAULT_HEIGHT);
    item.minHeight = prop.minHeight || (prop.minLevel ? prop.minLevel*METERS_PER_LEVEL : 0);

    var wallColor = prop.material ? getMaterialColor(prop.material) : (prop.wallColor || prop.color);
    item.wallColor = (color = Color.parse(wallColor)) ? color.toRGBA() : DEFAULT_COLOR;

    var roofColor = prop.roofMaterial ? getMaterialColor(prop.roofMaterial) : prop.roofColor;
    item.roofColor = (color = Color.parse(roofColor)) ? color.toRGBA() : DEFAULT_COLOR;

    switch (prop.shape) {
      case 'cylinder':
      case 'cone':
      case 'dome':
      case 'sphere':
        item.shape = prop.shape;
        item.isRotational = true;
      break;

      case 'pyramid':
        item.shape = prop.shape;
      break;
    }

    switch (prop.roofShape) {
      case 'cone':
      case 'dome':
        item.roofShape = prop.roofShape;
        item.isRotational = true;
      break;

      case 'pyramid':
        item.roofShape = prop.roofShape;
      break;
    }

    if (item.roofShape && prop.roofHeight) {
      item.roofHeight = prop.roofHeight;
      item.height = Math.max(0, item.height-item.roofHeight);
    } else {
      item.roofHeight = 0;
    }

    if (item.height+item.roofHeight <= item.minHeight) {
      return;
    }

    if (prop.relationId) {
      item.relationId = prop.relationId;
    }

//  item.hitColor = HitAreas.idToColor(item.relationId || item.id);

    return item;
  }

  function getGeometries(geometry) {
    var geometries = [], sub, i, il;
    switch (geometry.type) {
      case 'GeometryCollection':
        for (i = 0, il = geometry.geometries.length; i < il; i++) {
          if ((sub = getGeometries(geometry.geometries[i]))) {
            geometries.push.apply(geometries, sub);
          }
        }
        return geometries;

      case 'MultiPolygon':
        for (i = 0, il = geometry.coordinates.length; i < il; i++) {
          if ((sub = getGeometries({ type: 'Polygon', coordinates: geometry.coordinates[i] }))) {
            geometries.push.apply(geometries, sub);
          }
        }
        return geometries;

      case 'Polygon':
        return [geometry.coordinates];

      default: return [];
    }
  }

  function transform(offsetX, offsetY, zoom, coordinates) {
    var
      worldSize = TILE_SIZE * Math.pow(2, zoom),
      res = [],
      r, rl, p,
      ring;

    for (var c = 0, cl = coordinates.length; c < cl; c++) {
      ring = coordinates[c];
      res[c] = [];
      for (r = 0, rl = ring.length-1; r < rl; r++) {
        p = project(ring[r][1], ring[r][0], worldSize);
        res[c][r] = [p.x-offsetX, p.y-offsetY];
      }
    }

    return res;
  }

  GeoJSON.read = function(offsetX, offsetY, zoom, geojson) {
    if (!geojson || geojson.type !== 'FeatureCollection') {
      return [];
    }

    var
      collection = geojson.features,
      feature,
      geometries,
      data = {
        vertices: [],
        normals: [],
        colors: []
      },
      j, jl,
      item, polygon, bbox, radius, center;

    for (var i = 0, il = collection.length; i < il; i++) {
      feature = collection[i];

      if (!(item = alignProperties(feature.properties))) {
        continue;
      }

      geometries = getGeometries(feature.geometry);

      for (j = 0, jl = geometries.length; j < jl; j++) {
        polygon = transform(offsetX, offsetY, zoom, geometries[j]);

        if ((item.roofShape === 'cone' || item.roofShape === 'dome') && !item.shape && isRotational(polygon)) {
          item.shape = 'cylinder';
          item.isRotational = true;
        }

        bbox = getBBox(polygon);
        center = [ bbox.minX + (bbox.maxX-bbox.minX)/2, bbox.minY + (bbox.maxY-bbox.minY)/2 ];

        if (item.isRotational) {
          radius = (bbox.maxX-bbox.minX)/2;
        }

//      if (feature.id || feature.properties.id) {
//        item.id = feature.id || feature.properties.id;
//      }
//      if (feature.properties.relationId) {
//        item.relationId = feature.properties.relationId;
//      }

        switch (item.shape) {
          case 'cylinder':
            Triangulate.cylinder(data, center, radius, radius, item.minHeight, item.height, item.wallColor);
            Triangulate.circle(data, center, radius, item.height, item.roofColor);
          break;

          case 'cone':
            Triangulate.cylinder(data, center, radius, 0, item.minHeight, item.height, item.wallColor);
          break;

          case 'sphere':
            Triangulate.cylinder(data, center, radius, radius/2, item.minHeight, item.height, item.wallColor);
            Triangulate.circle(data, center, radius/2, item.height, item.roofColor);
          break;

          case 'pyramid':
            Triangulate.pyramid(data, polygon, center, item.minHeight, item.height, item.wallColor);
          break;

          default:
            Triangulate.extrusion(data, polygon, item.minHeight, item.height, item.wallColor);
            Triangulate.polygon(data, polygon, item.height, item.roofColor);
        }

        switch (item.roofShape) {
          case 'cone':
            Triangulate.cylinder(data, center, radius, 0, item.height, item.height+item.roofHeight, item.roofColor);
          break;

          case 'dome':
            Triangulate.cylinder(data, center, radius, radius/2, item.height, item.height+item.roofHeight, item.roofColor);
            Triangulate.circle(data, center, radius/2, item.height+item.roofHeight, item.roofColor);
          break;

          case 'pyramid':
            Triangulate.pyramid(data, polygon, center, item.height, item.height+item.roofHeight, item.roofColor);
          break;
        }
      }
    }

    return data;
  };

}());


var JS3D = {};

(function() {

  function transform(offsetX, offsetY, zoom, ring) {
    var
      worldSize = TILE_SIZE * Math.pow(2, zoom),
      res = [],
      p;

    for (var j = 0, jl = ring.length-2; j < jl; j+=3) {
      p = project(ring[j+1], ring[j], worldSize);
      res[j/3] = [p.x-offsetX, p.y-offsetY, ring[j+2]];
    }

    return res;
  }

  JS3D.read = function(offsetX, offsetY, zoom, json) {
    var
      buildings = json.meshes,
      bld,
      color,
      data = {
        vertices: [],
        normals: [],
        colors: []
      },
      j, jl,
      polygon;

    for (var i = 0, il = buildings.length; i < il; i++) {
      bld = buildings[i];

      color = { r:bld.wallColor[0], g:bld.wallColor[1], b:bld.wallColor[2] };
      for (j = 0, jl = bld.walls.length; j < jl; j++) {
        polygon = transform(offsetX, offsetY, zoom, bld.walls[j]);
        Triangulate.polygon3d(data, [polygon], color);
      }

      color = { r:bld.roofColor[0], g:bld.roofColor[1], b:bld.roofColor[2] };
      for (j = 0, jl = bld.roofs.length; j < jl; j++) {
        polygon = transform(offsetX, offsetY, zoom, bld.roofs[j]);
        Triangulate.polygon3d(data, [polygon], color);
      }
    }

    return data;
  };

}());


function distance2(a, b) {
  var
    dx = a[0]-b[0],
    dy = a[1]-b[1];
  return dx*dx + dy*dy;
}

function isRotational(coordinates) {
  var
    ring = coordinates[0],
    length = ring.length;

  if (length < 16) {
    return false;
  }

  var i;

  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (i = 0; i < length; i++) {
    minX = Math.min(minX, ring[i][0]);
    maxX = Math.max(maxX, ring[i][0]);
    minY = Math.min(minY, ring[i][1]);
    maxY = Math.max(maxY, ring[i][1]);
  }

  var
    width = maxX-minX,
    height = (maxY-minY),
    ratio = width/height;

  if (ratio < 0.85 || ratio > 1.15) {
    return false;
  }

  var
    center = [ minX+width/2, minY+height/2 ],
    radius = (width+height)/4,
    sqRadius = radius*radius;

  for (i = 0; i < length; i++) {
    var dist = distance2(ring[i], center);
    if (dist/sqRadius < 0.8 || dist/sqRadius > 1.2) {
      return false;
    }
  }

  return true;
}

function getBBox(coordinates) {
  var ring = coordinates[0];
  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (var i = 0; i < ring.length; i++) {
    minX = Math.min(minX, ring[i][0]);
    maxX = Math.max(maxX, ring[i][0]);
    minY = Math.min(minY, ring[i][1]);
    maxY = Math.max(maxY, ring[i][1]);
  }
  return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
}

function rad(deg) {
  return deg * PI / 180;
}

function deg(rad) {
  return rad / PI * 180;
}

function unit(x, y, z) {
  var m = Math.sqrt(x*x + y*y + z*z);

  if (m === 0) {
    m = 0.00001;
  }

  return [x/m, y/m, z/m];
}

var Matrix = {

  create: function() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  },

  multiply: function(a, b) {
    var
      a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3],
      a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7],
      a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11],
      a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15],

      b00 = b[0],
      b01 = b[1],
      b02 = b[2],
      b03 = b[3],
      b10 = b[4],
      b11 = b[5],
      b12 = b[6],
      b13 = b[7],
      b20 = b[8],
      b21 = b[9],
      b22 = b[10],
      b23 = b[11],
      b30 = b[12],
      b31 = b[13],
      b32 = b[14],
      b33 = b[15]
    ;

    return [
      a00*b00 + a01*b10 + a02*b20 + a03*b30,
      a00*b01 + a01*b11 + a02*b21 + a03*b31,
      a00*b02 + a01*b12 + a02*b22 + a03*b32,
      a00*b03 + a01*b13 + a02*b23 + a03*b33,

      a10*b00 + a11*b10 + a12*b20 + a13*b30,
      a10*b01 + a11*b11 + a12*b21 + a13*b31,
      a10*b02 + a11*b12 + a12*b22 + a13*b32,
      a10*b03 + a11*b13 + a12*b23 + a13*b33,

      a20*b00 + a21*b10 + a22*b20 + a23*b30,
      a20*b01 + a21*b11 + a22*b21 + a23*b31,
      a20*b02 + a21*b12 + a22*b22 + a23*b32,
      a20*b03 + a21*b13 + a22*b23 + a23*b33,

      a30*b00 + a31*b10 + a32*b20 + a33*b30,
      a30*b01 + a31*b11 + a32*b21 + a33*b31,
      a30*b02 + a31*b12 + a32*b22 + a33*b32,
      a30*b03 + a31*b13 + a32*b23 + a33*b33
    ];
  },

  perspective: function(f, width, height, depth) {
//  var f = Math.tan((Math.PI-rad(fov))/2);
    return [
      2/width, 0,         0,        0,
      0,      -2/height,  0,        0,
      0,       40/depth,  -2/depth,  f * (-2/depth),
      -1,      1,         0,        1
    ];
  },

  ortho: function(width, height, depth) {
    return this.perspective(1, width, height, depth);
  },

  translate: function(matrix, x, y, z) {
    return this.multiply(matrix, [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]);
  },

  rotateX: function(matrix, angle) {
    var a = rad(angle);
    var c = Math.cos(a);
    var s = Math.sin(a);
    return this.multiply(matrix, [
      1,  0, 0, 0,
      0,  c, s, 0,
      0, -s, c, 0,
      0,  0, 0, 1
    ]);
  },

  rotateY: function(matrix, angle) {
    var a = rad(angle);
    var c = Math.cos(a);
    var s = Math.sin(a);
    return this.multiply(matrix, [
      c, 0, -s, 0,
      0, 1,  0, 0,
      s, 0,  c, 0,
      0, 0,  0, 1
    ]);
  },

  rotateZ: function(matrix, angle) {
    var a = rad(angle);
    var c = Math.cos(a);
    var s = Math.sin(a);
    return this.multiply(matrix, [
      c, -s, 0, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  },

  scale: function(matrix, x, y, z) {
    return this.multiply(matrix, [
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ]);
  },

  invert: function(a) {
    var
      a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
      a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
      a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
      a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,

      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }

    det = 1.0/det;

    return [
      (a11 * b11 - a12 * b10 + a13 * b09) * det,
      (a02 * b10 - a01 * b11 - a03 * b09) * det,
      (a31 * b05 - a32 * b04 + a33 * b03) * det,
      (a22 * b04 - a21 * b05 - a23 * b03) * det,
      (a12 * b08 - a10 * b11 - a13 * b07) * det,
      (a00 * b11 - a02 * b08 + a03 * b07) * det,
      (a32 * b02 - a30 * b05 - a33 * b01) * det,
      (a20 * b05 - a22 * b02 + a23 * b01) * det,
      (a10 * b10 - a11 * b08 + a13 * b06) * det,
      (a01 * b08 - a00 * b10 - a03 * b06) * det,
      (a30 * b04 - a31 * b02 + a33 * b00) * det,
      (a21 * b02 - a20 * b04 - a23 * b00) * det,
      (a11 * b07 - a10 * b09 - a12 * b06) * det,
      (a00 * b09 - a01 * b07 + a02 * b06) * det,
      (a31 * b01 - a30 * b03 - a32 * b00) * det,
      (a20 * b03 - a21 * b01 + a22 * b00) * det
    ];
  },

  invert3: function(a) {
    var
      a00 = a[0], a01 = a[1], a02 = a[2],
      a04 = a[4], a05 = a[5], a06 = a[6],
      a08 = a[8], a09 = a[9], a10 = a[10],

      l =  a10 * a05 - a06 * a09,
      o = -a10 * a04 + a06 * a08,
      m =  a09 * a04 - a05 * a08,

      det = a00*l + a01*o + a02*m;

    if (!det) {
      return null;
    }

    det = 1.0/det;

    return [
      l                    * det,
      (-a10*a01 + a02*a09) * det,
      ( a06*a01 - a02*a05) * det,
      o                    * det,
      ( a10*a00 - a02*a08) * det,
      (-a06*a00 + a02*a04) * det,
      m                    * det,
      (-a09*a00 + a01*a08) * det,
      ( a05*a00 - a01*a04) * det
    ];
  },

  transpose: function(a) {
    return [
      a[0],
      a[3],
      a[6],
      a[1],
      a[4],
      a[7],
      a[2],
      a[5],
      a[8]
    ];
  }
};


var GLRenderer = function(gl_) {
  gl = gl_;
  this.shaderPrograms.default = new Shader('default');
  this.onMapResize();
};

GLRenderer.prototype = {

  projections: {},
  shaderPrograms: {},

  clear: function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  },

  render: function() {
    var program;
		var i, il;

    if (Map.zoom < MIN_ZOOM) {
      return;
    }

    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.cullFace(gl.BACK);

//  gl.enable(gl.BLEND);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//  gl.disable(gl.DEPTH_TEST);

    program = this.shaderPrograms.default.use();

    // TODO: suncalc
    gl.uniform3fv(program.uniforms.uLightColor, [0.5, 0.5, 0.5]);
    gl.uniform3fv(program.uniforms.uLightDirection, unit(1, 1, 1));

    gl.uniform1f(program.uniforms.uAlpha, adjust(Map.zoom, STYLE.zoomAlpha, 'zoom', 'alpha'));

    var normalMatrix = Matrix.invert3(Matrix.create());
    gl.uniformMatrix3fv(program.uniforms.uNormalTransform, false, new Float32Array(Matrix.transpose(normalMatrix)));

    var dataItems = Data.items;
    for (i = 0, il = dataItems.length; i < il; i++) {
      dataItems[i].render(program, this.projections.perspective);
    }

    program.end();
  },

  onMapResize: function() {
    var size = Map.size;
    gl.viewport(0, 0, size.width, size.height);
    this.projections.perspective = Matrix.perspective(20, size.width, size.height, 40000);
    this.projections.ortho = Matrix.ortho(size.width, size.height, 40000);
  }
};


var Shader = function(name) {
  var config = SHADERS[name];

  this.id = gl.createProgram();
  this.name = name;

  if (!config.src) {
    throw new Error('missing source for shader "'+ name +'"');
  }

  this._attach(gl.VERTEX_SHADER,   config.src.vertex);
  this._attach(gl.FRAGMENT_SHADER, config.src.fragment);

  gl.linkProgram(this.id);

  if (!gl.getProgramParameter(this.id, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramParameter(this.id, gl.VALIDATE_STATUS) +'\n'+ gl.getError());
  }

  this.attributeNames = config.attributes;
  this.uniformNames = config.uniforms;
};

Shader.prototype = {
  _attach: function(type, src) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader));
    }

    gl.attachShader(this.id, shader);
  },

  use: function() {
    gl.useProgram(this.id);

    var i, name, loc;

    if (this.attributeNames) {
      this.attributes = {};
      for (i = 0; i < this.attributeNames.length; i++) {
        name = this.attributeNames[i];
        loc = gl.getAttribLocation(this.id, name);
        if (loc < 0) {
          console.error('could not locate attribute "'+ name +'" in shader "'+ this.name +'"');
        } else {
          gl.enableVertexAttribArray(loc);
          this.attributes[name] = loc;
        }
      }
    }

    if (this.uniformNames) {
      this.uniforms = {};
      for (i = 0; i < this.uniformNames.length; i++) {
        name = this.uniformNames[i];
        loc = gl.getUniformLocation(this.id, name);
        if (loc < 0) {
          console.error('could not locate uniform "'+ name +'" in shader "'+ this.name +'"');
        } else {
          this.uniforms[name] = loc;
        }
      }
    }

    return this;
  },

  end: function() {
    gl.useProgram(null);

    if (this.attributes) {
      for (var name in this.attributes) {
        gl.disableVertexAttribArray(this.attributes[name]);
      }
    }

    this.attributes = null;
    this.uniforms = null;
  }
};


var FrameBuffer = function(width, height, options) {
  options = options || {};

  this.width   = width;
  this.height  = height;
  this.texture = new Texture(width, height, options.texture);

  this.id = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.id, 0);

  this.renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
  this.renderbuffer.width = this.width;
  this.renderbuffer.height = this.height;
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);

  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
   throw new Error('This combination of framebuffer attachments does not work');
  }

  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  this.texture.end();
};

FrameBuffer.prototype = {
  use: function() {
    this.viewport = gl.getParameter(gl.VIEWPORT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.viewport(0, 0, this.width, this.height);
    return this;
  },

  end: function() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.viewport(this.viewport[0], this.viewport[1], this.viewport[2], this.viewport[3]);
  }
};


var Texture = function(width, height, options) {
  options = options || {};

  this.id = gl.createTexture();

  this.width  = width;
  this.height = height;
  this.format = options.format || gl.RGBA;
  this.type   = options.type || gl.UNSIGNED_BYTE;

  var magFilter = options.filter || options.magFilter || gl.LINEAR;
  var minFilter = options.filter || options.minFilter || gl.LINEAR;

  gl.bindTexture(gl.TEXTURE_2D, this.id);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.wrap || options.wrapS || gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.wrap || options.wrapT || gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null);
};

// Bind this texture to the given texture unit (0-7, defaults to 0).
Texture.prototype = {
  use: function(index) {
    gl.activeTexture(gl.TEXTURE0 + (index || 0));
    gl.bindTexture(gl.TEXTURE_2D, this.id);
    return this;
  },

  // Clear the given texture unit (0-7, defaults to 0).
  end: function(unit) {
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
};

/*
  var createTexture = function(img, useFilter) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    if (useFilter) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    }

//      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return texture;
  };

*/
return OSMBuildings; }(this));