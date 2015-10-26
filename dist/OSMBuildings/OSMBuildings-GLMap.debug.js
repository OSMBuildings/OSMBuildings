(function(global) {
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
aliceblue: '#f0f8ff',
antiquewhite: '#faebd7',
aqua: '#00ffff',
aquamarine: '#7fffd4',
azure: '#f0ffff',
beige: '#f5f5dc',
bisque: '#ffe4c4',
black: '#000000',
blanchedalmond: '#ffebcd',
blue: '#0000ff',
blueviolet: '#8a2be2',
brown: '#a52a2a',
burlywood: '#deb887',
cadetblue: '#5f9ea0',
chartreuse: '#7fff00',
chocolate: '#d2691e',
coral: '#ff7f50',
cornflowerblue: '#6495ed',
cornsilk: '#fff8dc',
crimson: '#dc143c',
cyan: '#00ffff',
darkblue: '#00008b',
darkcyan: '#008b8b',
darkgoldenrod: '#b8860b',
darkgray: '#a9a9a9',
darkgrey: '#a9a9a9',
darkgreen: '#006400',
darkkhaki: '#bdb76b',
darkmagenta: '#8b008b',
darkolivegreen: '#556b2f',
darkorange: '#ff8c00',
darkorchid: '#9932cc',
darkred: '#8b0000',
darksalmon: '#e9967a',
darkseagreen: '#8fbc8f',
darkslateblue: '#483d8b',
darkslategray: '#2f4f4f',
darkslategrey: '#2f4f4f',
darkturquoise: '#00ced1',
darkviolet: '#9400d3',
deeppink: '#ff1493',
deepskyblue: '#00bfff',
dimgray: '#696969',
dimgrey: '#696969',
dodgerblue: '#1e90ff',
firebrick: '#b22222',
floralwhite: '#fffaf0',
forestgreen: '#228b22',
fuchsia: '#ff00ff',
gainsboro: '#dcdcdc',
ghostwhite: '#f8f8ff',
gold: '#ffd700',
goldenrod: '#daa520',
gray: '#808080',
grey: '#808080',
green: '#008000',
greenyellow: '#adff2f',
honeydew: '#f0fff0',
hotpink: '#ff69b4',
indianred : '#cd5c5c',
indigo : '#4b0082',
ivory: '#fffff0',
khaki: '#f0e68c',
lavender: '#e6e6fa',
lavenderblush: '#fff0f5',
lawngreen: '#7cfc00',
lemonchiffon: '#fffacd',
lightblue: '#add8e6',
lightcoral: '#f08080',
lightcyan: '#e0ffff',
lightgoldenrodyellow: '#fafad2',
lightgray: '#d3d3d3',
lightgrey: '#d3d3d3',
lightgreen: '#90ee90',
lightpink: '#ffb6c1',
lightsalmon: '#ffa07a',
lightseagreen: '#20b2aa',
lightskyblue: '#87cefa',
lightslategray: '#778899',
lightslategrey: '#778899',
lightsteelblue: '#b0c4de',
lightyellow: '#ffffe0',
lime: '#00ff00',
limegreen: '#32cd32',
linen: '#faf0e6',
magenta: '#ff00ff',
maroon: '#800000',
mediumaquamarine: '#66cdaa',
mediumblue: '#0000cd',
mediumorchid: '#ba55d3',
mediumpurple: '#9370db',
mediumseagreen: '#3cb371',
mediumslateblue: '#7b68ee',
mediumspringgreen: '#00fa9a',
mediumturquoise: '#48d1cc',
mediumvioletred: '#c71585',
midnightblue: '#191970',
mintcream: '#f5fffa',
mistyrose: '#ffe4e1',
moccasin: '#ffe4b5',
navajowhite: '#ffdead',
navy: '#000080',
oldlace: '#fdf5e6',
olive: '#808000',
olivedrab: '#6b8e23',
orange: '#ffa500',
orangered: '#ff4500',
orchid: '#da70d6',
palegoldenrod: '#eee8aa',
palegreen: '#98fb98',
paleturquoise: '#afeeee',
palevioletred: '#db7093',
papayawhip: '#ffefd5',
peachpuff: '#ffdab9',
peru: '#cd853f',
pink: '#ffc0cb',
plum: '#dda0dd',
powderblue: '#b0e0e6',
purple: '#800080',
rebeccapurple: '#663399',
red: '#ff0000',
rosybrown: '#bc8f8f',
royalblue: '#4169e1',
saddlebrown: '#8b4513',
salmon: '#fa8072',
sandybrown: '#f4a460',
seagreen: '#2e8b57',
seashell: '#fff5ee',
sienna: '#a0522d',
silver: '#c0c0c0',
skyblue: '#87ceeb',
slateblue: '#6a5acd',
slategray: '#708090',
slategrey: '#708090',
snow: '#fffafa',
springgreen: '#00ff7f',
steelblue: '#4682b4',
tan: '#d2b48c',
teal: '#008080',
thistle: '#d8bfd8',
tomato: '#ff6347',
turquoise: '#40e0d0',
violet: '#ee82ee',
wheat: '#f5deb3',
white: '#ffffff',
whitesmoke: '#f5f5f5',
yellow: '#ffff00',
yellowgreen: '#9acd32'
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
  return Math.min(max, Math.max(0, v || 0));
}

/**
 * @param str, object can be in any of these: 'red', '#0099ff', 'rgb(64, 128, 255)', 'rgba(64, 128, 255, 0.5)', { r:0.2, g:0.3, b:0.9, a:1 }
 */
var Color = function(str) {
  str = str || '';

  if (typeof str === 'object') {
    var rgba = str;
    this.R = clamp(rgba.r, max);
    this.G = clamp(rgba.g, max);
    this.B = clamp(rgba.b, max);
    this.A = (rgba.a !== undefined ? clamp(rgba.a, 1) : 1);
    this.isValid = true;
  } else if (typeof str === 'string') {
    str = str.toLowerCase();
    str = w3cColors[str] || str;
    var m;
    if ((m = str.match(/^#?(\w{2})(\w{2})(\w{2})$/))) {
      this.R = parseInt(m[1], 16) / 255;
      this.G = parseInt(m[2], 16) / 255;
      this.B = parseInt(m[3], 16) / 255;
      this.A = 1;
      this.isValid = true;
    } else if ((m = str.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)(\D+([\d.]+))?\)/))) {
      this.R = parseInt(m[1], 10) / 255;
      this.G = parseInt(m[2], 10) / 255;
      this.B = parseInt(m[3], 10) / 255;
      this.A = m[4] ? parseFloat(m[5]) : 1;
      this.isValid = true;
    }
  }
};

Color.prototype = {

  toHSL: function() {
    var
      max = Math.max(this.R, this.G, this.B),
      min = Math.min(this.R, this.G, this.B),
      h, s, l = (max+min) / 2,
      d = max-min;

    if (!d) {
      h = s = 0; // achromatic
    } else {
      s = l > 0.5 ? d / (2-max-min) : d / (max+min);
      switch (max) {
        case this.R: h = (this.G-this.B) / d + (this.G < this.B ? 6 : 0); break;
        case this.G: h = (this.B-this.R) / d + 2; break;
        case this.B: h = (this.R-this.G) / d + 4; break;
      }
      h *= 60;
    }

    return { h:h, s:s, l:l };
  },

  fromHSL: function(hsl) {
  // h = clamp(hsl.h, 360),
  // s = clamp(hsl.s, 1),
  // l = clamp(hsl.l, 1),

    // achromatic
    if (hsl.s === 0) {
      this.R = hsl.l;
      this.G = hsl.l;
      this.B = hsl.l;
    } else {
      var
        q = hsl.l < 0.5 ? hsl.l * (1+hsl.s) : hsl.l + hsl.s - hsl.l*hsl.s,
        p = 2 * hsl.l-q;
      hsl.h /= 360;
      this.R = hue2rgb(p, q, hsl.h + 1/3);
      this.G = hue2rgb(p, q, hsl.h);
      this.B = hue2rgb(p, q, hsl.h - 1/3);
    }

    return this;
  },

  toString: function() {
    if (this.A === 1) {
      return '#' + ((1 <<24) + (Math.round(this.R*255) <<16) + (Math.round(this.G*255) <<8) + Math.round(this.B*255)).toString(16).slice(1, 7);
    }
    return 'rgba(' + [Math.round(this.R*255), Math.round(this.G*255), Math.round(this.B*255), this.A.toFixed(2)].join(',') + ')';
  },

  toArray: function() {
    return [this.R, this.G, this.B];
  },

  hue: function(h) {
    var hsl = this.toHSL();
    hsl.h *= h;
    this.fromHSL(hsl);
    return this;
  },

  saturation: function(s) {
    debugger
    var hsl = this.toHSL();
    hsl.s *= s;
    this.fromHSL(hsl);
    return this;
  },

  lightness: function(l) {
    var hsl = this.toHSL();
    hsl.l *= l;
    this.fromHSL(hsl);
    return this;
  },

  alpha: function(a) {
    this.A *= a;
    return this;
  }
};
return Color; }(this));

//var ext = GL.getExtension('WEBGL_lose_context');
//ext.loseContext();

var GLX = function(container, width, height) {
  var canvas = document.createElement('CANVAS');
  canvas.style.position = 'absolute';
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  var options = {
    antialias: true,
    depth: true,
    premultipliedAlpha: false
  };

  var context;

  try {
    context = canvas.getContext('webgl', options);
  } catch (ex) {}
  if (!context) {
    try {
      context = canvas.getContext('experimental-webgl', options);
    } catch (ex) {}
  }
  if (!context) {
    throw new Error('WebGL not supported');
  }

  canvas.addEventListener('webglcontextlost', function(e) {
    console.warn('context lost');
  });

  canvas.addEventListener('webglcontextrestored', function(e) {
    console.warn('context restored');
  });

  context.viewport(0, 0, width, height);
  context.cullFace(context.BACK);
  context.enable(context.CULL_FACE);
  context.enable(context.DEPTH_TEST);
  context.clearColor(0.5, 0.5, 0.5, 1);

  context.anisotropyExtension = context.getExtension('EXT_texture_filter_anisotropic');
  if (context.anisotropyExtension) {
    context.anisotropyExtension.maxAnisotropyLevel = context.getParameter( 
      context.anisotropyExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT
    );
  }

  return GLX.use(context);
};

GLX.use = function(context) {

  return (function(GL) {

    var glx = {};

    glx.context = context;

    glx.start = function(render) {
      return setInterval(function() {
        requestAnimationFrame(render);
      }, 17);
    };

    glx.stop = function(loop) {
      clearInterval(loop);
    };

    glx.destroy = function(GL) {
      GL.canvas.parentNode.removeChild(GL.canvas);
      GL.canvas = null;
    };


glx.util = {};

glx.util.nextPowerOf2 = function(n) {
  n--;
  n |= n >> 1;  // handle  2 bit numbers
  n |= n >> 2;  // handle  4 bit numbers
  n |= n >> 4;  // handle  8 bit numbers
  n |= n >> 8;  // handle 16 bit numbers
  n |= n >> 16; // handle 32 bit numbers
  n++;
  return n;
};

glx.util.calcNormal = function(ax, ay, az, bx, by, bz, cx, cy, cz) {
  var d1x = ax-bx;
  var d1y = ay-by;
  var d1z = az-bz;

  var d2x = bx-cx;
  var d2y = by-cy;
  var d2z = bz-cz;

  var nx = d1y*d2z - d1z*d2y;
  var ny = d1z*d2x - d1x*d2z;
  var nz = d1x*d2y - d1y*d2x;

  return this.calcUnit(nx, ny, nz);
};

glx.util.calcUnit = function(x, y, z) {
  var m = Math.sqrt(x*x + y*y + z*z);

  if (m === 0) {
    m = 0.00001;
  }

  return [x/m, y/m, z/m];
};


glx.Buffer = function(itemSize, data) {
  this.id = GL.createBuffer();
  this.itemSize = itemSize;
  this.numItems = data.length/itemSize;
  GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
  GL.bufferData(GL.ARRAY_BUFFER, data, GL.STATIC_DRAW);
  data = null;
};

glx.Buffer.prototype = {
  enable: function() {
    GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
  },

  destroy: function() {
    GL.deleteBuffer(this.id);
    this.id = null;
  }
};


glx.Framebuffer = function(width, height) {
  this.setSize(width, height);
};

glx.Framebuffer.prototype = {

  setSize: function(width, height) {
    this.frameBuffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);

    width = glx.util.nextPowerOf2(width);
    height= glx.util.nextPowerOf2(height);
    
    // already has the right size
    if (width === this.width && height === this.height) {
      return;
    }

    this.width  = width;
    this.height = height;

    this.renderBuffer = GL.createRenderbuffer();
    GL.bindRenderbuffer(GL.RENDERBUFFER, this.renderBuffer);
    GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, width, height);

    if (this.renderTexture) {
      this.renderTexture.destroy();
    }

    this.renderTexture = new glx.texture.Data(width, height);

    GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.renderTexture.id, 0);

    if (GL.checkFramebufferStatus(GL.FRAMEBUFFER) !== GL.FRAMEBUFFER_COMPLETE) {
      throw new Error('This combination of framebuffer attachments does not work');
    }

    GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
  },

  enable: function() {
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);
    GL.bindRenderbuffer(GL.RENDERBUFFER, this.renderBuffer);
  },

  disable: function() {
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    GL.bindRenderbuffer(GL.RENDERBUFFER, null);
  },

  getData: function() {
    var imageData = new Uint8Array(this.width*this.height*4);
    GL.readPixels(0, 0, this.width, this.height, GL.RGBA, GL.UNSIGNED_BYTE, imageData);
    return imageData;
  },

  destroy: function() {
    if (this.renderTexture) {
      this.renderTexture.destroy();
    }
  }
};


glx.Shader = function(config) {
  this.id = GL.createProgram();

  this.attach(GL.VERTEX_SHADER,   config.vertexShader);
  this.attach(GL.FRAGMENT_SHADER, config.fragmentShader);

  GL.linkProgram(this.id);

  if (!GL.getProgramParameter(this.id, GL.LINK_STATUS)) {
    throw new Error(GL.getProgramParameter(this.id, GL.VALIDATE_STATUS) +'\n'+ GL.getError());
  }

  this.attributeNames = config.attributes;
  this.uniformNames   = config.uniforms;
};

glx.Shader.prototype = {

  locateAttribute: function(name) {
    var loc = GL.getAttribLocation(this.id, name);
    if (loc < 0) {
      console.error('unable to locate attribute "'+ name +'" in shader');
      return;
    }
    GL.enableVertexAttribArray(loc);
    this.attributes[name] = loc;
  },

  locateUniform: function(name) {
    var loc = GL.getUniformLocation(this.id, name);
    if (loc < 0) {
      console.error('unable to locate uniform "'+ name +'" in shader');
      return;
    }
    this.uniforms[name] = loc;
  },

  attach: function(type, src) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, src);
    GL.compileShader(shader);

    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      throw new Error(GL.getShaderInfoLog(shader));
    }

    GL.attachShader(this.id, shader);
  },

  enable: function() {
    GL.useProgram(this.id);

    var i;

    if (this.attributeNames) {
      this.attributes = {};
      for (i = 0; i < this.attributeNames.length; i++) {
        this.locateAttribute(this.attributeNames[i]);
      }
    }

    if (this.uniformNames) {
      this.uniforms = {};
      for (i = 0; i < this.uniformNames.length; i++) {
        this.locateUniform(this.uniformNames[i]);
      }
    }

    return this;
  },

  disable: function() {
    if (this.attributes) {
      for (var name in this.attributes) {
        GL.disableVertexAttribArray(this.attributes[name]);
      }
    }

    this.attributes = null;
    this.uniforms = null;
  },
  
  destroy: function() {
    this.disable();
    this.id = null;
  }
};


glx.Matrix = function(data) {
  if (data) {
    this.data = new Float32Array(data);
  } else {
    this.identity();
  }
};

(function() {

  function rad(a) {
    return a * Math.PI/180;
  }

  function multiply(res, a, b) {
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
      b33 = b[15];

    res[ 0] = a00*b00 + a01*b10 + a02*b20 + a03*b30;
    res[ 1] = a00*b01 + a01*b11 + a02*b21 + a03*b31;
    res[ 2] = a00*b02 + a01*b12 + a02*b22 + a03*b32;
    res[ 3] = a00*b03 + a01*b13 + a02*b23 + a03*b33;

    res[ 4] = a10*b00 + a11*b10 + a12*b20 + a13*b30;
    res[ 5] = a10*b01 + a11*b11 + a12*b21 + a13*b31;
    res[ 6] = a10*b02 + a11*b12 + a12*b22 + a13*b32;
    res[ 7] = a10*b03 + a11*b13 + a12*b23 + a13*b33;

    res[ 8] = a20*b00 + a21*b10 + a22*b20 + a23*b30;
    res[ 9] = a20*b01 + a21*b11 + a22*b21 + a23*b31;
    res[10] = a20*b02 + a21*b12 + a22*b22 + a23*b32;
    res[11] = a20*b03 + a21*b13 + a22*b23 + a23*b33;

    res[12] = a30*b00 + a31*b10 + a32*b20 + a33*b30;
    res[13] = a30*b01 + a31*b11 + a32*b21 + a33*b31;
    res[14] = a30*b02 + a31*b12 + a32*b22 + a33*b32;
    res[15] = a30*b03 + a31*b13 + a32*b23 + a33*b33;
  }

  glx.Matrix.prototype = {

    identity: function() {
      this.data = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
      return this;
    },

    multiply: function(m) {
      multiply(this.data, this.data, m.data);
      return this;
    },

    translate: function(x, y, z) {
      multiply(this.data, this.data, [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
      ]);
      return this;
    },

    rotateX: function(angle) {
      var a = rad(angle), c = Math.cos(a), s = Math.sin(a);
      multiply(this.data, this.data, [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
      ]);
      return this;
    },

    rotateY: function(angle) {
      var a = rad(angle), c = Math.cos(a), s = Math.sin(a);
      multiply(this.data, this.data, [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
      ]);
      return this;
    },

    rotateZ: function(angle) {
      var a = rad(angle), c = Math.cos(a), s = Math.sin(a);
      multiply(this.data, this.data, [
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
      return this;
    },

    scale: function(x, y, z) {
      multiply(this.data, this.data, [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
      ]);
      return this;
    }
  };

  glx.Matrix.multiply = function(a, b) {
    var res = new Float32Array(16);
    multiply(res, a.data, b.data);
    return res;
  };

  glx.Matrix.Perspective = function(fov, aspect, near, far) {
    var f = 1/Math.tan(fov*(Math.PI/180)/2), nf = 1/(near - far);
    return new glx.Matrix([
      f/aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near)*nf, -1,
      0, 0, (2*far*near)*nf, 0
    ]);
  };

  glx.Matrix.invert3 = function(a) {
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
  };

  glx.Matrix.transpose = function(a) {
    return new Float32Array([
      a[0],
      a[3],
      a[6],
      a[1],
      a[4],
      a[7],
      a[2],
      a[5],
      a[8]
    ]);
  };

  // glx.Matrix.transform = function(x, y, z, m) {
  //   var X = x*m[0] + y*m[4] + z*m[8]  + m[12];
  //   var Y = x*m[1] + y*m[5] + z*m[9]  + m[13];
  //   var Z = x*m[2] + y*m[6] + z*m[10] + m[14];
  //   var W = x*m[3] + y*m[7] + z*m[11] + m[15];
  //   return {
  //     x: (X/W +1) / 2,
  //     y: (Y/W +1) / 2
  //   };
  // };

  glx.Matrix.transform = function(m) {
    var X = m[12];
    var Y = m[13];
    var Z = m[14];
    var W = m[15];
    return {
      x: (X/W + 1) / 2,
      y: (Y/W + 1) / 2,
      z: (Z/W + 1) / 2
    };
  };

  glx.Matrix.invert = function(a) {
    var
      res = new Float32Array(16),

      a00 = a[ 0], a01 = a[ 1], a02 = a[ 2], a03 = a[ 3],
      a10 = a[ 4], a11 = a[ 5], a12 = a[ 6], a13 = a[ 7],
      a20 = a[ 8], a21 = a[ 9], a22 = a[10], a23 = a[11],
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

      // Calculate the determinant
      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return;
    }

    det = 1 / det;

    res[ 0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    res[ 1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    res[ 2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    res[ 3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;

    res[ 4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    res[ 5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    res[ 6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    res[ 7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;

    res[ 8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    res[ 9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    res[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    res[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;

    res[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    res[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    res[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    res[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return res;
  };

}());


glx.texture = {};


glx.texture.Image = function() {
  this.id = GL.createTexture();
  GL.bindTexture(GL.TEXTURE_2D, this.id);


//GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
//GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

  GL.bindTexture(GL.TEXTURE_2D, null);
};

glx.texture.Image.prototype = {

  clamp: function(image, maxSize) {
    if (image.width <= maxSize && image.height <= maxSize) {
      return image;
    }

    var w = maxSize, h = maxSize;
    var ratio = image.width/image.height;
    // TODO: if other dimension doesn't fit to POT after resize, there is still trouble
    if (ratio < 1) {
      w = Math.round(h*ratio);
    } else {
      h = Math.round(w/ratio);
    }

    var canvas = document.createElement('CANVAS');
    canvas.width  = w;
    canvas.height = h;

    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  },

  load: function(url, callback) {
    var image = new Image();
    image.crossOrigin = '*';
    image.onload = function() {
      this.set(image);
      if (callback) {
        callback(image);
      }
    }.bind(this);
    image.onerror = function() {
      if (callback) {
        callback();
      }
    };
    image.src = url;
    return this;
  },

  color: function(color) {
    GL.bindTexture(GL.TEXTURE_2D, this.id);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, new Uint8Array([color[0]*255, color[1]*255, color[2]*255, (color[3] === undefined ? 1 : color[3])*255]));
    GL.bindTexture(GL.TEXTURE_2D, null);
    return this;
  },

  set: function(image) {
    if (!this.id) {
      // texture has been destroyed
      return;
    }

    image = this.clamp(image, GL.getParameter(GL.MAX_TEXTURE_SIZE));

    GL.bindTexture(GL.TEXTURE_2D, this.id);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
    GL.generateMipmap(GL.TEXTURE_2D);

    if (GL.anisotropyExtension) {
      GL.texParameterf(GL.TEXTURE_2D, GL.anisotropyExtension.TEXTURE_MAX_ANISOTROPY_EXT, GL.anisotropyExtension.maxAnisotropyLevel);
    }

    GL.bindTexture(GL.TEXTURE_2D, null);
    return this;
  },

  enable: function(index) {
    if (!this.id) {
      return;
    }
    GL.activeTexture(GL.TEXTURE0 + (index || 0));
    GL.bindTexture(GL.TEXTURE_2D, this.id);
    return this;
  },

  destroy: function() {
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.deleteTexture(this.id);
    this.id = null;
  }
};


glx.texture.Data = function(width, height, data, options) {
  //options = options || {};

  this.id = GL.createTexture();
  GL.bindTexture(GL.TEXTURE_2D, this.id);

  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);

  //if (options.flipY) {
  //  GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
  //}

  var bytes = null;

  if (data) {
    var length = width*height*4;
    bytes = new Uint8Array(length);
    bytes.set(data.subarray(0, length));
  }

  GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, bytes);
  GL.bindTexture(GL.TEXTURE_2D, null);
};

glx.texture.Data.prototype = {

  enable: function(index) {
    GL.activeTexture(GL.TEXTURE0 + (index || 0));
    GL.bindTexture(GL.TEXTURE_2D, this.id);
    return this;
  },

  destroy: function() {
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.deleteTexture(this.id);
    this.id = null;
  }
};


glx.mesh = {};

glx.mesh.addQuad = function(data, a, b, c, d, color) {
  this.addTriangle(data, a, b, c, color);
  this.addTriangle(data, c, d, a, color);
};

glx.mesh.addTriangle = function(data, a, b, c, color) {
  data.vertices.push(
    a[0], a[1], a[2],
    b[0], b[1], b[2],
    c[0], c[1], c[2]
  );

  var n = glx.util.calcNormal(
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
    color[0], color[1], color[2], color[3],
    color[0], color[1], color[2], color[3],
    color[0], color[1], color[2], color[3]
  );
};


glx.mesh.Triangle = function(size, color) {

  var data = {
    vertices: [],
    normals: [],
    colors: []
  };

  var a = [-size/2, -size/2, 0];
  var b = [ size/2, -size/2, 0];
  var c = [ size/2,  size/2, 0];

  glx.mesh.addTriangle(data, a, b, c, color);

  this.vertexBuffer = new glx.Buffer(3, new Float32Array(data.vertices));
  this.normalBuffer = new glx.Buffer(3, new Float32Array(data.normals));
  this.colorBuffer  = new glx.Buffer(4, new Float32Array(data.colors));

 	this.transform = new glx.Matrix();
};


glx.mesh.Plane = function(size, color) {

  var data = {
    vertices: [],
    normals: [],
    colors: []
  };

  var a = [-size/2, -size/2, 0];
  var b = [ size/2, -size/2, 0];
  var c = [ size/2,  size/2, 0];
  var d = [-size/2,  size/2, 0];

  glx.mesh.addQuad(data, a, b, c, d, color);

  this.vertexBuffer = new glx.Buffer(3, new Float32Array(data.vertices));
  this.normalBuffer = new glx.Buffer(3, new Float32Array(data.normals));
  this.colorBuffer  = new glx.Buffer(4, new Float32Array(data.colors));

 	this.transform = new glx.Matrix();
};


glx.mesh.Cube = function(size, color) {

  var data = {
    vertices: [],
    normals: [],
    colors: []
  };

  var a = [-size/2, -size/2, -size/2];
  var b = [ size/2, -size/2, -size/2];
  var c = [ size/2,  size/2, -size/2];
  var d = [-size/2,  size/2, -size/2];

  var A = [-size/2, -size/2, size/2];
  var B = [ size/2, -size/2, size/2];
  var C = [ size/2,  size/2, size/2];
  var D = [-size/2,  size/2, size/2];

  glx.mesh.addQuad(data, a, b, c, d, color);
  glx.mesh.addQuad(data, A, B, C, D, color);
  glx.mesh.addQuad(data, a, b, B, A, color);
  glx.mesh.addQuad(data, b, c, C, B, color);
  glx.mesh.addQuad(data, c, d, D, C, color);
  glx.mesh.addQuad(data, d, a, A, D, color);

  this.vertexBuffer = new glx.Buffer(3, new Float32Array(data.vertices));
  this.normalBuffer = new glx.Buffer(3, new Float32Array(data.normals));
  this.colorBuffer  = new glx.Buffer(4, new Float32Array(data.colors));

  this.transform = new glx.Matrix();
};


    return glx;

  }(context));
};

if (typeof define === 'function') {
  define([], GLX);
} else if (typeof exports === 'object') {
  module.exports = GLX;
} else {
  global.GLX = GLX;
}

var APP;
var MAP, glx, gl;

var OSMBuildings = function(options) {
  APP = this; // references to this. Should make other globals obsolete.

  options = options || {};

  if (options.style) {
    this.setStyle(options.style);
  }

  APP.baseURL = options.baseURL || '.';

  render.bendRadius = 500;
  render.bendDistance = 500;

  render.backgroundColor = new Color(options.backgroundColor || BACKGROUND_COLOR).toArray();
  render.fogColor        = new Color(options.fogColor        || FOG_COLOR).toArray();
  render.highlightColor  = new Color(options.highlightColor  || HIGHLIGHT_COLOR).toArray();

  render.Buildings.showBackfaces = options.showBackfaces;

  // can be: 'quality', 'performance'
  render.optimize = options.optimize || 'quality';

  this.attribution = options.attribution || OSMBuildings.ATTRIBUTION;

  APP.minZoom = parseFloat(options.minZoom) || 15;
  APP.maxZoom = parseFloat(options.maxZoom) || 22;
  if (APP.maxZoom < APP.minZoom) {
    APP.maxZoom = APP.minZoom;
  }
};

OSMBuildings.VERSION = '1.0.1';
OSMBuildings.ATTRIBUTION = '© OSM Buildings <a href="http://osmbuildings.org">http://osmbuildings.org</a>';

OSMBuildings.prototype = {

  on: function(type, fn) {
    Events.on(type, fn);
    return this;
  },

  off: function(type, fn) {
    Events.off(type, fn);
  },

  addTo: function(map) {
    MAP = map;
    glx = new GLX(MAP.container, MAP.width, MAP.height);
    gl = glx.context;

    MAP.addLayer(this);

    render.start();

    return this;
  },

  remove: function() {
    render.stop();
    MAP.removeLayer(this);
    MAP = null;
  },

  setStyle: function(style) {
    //render.backgroundColor = new Color(options.backgroundColor || BACKGROUND_COLOR).toArray();
    //render.fogColor        = new Color(options.fogColor        || FOG_COLOR).toArray();
    //render.highlightColor  = new Color(options.highlightColor  || HIGHLIGHT_COLOR).toArray();

    DEFAULT_COLOR = style.color || style.wallColor || DEFAULT_COLOR;
    //if (color.isValid) {
    //  DEFAULT_COLOR = color.toArray();
    //}
    return this;
  },

  transform: function(latitude, longitude, elevation) {
    var
      pos = MAP.project(latitude, longitude, TILE_SIZE*Math.pow(2, MAP.zoom)),
      x = pos.x-MAP.center.x,
      y = pos.y-MAP.center.y;

    var scale = 1/Math.pow(2, 16 - MAP.zoom);
    var modelMatrix = new glx.Matrix()
      .translate(0, 0, elevation)
      .scale(scale, scale, scale*HEIGHT_SCALE)
      .translate(x, y, 0);

    var mvp = glx.Matrix.multiply(modelMatrix, render.viewProjMatrix);
    var t = glx.Matrix.transform(mvp);
    return { x: t.x*MAP.width, y: MAP.height - t.y*MAP.height, z: t.z }; // takes current cam pos into account.
  },

  addOBJ: function(url, position, options) {
    return new mesh.OBJ(url, position, options);
  },

  addGeoJSON: function(url, options) {
    return new mesh.GeoJSON(url, options);
  },

  // TODO: allow more data layers later on
  addGeoJSONTiles: function(url, options) {
    options = options || {};
    options.fixedZoom = options.fixedZoom || 16;
    APP._dataGrid = new Grid(url, data.Tile, options);
    return APP._dataGrid;
  },

  addMapTiles: function(url, options) {
    APP._basemapGrid = new Grid(url, basemap.Tile, options);
    return APP._basemapGrid;
  },

  highlight: function(id) {
    render.Buildings.highlightID = id ? render.Interaction.idToColor(id) : null;
  },

  show: function(selector, duration) {
    Filter.remove('hidden', selector, duration);
    return this;
  },

  hide: function(selector, duration) {
    Filter.add('hidden', selector, duration);
    return this;
  },

  getTarget: function(x, y) {
    return render.Interaction.getTarget(x, y);
  },

  destroy: function() {
    render.destroy();
    Events.destroy();
    if (APP._basemapGrid) APP._basemapGrid.destroy();
    if (APP._dataGrid)    APP._dataGrid.destroy();
  }
};

//*****************************************************************************

if (typeof global.define === 'function') {
  global.define([], OSMBuildings);
} else if (typeof global.exports === 'object') {
  global.module.exports = OSMBuildings;
} else {
  global.OSMBuildings = OSMBuildings;
}


var Events = {};

(function() {

  var listeners = {};

  Events.emit = function(type, payload) {
    if (!listeners[type]) {
      return;
    }

    var l = listeners[type];

    requestAnimationFrame(function() {
      for (var i = 0, il = l.length; i < il; i++) {
        l[i](payload);
      }
    });
  };

  Events.on = function(type, fn) {
    if (!listeners[type]) {
      listeners[type] = [];
    }
    listeners[type].push(fn);
  };

  Events.off = function(type, fn) {
    if (!listeners[type]) {
      return;
    }
    var l = listeners[type];
    for (var i = 0; i < l.length; i++) {
      if (l[i] === fn) {
        l.splice(i, 1);
        return;
      }
    }
  };

  Events.destroy = function() {
    listeners = {};
  };

}());


var Activity = {};

// TODO: could turn into a public loading handler
// OSMB.loader - stop(), start(), isBusy(), events..

(function() {

  var count = 0;
  var debounce;

  Activity.setBusy = function() {
    //console.log('setBusy', count);

    if (!count) {
      if (debounce) {
        clearTimeout(debounce);
        debounce = null;
      } else {
        Events.emit('busy');
      }
    }
    count++;
  };

  Activity.setIdle = function() {
    if (!count) {
      return;
    }

    count--;
    if (!count) {
      debounce = setTimeout(function() {
        debounce = null;
        Events.emit('idle');
      }, 33);
    }

    //console.log('setIdle', count);
  };

  Activity.isBusy = function() {
    return !!count;
  };

}());


var TILE_SIZE = 256;

var DEFAULT_HEIGHT = 10;
var HEIGHT_SCALE = 0.7;

var DEFAULT_COLOR = 'rgb(220, 210, 200)';
var HIGHLIGHT_COLOR = '#f08000';
var FOG_COLOR = '#f0f8ff';
var BACKGROUND_COLOR = '#efe8e0';

var document = global.document;

var EARTH_RADIUS = 6378137;
var EARTH_CIRCUMFERENCE = EARTH_RADIUS*Math.PI*2;


var Request = {};

(function() {

  var queue = {};

  function load(url, callback) {
    if (queue[url]) {
      return queue[url];
    }

    var req = new XMLHttpRequest();

    req.onreadystatechange = function() {
      if (req.readyState !== 4) {
        return;
      }

      delete queue[url];

      if (!req.status || req.status<200 || req.status>299) {
        return;
      }

      callback(req);
    };

    queue[url] = req;
    req.open('GET', url);
    req.send(null);

    return {
      abort: function() {
        if (queue[url]) {
          req.abort();
          delete queue[url];
        }
      }
    };
  }

  //***************************************************************************

  Request.getText = function(url, callback) {
    return load(url, function(res) {
      if (res.responseText !== undefined) {
        callback(res.responseText);
      }
    });
  };

  Request.getXML = function(url, callback) {
    return load(url, function(res) {
      if (res.responseXML !== undefined) {
        callback(res.responseXML);
      }
    });
  };

  Request.getJSON = function(url, callback) {
    return load(url, function(res) {
      if (res.responseText) {
        var json;
        try {
          json = JSON.parse(res.responseText);
        } catch(ex) {
          console.warn('Could not parse JSON from '+ url +'\n'+ ex.message);
        }
        callback(json);
      }
    });
  };

  Request.abortAll = function() {
    for (var url in queue) {
      queue[url].abort();
    }
    queue = {};
  };

  Request.destroy = function() {
    this.abortAll();
  };

}());


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

var Shaders = {"interaction":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec3 aID;\nattribute vec4 aFilter;\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjMatrix;\nuniform mat4 uMatrix;\nuniform float uFogRadius;\nuniform float uTime;\nvarying vec4 vColor;\nuniform float uBendRadius;\nuniform float uBendDistance;\nvoid main() {\n  if (aFilter.a == 0.0) {\n    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);\n    vColor = vec4(0.0, 0.0, 0.0, 0.0);\n  } else {\n    //*** bending ***************************************************************\n  //  vec4 mwPosition = uViewMatrix * uModelMatrix * aPosition;\n  //\n  //  float innerRadius = uBendRadius + mwPosition.y;\n  //  float depth = abs(mwPosition.z);\n  //  float s = depth-uBendDistance;\n  //  float theta = min(max(s, 0.0)/uBendRadius, halfPi);\n  //\n  //  // halfPi*uBendRadius, not halfPi*innerRadius, because the \"base\" of a building\n  //  // travels the full uBendRadius path\n  //  float newY = cos(theta)*innerRadius - uBendRadius - max(s-halfPi*uBendRadius, 0.0);\n  //  float newZ = normalize(mwPosition.z) * (min(depth, uBendDistance) + sin(theta)*innerRadius);\n  //\n  //  vec4 newPosition = vec4(mwPosition.x, newY, newZ, 1.0);\n  //  gl_Position = uProjMatrix * newPosition;\n    gl_Position = uMatrix * aPosition;\n    vec4 mPosition = vec4(uModelMatrix * aPosition);\n    float distance = length(mPosition);\n    if (distance > uFogRadius) {\n      vColor = vec4(0.0, 0.0, 0.0, 0.0);\n    } else {\n      vColor = vec4(aID, 1.0);\n    }\n  }\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nvarying vec4 vColor;\nvoid main() {\n  gl_FragColor = vColor;\n}\n"},"buildings":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec3 aNormal;\nattribute vec3 aColor;\nattribute vec4 aFilter;\nattribute vec3 aID;\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjMatrix;\nuniform mat4 uMatrix;\nuniform mat3 uNormalTransform;\nuniform vec3 uLightDirection;\nuniform vec3 uLightColor;\nuniform vec3 uFogColor;\nuniform float uFogRadius;\nuniform vec3 uHighlightColor;\nuniform vec3 uHighlightID;\nuniform float uTime;\nvarying vec3 vColor;\nfloat fogBlur = 200.0;\nfloat gradientHeight = 90.0;\nfloat gradientStrength = 0.4;\nuniform float uBendRadius;\nuniform float uBendDistance;\nvoid main() {\n  float t = clamp((uTime-aFilter.r) / (aFilter.g-aFilter.r), 0.0, 1.0);\n  //float f = aFilter.b + (aFilter.a-aFilter.b) * t;\n  float f = t;\n  if (f == 0.0) {\n    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);\n    vColor = vec3(0.0, 0.0, 0.0);\n  } else {\n    vec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\n    //*** bending ***************************************************************\n  //  vec4 mwPosition = uViewMatrix * uModelMatrix * aPosition;\n  //\n  //  float innerRadius = uBendRadius + mwPosition.y;\n  //  float depth = abs(mwPosition.z);\n  //  float s = depth-uBendDistance;\n  //  float theta = min(max(s, 0.0)/uBendRadius, halfPi);\n  //\n  //  // halfPi*uBendRadius, not halfPi*innerRadius, because the \"base\" of a building\n  //  // travels the full uBendRadius path\n  //  float newY = cos(theta)*innerRadius - uBendRadius - max(s-halfPi*uBendRadius, 0.0);\n  //  float newZ = normalize(mwPosition.z) * (min(depth, uBendDistance) + sin(theta)*innerRadius);\n  //\n  //  vec4 newPosition = vec4(mwPosition.x, newY, newZ, 1.0);\n  //  gl_Position = uProjMatrix * newPosition;\n    gl_Position = uMatrix * pos;\n    //*** highlight object ******************************************************\n    vec3 color = aColor;\n    if (uHighlightID.r == aID.r && uHighlightID.g == aID.g && uHighlightID.b == aID.b) {\n      color = mix(aColor, uHighlightColor, 0.5);\n    }\n    //*** light intensity, defined by light direction on surface ****************\n    vec3 transformedNormal = aNormal * uNormalTransform;\n    float lightIntensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;\n    color = color + uLightColor * lightIntensity;\n    //*** vertical shading ******************************************************\n    float verticalShading = clamp((gradientHeight-pos.z) / (gradientHeight/gradientStrength), 0.0, gradientStrength);\n    //*** fog *******************************************************************\n    vec4 mPosition = uModelMatrix * pos;\n    float distance = length(mPosition);\n    float fogIntensity = (distance - uFogRadius) / fogBlur + 1.1; // <- shifts blur in/out\n    fogIntensity = clamp(fogIntensity, 0.0, 1.0);\n    //***************************************************************************\n    vColor = mix(color-verticalShading, uFogColor, fogIntensity);\n  }\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nvarying vec3 vColor;\nvoid main() {\n  gl_FragColor = vec4(vColor, 1.0);\n}\n"},"skydome":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjMatrix;\nuniform mat4 uMatrix;\nvarying vec2 vTexCoord;\nvarying float vFogIntensity;\nfloat gradientHeight = 10.0;\nfloat gradientStrength = 1.0;\nuniform float uBendRadius;\nuniform float uBendDistance;\nvoid main() {\n  //*** bending ***************************************************************\n//  vec4 mwPosition = uViewMatrix * uModelMatrix * aPosition;\n//\n//  float innerRadius = uBendRadius + mwPosition.y;\n//  float depth = abs(mwPosition.z);\n//  float s = depth-uBendDistance;\n//  float theta = min(max(s, 0.0)/uBendRadius, halfPi);\n//\n//  // halfPi*uBendRadius, not halfPi*innerRadius, because the \"base\" of a building\n//  // travels the full uBendRadius path\n//  float newY = cos(theta)*innerRadius - uBendRadius - max(s-halfPi*uBendRadius, 0.0);\n//  float newZ = normalize(mwPosition.z) * (min(depth, uBendDistance) + sin(theta)*innerRadius);\n//\n//  vec4 newPosition = vec4(mwPosition.x, newY, newZ, 1.0);\n//  gl_Position = uProjMatrix * newPosition;\n  gl_Position = uMatrix * aPosition;\n  vTexCoord = aTexCoord;\n  vFogIntensity = clamp((gradientHeight-aPosition.z) / (gradientHeight/gradientStrength), 0.0, gradientStrength);\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform vec3 uFogColor;\nvarying vec2 vTexCoord;\nvarying float vFogIntensity;\nvoid main() {\n  vec3 color = vec3(texture2D(uTexIndex, vec2(vTexCoord.x, -vTexCoord.y)));\n  gl_FragColor = vec4(mix(color, uFogColor, vFogIntensity), 1.0);\n}\n"},"basemap":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjMatrix;\nuniform mat4 uMatrix;\nuniform float uFogRadius;\nvarying vec2 vTexCoord;\nvarying float vFogIntensity;\nfloat fogBlur = 200.0;\nuniform float uBendRadius;\nuniform float uBendDistance;\nvoid main() {\n  //*** bending ***************************************************************\n//  vec4 mwPosition = uViewMatrix * uModelMatrix * aPosition;\n//\n//  float innerRadius = uBendRadius + mwPosition.y;\n//  float depth = abs(mwPosition.z);\n//  float s = depth-uBendDistance;\n//  float theta = min(max(s, 0.0)/uBendRadius, halfPi);\n//\n//  // halfPi*uBendRadius, not halfPi*innerRadius, because the \"base\" of a building\n//  // travels the full uBendRadius path\n//  float newY = cos(theta)*innerRadius - uBendRadius - max(s-halfPi*uBendRadius, 0.0);\n//  float newZ = normalize(mwPosition.z) * (min(depth, uBendDistance) + sin(theta)*innerRadius);\n//\n//  vec4 newPosition = vec4(mwPosition.x, newY, newZ, 1.0);\n//  vec4 glPosition = uProjMatrix * newPosition;\n  vec4 glPosition = uMatrix * aPosition;\n  gl_Position = glPosition;\n  vTexCoord = aTexCoord;\n  //*** fog *******************************************************************\n  vec4 mPosition = uModelMatrix * aPosition;\n  float distance = length(mPosition);\n  // => (distance - (uFogRadius - fogBlur)) / (uFogRadius - (uFogRadius - fogBlur));\n  float fogIntensity = (distance - uFogRadius) / fogBlur + 1.1; // <- shifts blur in/out\n  vFogIntensity = clamp(fogIntensity, 0.0, 1.0);\n  //vFogIntensity = 0.0;\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform vec3 uFogColor;\nvarying vec2 vTexCoord;\nvarying float vFogIntensity;\nvoid main() {\n  vec3 color = vec3(texture2D(uTexIndex, vec2(vTexCoord.x, 1.0-vTexCoord.y)));\n  gl_FragColor = vec4(mix(color, uFogColor, vFogIntensity), 1.0);\n}\n"},"texture":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uMatrix;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_FragColor = vec4(texture2D(uTexIndex, vTexCoord.st).rgb, 1.0);\n}\n"},"normalmap":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\nattribute vec4 aPosition;\nattribute vec3 aNormal;\nattribute vec4 aFilter;\nuniform mat4 uMatrix;\nuniform float uTime;\nvarying vec3 vNormal;\nvoid main() {\n  if (aFilter.a == 0.0) {\n    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);\n    vNormal = vec3(0.0, 0.0, 0.0);\n  } else {\n    gl_Position = uMatrix * aPosition;\n    vNormal = aNormal;\n  }\n}","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\n//uniform sampler2D uTexIndex;\nvarying vec2 vTexCoord;\nvarying vec3 vNormal;\nvoid main() {\n  gl_FragColor = vec4( (vNormal + 1.0)/2.0, 1.0);\n}\n"},"depth":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\nattribute vec4 aPosition;\nattribute vec4 aFilter;\nuniform mat4 uMatrix;\nuniform mat4 uModelMatrix;\nuniform float uTime;\nvarying vec3 vWorldPosition;\nvoid main() {\n  if (aFilter.a == 0.0) {\n    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);\n    vWorldPosition = vec3(0.0, 0.0, 0.0);\n  } else {\n    gl_Position = uMatrix * aPosition;\n    /* in order for the SSAO (which is based on this depth shader) to work\n     * correctly in conjunction with the fog shading, we need to replicate\n     * the fog computation here. This way, the ambient occlusion shader can\n     * later attenuate the ambient occlusion effect in the foggy areas.\n     * However, we cannot simply replicate the vertex shader-based fog\n     * computation here, because it won't work with the dummy map plane:\n     * The map plane is centered directly below the camera, so all four\n     * of its vertices have the same distance from the camera. With the\n     * current fog model, this means that they also are all equally foggy.\n     * Computing the fog intensity in the vertex shader would therefor\n     * interpolate this identical fog intensity over the whole quad, meaning\n     * that all its pixels would incorrectly appear equally foggy (The normal\n     * fogging for map tiles and buildings has the same issue, but can get away\n     * with it, because it shades rather small objects where each face indeed\n     * has an almost constant fog intensity).\n     * Instead, we only compute the world-space vertex positions here, let them\n     * - correctly - get interpolated by the rasterizing stage, and then\n     * compute the correct fog intensities per pixel in the fragment shader */\n    vec4 worldPos = uModelMatrix * aPosition;\n    vWorldPosition = worldPos.xyz / worldPos.w;\n  }\n}\n","fragment":"\n#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform float uFogRadius;\nconst float fogBlur = 200.0;\nvarying vec3 vWorldPosition;\n/* Note: the depth shader needs to not only store depth information, but\n *       also the fog intensity as well.\n * Rationale: In the current infrastructure, ambient occlusion does not \n * directly affect the building and map shading, but rather is later blended \n * onto the whole scene as a screen-space effect. This, however, is not\n * compatible with fogging: buildings in the fog gradually blend into the \n * background, but the ambient occlusion applied in screen space does not.\n * In the foggy area, this yields barely visible buildings with fully visible\n * ambient occlusion - an irritating effect.\n * To fix this, the depth shader stores not only depth values per pixel, but\n * also computes the fog intensity and stores it in the depth texture along\n * with the color-encoded depth values.\n * This way, the ambient occlusion shader can later not only compute the\n * actual ambient occlusion based on the depth values, but can attenuate\n * the effect in the foggy areas based on the fog intensity.\n */\nvoid main() {\n  // 5000.0 is an empirically-determined factor specific to OSMBuildings\n  float depth = (gl_FragCoord.z / gl_FragCoord.w)/5000.0;\n  if (depth > 1.0)\n    depth = 1.0;\n    \n  float z = floor(depth*256.0)/256.0;\n  depth = (depth - z) * 256.0;\n  float z1 = floor(depth*256.0)/256.0;\n  depth = (depth - z) * 256.0;\n  float z2 = floor(depth*256.0)/256.0;\n  float dist = length(vWorldPosition);\n  float fogIntensity = (dist - uFogRadius) / fogBlur + 1.1;\n  fogIntensity = clamp(fogIntensity, 0.0, 1.0);\n  // option 1: this line outputs high-precision (24bit) depth values\n  gl_FragColor = vec4(z, z1, z2, fogIntensity);\n  \n  // option 2: this line outputs human-interpretable depth values, but with low precision\n  //gl_FragColor = vec4(z, z, z, 1.0); \n}\n"},"ambientFromDepth":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uMatrix;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_FRAGMENT_PRECISION_HIGH\n  // we need high precision for the depth values\n  precision highp float;\n#else\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform float uInverseTexWidth;   //in 1/pixels, e.g. 1/512 if the texture is 512px wide\nuniform float uInverseTexHeight;  //in 1/pixels\nuniform float uEffectStrength;\nvarying vec2 vTexCoord;\n/* Retrieves the depth value (dx, dy) pixels away from 'pos' from texture 'uTexIndex'. */\nfloat getDepth(vec2 pos, int dx, int dy)\n{\n  //retrieve the color-coded depth\n  vec4 codedDepth = texture2D(uTexIndex, vec2(pos.s + float(dx) * uInverseTexWidth, \n                                              pos.t + float(dy) * uInverseTexHeight));\n  //convert back to depth value\n  return codedDepth.x + \n         codedDepth.y/ 256.0 + \n         codedDepth.z/(256.0*256.0);\n}\n/* getOcclusionFactor() determines a heuristic factor (from [0..1]) for how \n * much the fragment at 'pos' with depth 'depthHere'is occluded by the \n * fragment that is (dx, dy) texels away from it.\n */\nfloat getOcclusionFactor(float depthHere, vec2 pos, int dx, int dy)\n{\n    float depthThere = getDepth(pos, dx, dy);\n    /* if the fragment at (dx, dy) has no depth (i.e. there was nothing rendered there), \n     * then 'here' is not occluded (result 1.0) */\n    if (depthThere == 0.0)\n      return 1.0;\n    /* if the fragment at (dx, dy) is further away from the viewer than 'here', then\n     * 'here is not occluded' */\n    if (depthHere < depthThere )\n      return 1.0;\n      \n    float relDepthDiff = depthThere / depthHere;\n    /* if the fragment at (dx, dy) is closer to the viewer than 'here', then it occludes\n     * 'here'. The occlusion is the higher the bigger the depth difference between the two\n     * locations is.\n     * However, if the depth difference is too high, we assume that 'there' lies in a\n     * completely different depth region of the scene than 'here' and thus cannot occlude\n     * 'here'. This last assumption gets rid of very dark artifacts around tall buildings.\n     */\n    return relDepthDiff > 0.95 ? relDepthDiff : 1.0;\n}\n/* This shader approximates the ambient occlusion in screen space (SSAO). \n * It is based on the assumption that a pixel will be occluded by neighboring \n * pixels iff. those have a depth value closer to the camera than the original\n * pixel itself (the function getOcclusionFactor() computes this occlusion \n * by a single other pixel).\n *\n * A naive approach would sample all pixels within a given distance. For an\n * interesting-looking effect, the sampling area needs to be at least 9 pixels \n * wide (-/+ 4), requiring 81 texture lookups per pixel for ambient occlusion.\n * This overburdens many GPUs.\n * To make the ambient occlusion computation faster, we employ the following \n * tricks:\n * 1. We do not consider all texels in the sampling area, but only a select few \n *    (at most 16). This causes some sampling artifacts, which are later\n *    removed by blurring the ambient occlusion texture (this is done in a\n *    separate shader).\n * 2. The further away an object is the fewer samples are considered and the\n *    closer are these samples to the texel for which the ambient occlusion is\n *    being computed. The rationale is that ambient occlusion attempts to de-\n *    determine occlusion by *nearby* other objects. Due to the perspective \n *    projection, the further away objects are, the smaller they become. \n *    So the further away objects are, the closer are those nearby other objects\n *    in screen-space, and thus texels further away no longer need to be \n *    considered.\n *    As a positive side-effect, this also reduces the total number of texels \n *    that need to be sampled.\n */\nvoid main() {\n  float depthHere = getDepth(vTexCoord.st, 0, 0);\n  float fogIntensity = texture2D(uTexIndex, vTexCoord.st).w;\n  if (depthHere == 0.0)\n  {\n\t//there was nothing rendered 'here' --> it can't be occluded\n    gl_FragColor = vec4( vec3(1.0), 1.0);\n    return;\n  }\n  \n  float occlusionFactor = 1.0;\n  \n  //always consider the direct horizontal and vertical neighbors for the ambient map \n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  -1,   0);\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  +1,   0);\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,   0,  -1);\n  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,   0,  +1);\n  /* note: exponents are hand-tuned to give about the same brightness no matter\n   *       how many samples are considered (4, 8 or 16) */\n  float exponent = 60.0;  \n  \n  if (depthHere < 0.4)\n  {\n    /* for closer objects, also consider the texels that are two pixels \n     * away diagonally. */\n    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  -2,  -2);\n    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  +2,  +2);\n    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  +2,  -2);\n    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  -2,  +2);\n    exponent = 12.0;\n  }\n    \n  if (depthHere < 0.3)\n  {\n    /* for the closest objects, also consider the texels that are four pixels \n     * away horizontally, vertically and diagonally */\n    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  -4,   0);\n    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  +4,   0);\n    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,   0,  -4);\n    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,   0,  +4);\n    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  -4,  -4);\n    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  +4,  +4);\n    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  +4,  -4);\n    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  -4,  +4);\n    exponent = 4.0;\n  }\n  occlusionFactor = pow(occlusionFactor, exponent);\n  occlusionFactor = 1.0 - ((1.0 - occlusionFactor) * uEffectStrength);\n  \n  occlusionFactor = 1.0 - ((1.0- occlusionFactor) * (1.0-fogIntensity));\n  gl_FragColor = vec4( vec3(occlusionFactor) , 1.0);\n}\n"},"blur":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uMatrix;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform float uInverseTexWidth;   //in 1/pixels, e.g. 1/512 if the texture is 512px wide\nuniform float uInverseTexHeight;  //in 1/pixels\nvarying vec2 vTexCoord;\n/* Retrieves the texel color at (dx, dy) pixels away from 'pos' from texture 'uTexIndex'. */\nvec4 getTexel(vec2 pos, int dx, int dy)\n{\n  //retrieve the color-coded depth\n  return texture2D(uTexIndex, vec2(pos.s + float(dx) * uInverseTexWidth, \n                                   pos.t + float(dy) * uInverseTexHeight));\n}\nvoid main() {\n  vec4 center = texture2D(uTexIndex, vTexCoord);\n  vec4 nonDiagonalNeighbors = getTexel(vTexCoord, -1, 0) +\n                              getTexel(vTexCoord, +1, 0) +\n                              getTexel(vTexCoord,  0,-1) +\n                              getTexel(vTexCoord,  0,+1);\n  vec4 diagonalNeighbors =    getTexel(vTexCoord, -1,-1) +\n                              getTexel(vTexCoord, +1,+1) +\n                              getTexel(vTexCoord, -1,+1) +\n                              getTexel(vTexCoord, +1,-1);  \n  \n  //approximate Gaussian blur (mean 0.0, stdev 1.0)\n  gl_FragColor = 0.2/1.0 * center + \n                 0.5/4.0 * nonDiagonalNeighbors + \n                 0.3/4.0 * diagonalNeighbors;\n}\n"}};



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
    var vertices = earcut(polygon);
    var vertexCount = 0;
    for (var i = 0, il = vertices.length-2; i < il; i+=3) {
      vertexCount += this.addTriangle(
        tris,
        [ vertices[i  ][0], vertices[i  ][1], z ],
        [ vertices[i+1][0], vertices[i+1][1], z ],
        [ vertices[i+2][0], vertices[i+2][1], z ]
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


var Grid = function(source, tileClass, options) {
  this.tiles = {};
  this.buffer = 1;

  this.source = source;
  this.tileClass = tileClass;
  options = options || {};

  this.bounds = options.bounds;
  this.fixedZoom = options.fixedZoom;

  this.tileOptions = { color:options.color };

  this.minZoom = parseFloat(options.minZoom) || APP.minZoom;
  this.maxZoom = parseFloat(options.maxZoom) || APP.maxZoom;
  if (this.maxZoom < this.minZoom) {
    this.maxZoom = this.minZoom;
  }

  MAP.on('change', this._onChange = function() {
    this.update(500);
  }.bind(this));

  MAP.on('resize', this._onResize = this.update.bind(this));

  this.update();
};

Grid.prototype = {

  /* Returns the set of tiles (as dictionary keys) that overlap in any way with
   * the quadrilateral 'quad'. The returned set may contain false-positives,
   * i.e. tiles that are slightly outside the viewing frustum.
   *
   * The basic approach is to determine the axis-aligned bounding box of the
   * quad, and for each tile in the bounding box determine whether its center
   * lies inside the quad (or rather in one of the two triangles making up the
   * quad) via a point-in-triangle test.
   * This approach however misses some boundary cases:
   * - for tiles on the edge of the screen, parts of the tile may be visible
   *   without its center being visible. Our test misses these cases. We
   *   compensate by adding not only the tile itself but also all horizontal,
   *   vertical and diagonal neighbors to the result set
   * - if the quad is small compared to the tile size then no tile center may
   *   be inside the quad (e.g. when the whole screen is covered by the lower
   *   third of a single tile) and thus the result set would be empty. We
   *   compensate by adding the tiles of all four quad vertices to the result
   *   set in any case.
   * Note: while the set of tiles added through those edge cases may seem
   *       excessive, it is actually rather small: It does add an one tile wide
   *       outline to the result set. But other than that, is only caused tiles
   *       to be added multiple times, and those duplicates are removed
   *       automatically since the result is a set.
   */
  getTilesInQuad: function(quad, zoom) {
    var minX =          (Math.min(quad[0][0], quad[1][0], quad[2][0], quad[3][0])) <<0;
    var maxX = Math.ceil(Math.max(quad[0][0], quad[1][0], quad[2][0], quad[3][0]));

    var minY =          (Math.min(quad[0][1], quad[1][1], quad[2][1], quad[3][1])) <<0;
    var maxY = Math.ceil(Math.max(quad[0][1], quad[1][1], quad[2][1], quad[3][1]));

    var tiles = {};
    tiles[[quad[0][0]<<0, quad[0][1]<<0, zoom]] = true;
    tiles[[quad[1][0]<<0, quad[1][1]<<0, zoom]] = true;
    tiles[[quad[2][0]<<0, quad[2][1]<<0, zoom]] = true;
    tiles[[quad[3][0]<<0, quad[3][1]<<0, zoom]] = true;

    for (var x = minX; x <= maxX; x++) {
      for (var y = minY; y <= maxY; y++) {
        if (isPointInTriangle(quad[0], quad[1], quad[2], [x + 0.5, y + 0.5]) ||
          isPointInTriangle(quad[0], quad[2], quad[3], [x + 0.5, y + 0.5])) {
          tiles[[x - 1, y - 1, zoom]] = true;
          tiles[[x,     y - 1, zoom]] = true;
          tiles[[x + 1, y - 1, zoom]] = true;
          tiles[[x - 1, y,     zoom]] = true;
          tiles[[x,     y,     zoom]] = true;
          tiles[[x + 1, y,     zoom]] = true;
          tiles[[x - 1, y + 1, zoom]] = true;
          tiles[[x,     y + 1, zoom]] = true;
          tiles[[x + 1, y + 1, zoom]] = true;
        }
      }
    }
    return tiles;
  },

  // strategy: start loading after {delay}ms, skip any attempts until then
  // effectively loads in intervals during movement
  update: function(delay) {
    if (MAP.zoom < this.minZoom || MAP.zoom > this.maxZoom) {
      return;
    }

    if (!delay) {
      this.loadTiles();
      return;
    }

    if (!this.debounce) {
      this.debounce = setTimeout(function() {
        this.debounce = null;
        this.loadTiles();
      }.bind(this), delay);
    }
  },

  getURL: function(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(this.source, { s:s, x:x, y:y, z:z });
  },

  loadTiles: function() {
    var zoom = Math.round(this.fixedZoom || MAP.zoom);

    // TODO: if there are user defined bounds for this layer, respect these too
    //  if (this.fixedBounds) {
    //    var
    //      min = project(this.bounds.s, this.bounds.w, 1<<zoom),
    //      max = project(this.bounds.n, this.bounds.e, 1<<zoom);
    //
    //    var bounds = {
    //      zoom: zoom,
    //      minX: (min.x <<0) - this.buffer,
    //      minY: (min.y <<0) - this.buffer,
    //      maxX: (max.x <<0) + this.buffer,
    //      maxY: (max.y <<0) + this.buffer
    //    };
    //  }

    var
      tile, tileX, tileY,
      queue = [], queueLength,
      tileAnchor = [
        MAP.center.x/TILE_SIZE <<0,
        MAP.center.y/TILE_SIZE <<0
      ];
      
    var viewQuad = render.getViewQuad(render.viewProjMatrix.data, zoom);
    this.visibleTiles = this.getTilesInQuad(viewQuad, zoom);

    for (var key in this.visibleTiles) {
      tile = key.split(',');
      tileX = tile[0];
      tileY = tile[1];

      if (this.tiles[key]) {
        continue;
      }

      this.tiles[key] = new this.tileClass(tileX, tileY, zoom, this.tileOptions);
      // TODO: rotate anchor point
      queue.push({ tile:this.tiles[key], dist:distance2([tileX, tileY], tileAnchor) });
    }

    if (!(queueLength = queue.length)) {
      return;
    }

    queue.sort(function(a, b) {
      return a.dist-b.dist;
    });

    for (var i = 0; i < queueLength; i++) {
      tile = queue[i].tile;
      tile.load(this.getURL(tile.x, tile.y, tile.zoom));
    }

    this.purge();
  },

  purge: function() {
    for (var key in this.tiles) {
      if (!this.visibleTiles[key]) {
        this.tiles[key].destroy();
        delete this.tiles[key];
      }
    }
  },

  destroy: function() {
    MAP.off('change', this._onChange);
    MAP.off('resize', this._onResize);

    clearTimeout(this.debounce);
    for (var key in this.tiles) {
      this.tiles[key].destroy();
    }
    this.tiles = [];
  }
};


var Filter = {
  start: Date.now(),
  items: [],

  add: function(type, selector, duration) {
    duration = duration || 0;

    var filters = this.items;
    for (i = 0, il = filters.length; i < il; i++) {
      if (filters[i].type === type && filters[i].selector === selector) {
        return;
      }
    }

    filters.push({ type:type, selector:selector, duration:duration });

    // applies a single filter to all items
    // currently only suitable for 'hidden'
    var indexItem;
    var item;
    var j, jl;

    var start = this.time();
    var end = start+duration;

    for (var i = 0, il = this.items.length; i<il; i++) {
      indexItem = this.items[i];

      if (!indexItem.applyFilter) {
        return;
      }

      for (j = 0, jl = indexItem.items.length; j < jl; j++) {
        item = indexItem.items[j];
        if (selector(item.id, item.data)) {
          item.filter = [start, end, 1, 0];
        }
      }

      indexItem.applyFilter();
    }
  },

  remove: function(type, selector, duration) {
    duration = duration || 0;

    var i, il;

    var filters = this.items;
    for (i = 0, il = filters.length; i < il; i++) {
      if (filters[i].type === type && filters[i].selector === selector) {
        filters.splice(i, 1);
        break;
      }
    }

    // removes a single filter from all items
    // currently only suitable for 'hidden'
    var indexItem;
    var item;
    var j, jl;

    var start = this.time();
    var end = start+duration;

    for (i = 0, il = this.items.length; i<il; i++) {
      indexItem = this.items[i];

      if (!indexItem.applyFilter) {
        return;
      }

      for (j = 0, jl = indexItem.items.length; j < jl; j++) {
        item = indexItem.items[j];
        if (selector(item.id, item.data)) {
          item.filter = [start, end, 0, 1];
        }
      }

      indexItem.applyFilter();
    }
  },

  // applies all existing filters to an item
  // currently only suitable for 'hidden'
  apply: function(indexItem) {
    var filters = this.items;
    var type, selector;
    var item;
    var j, jl;

    if (!indexItem.applyFilter) {
      return;
    }

    var start = this.time();
    var end;

    for (var i = 0, il = filters.length; i < il; i++) {
      type = filters[i].type;
      selector = filters[i].selector;
      end = start+filters[i].duration;

      for (j = 0, jl = indexItem.items.length; j < jl; j++) {
        item = indexItem.items[j];
        if (selector(item.id, item.data)) {
          item.filter = [start, end, 1, 0];
        }
      }
    }

    indexItem.applyFilter();
  },

  time: function() {
    return Date.now()-this.start;
  },

  destroy: function() {
    this.items = [];
  }
};


// all commented sections are for collision checks

// create 2 cylinders and check
// function checkCollision(a, b) {
// }

var data = {
  Index: {
    items: [],
//  blockers: [],

    add: function(item) {
      this.items.push(item);
      //if (item.replace) {
        //this.blockers.push(item);
//      }
    },

    remove: function(item) {
      var items = this.items;
      for (var i = 0, il = items.length; i < il; i++) {
        if (items[i] === item) {
          //if (items[i].replace) {
          //  for (var j = 0; j < this.blockers.length; j++) {
          //    if (this.blockers[j] === items[i]) {
          //      this.blockers.splice(j, 1);
          //      break;
          //    }
          //  }
          //}
          items.splice(i, 1);
          return;
        }
      }
    },

//    // check with other objects
//    checkCollisions: function(item) {
//      for (var i = 0, il = this.blockers.length; i < il; i++) {
  //    if (this.blockers.indexOf(item.id) >= 0) { // real collision check
  //     return true;
  //    }
//      }
//      return false;
//    },

    destroy: function() {
      // items are destroyed by grid
      this.items = [];
//    this.blockers = [];
    }
  }
};


data.Tile = function(x, y, zoom, options) {
  this.x = x;
  this.y = y;
  this.zoom = zoom;
  this.key = [x, y, zoom].join(',');

  this.options = options;
};

data.Tile.prototype = {
  load: function(url) {
    this.mesh = new mesh.GeoJSON(url, this.options);
  },

  destroy: function() {
    if (this.mesh) {
      this.mesh.destroy();
    }
  }
};


var mesh = {};


mesh.GeoJSON = (function() {

  var
    zoom = 16,
    worldSize = TILE_SIZE <<zoom,
    featuresPerChunk = 100,
    delayPerChunk = 66;

  //***************************************************************************

  function isRotational(item, center) {
    var
      ring = item.geometry[0],
      length = ring.length;

    if (length < 16) {
      return false;
    }

    var
      width = item.max.x-item.min.x,
      height = item.max.y-item.min.y,
      ratio = width/height;

    if (ratio < 0.85 || ratio > 1.15) {
      return false;
    }

    var
      radius = (width+height)/4,
      sqRadius = radius*radius,
      dist;


    for (var i = 0; i < length; i++) {
      dist = distance2(ring[i], center);
      if (dist/sqRadius < 0.75 || dist/sqRadius > 1.25) {
        return false;
      }
    }

    return true;
  }

  //***************************************************************************

  function constructor(url, options) {
    options = options || {};

    this.id = options.id;
    if (options.color) {
      this.color = new Color(options.color).toArray();
    }

    this.replace   = !!options.replace;
    this.scale     = options.scale     || 1;
    this.rotation  = options.rotation  || 0;
    this.elevation = options.elevation || 0;
    this.position  = {};

    this.minZoom = parseFloat(options.minZoom) || APP.minZoom;
    this.maxZoom = parseFloat(options.maxZoom) || APP.maxZoom;
    if (this.maxZoom < this.minZoom) {
      this.maxZoom = this.minZoom;
    }

    this.data = {
      vertices: [],
      normals: [],
      colors: [],
      ids: []
    };

    Activity.setBusy();
    if (typeof url === 'object') {
      var json = url;
      this.onLoad(json);
    } else {
      this.request = Request.getJSON(url, function(json) {
        this.request = null;
        this.onLoad(json);
      }.bind(this));
    }
  }

  constructor.prototype = {

    onLoad: function(json) {
      if (!json || !json.features.length) {
        return;
      }

      var coordinates0 = json.features[0].geometry.coordinates[0][0];
      this.position = { latitude: coordinates0[1], longitude: coordinates0[0] };
      this.items = [];

      var
        startIndex = 0,
        dataLength = json.features.length,
        endIndex = startIndex + Math.min(dataLength, featuresPerChunk);

      var process = function() {
        var features = json.features.slice(startIndex, endIndex);
        var geojson = { type: 'FeatureCollection', features: features };
        var data = GeoJSON.parse(this.position, worldSize, geojson);
        this.addItems(data);

        if (endIndex === dataLength) {
          this.onReady();
          return;
        }

        startIndex = endIndex;
        endIndex = startIndex + Math.min((dataLength-startIndex), featuresPerChunk);

        this.relaxedProcessing = setTimeout(process, delayPerChunk);
      }.bind(this);

      process();
    },

    addItems: function(items) {
      var
        item, color, idColor, center, radius,
        vertexCount,
        id, colorVariance,
        defaultColor = new Color(DEFAULT_COLOR).toArray(),
        j;

      for (var i = 0, il = items.length; i < il; i++) {
        item = items[i];

        id = this.id || item.id;
        idColor = render.Interaction.idToColor(id);
        colorVariance = (id/2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06); // TODO: maybe a shaders task

        center = [item.min.x + (item.max.x - item.min.x)/2, item.min.y + (item.max.y - item.min.y)/2];

        //if ((item.roofShape === 'cone' || item.roofShape === 'dome') && !item.shape && isRotational(item, center)) {
        if (!item.shape && isRotational(item, center)) {
          item.shape = 'cylinder';
          item.isRotational = true;
        }

        if (item.isRotational) {
          radius = (item.max.x - item.min.x)/2;
        }

        vertexCount = 0; // ensures there is no mess when walls or roofs are not drawn (b/c of unknown tagging)
        switch (item.shape) {
          case 'cylinder': vertexCount = Triangulate.cylinder(this.data, center, radius, radius, item.minHeight, item.height); break;
          case 'cone':     vertexCount = Triangulate.cylinder(this.data, center, radius, 0, item.minHeight, item.height); break;
          case 'dome':     vertexCount = Triangulate.dome(this.data, center, radius, item.minHeight, item.height); break;
          case 'sphere':   vertexCount = Triangulate.cylinder(this.data, center, radius, radius, item.minHeight, item.height); break;
          case 'pyramid':  vertexCount = Triangulate.pyramid(this.data, item.geometry, center, item.minHeight, item.height); break;
          default:         vertexCount = Triangulate.extrusion(this.data, item.geometry, item.minHeight, item.height);
        }

        color = this.color || item.wallColor || defaultColor;
        for (j = 0; j < vertexCount; j++) {
          this.data.colors.push(color[0]+colorVariance, color[1]+colorVariance, color[2]+colorVariance);
          this.data.ids.push(idColor[0], idColor[1], idColor[2]);
        }

        this.items.push({ id:id, vertexCount:vertexCount });

        vertexCount = 0; // ensures there is no mess when walls or roofs are not drawn (b/c of unknown tagging)
        switch (item.roofShape) {
          case 'cone':     vertexCount = Triangulate.cylinder(this.data, center, radius, 0, item.height, item.height+item.roofHeight); break;
          case 'dome':     vertexCount = Triangulate.dome(this.data, center, radius, item.height, item.height + (item.roofHeight || radius)); break;
          case 'pyramid':  vertexCount = Triangulate.pyramid(this.data, item.geometry, center, item.height, item.height+item.roofHeight); break;
          default:
            if (item.shape === 'cylinder') {
              vertexCount = Triangulate.circle(this.data, center, radius, item.height);
            } else if (item.shape === undefined) {
              vertexCount = Triangulate.polygon(this.data, item.geometry, item.height);
            }
        }

        color = this.color || item.roofColor || defaultColor;
        for (j = 0; j < vertexCount; j++) {
          this.data.colors.push(color[0]+colorVariance, color[1]+colorVariance, color[2]+colorVariance);
          this.data.ids.push(idColor[0], idColor[1], idColor[2]);
        }

        this.items.push({ id:id, vertexCount:vertexCount });
      }
    },

    applyFilter: function() {
      var item, filters = [];
      for (var i = 0, il = this.items.length; i < il; i++) {
        item = this.items[i];
        for (var j = 0, jl = item.vertexCount; j < jl; j++) {
          filters.push.apply(filters, item.filter || [0, 0, 1, 1]);
        }
      }
      this.filterBuffer = new glx.Buffer(4, new Float32Array(filters));
    },

    onReady: function() {
      this.vertexBuffer = new glx.Buffer(3, new Float32Array(this.data.vertices));
      this.normalBuffer = new glx.Buffer(3, new Float32Array(this.data.normals));
      this.colorBuffer  = new glx.Buffer(3, new Float32Array(this.data.colors));
      this.idBuffer     = new glx.Buffer(3, new Float32Array(this.data.ids));
      this.data = null;

      Filter.apply(this);
      data.Index.add(this);

      this.isReady = true;
      Activity.setIdle();
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      var matrix = new glx.Matrix();

      if (this.elevation) {
        matrix.translate(0, 0, this.elevation);
      }

      var scale = 1 / Math.pow(2, zoom - MAP.zoom) * this.scale;
      matrix.scale(scale, scale, scale*HEIGHT_SCALE);

      if (this.rotation) {
        matrix.rotateZ(-this.rotation);
      }

      var
        position = project(this.position.latitude, this.position.longitude, TILE_SIZE*Math.pow(2, MAP.zoom)),
        mapCenter = MAP.center;

      matrix.translate(position.x-mapCenter.x, position.y-mapCenter.y, 0);

      return matrix;
    },

    destroy: function() {
      this.isReady = false;

      clearTimeout(this.relaxedProcessing);

      data.Index.remove(this);

      if (this.request) {
        this.request.abort();
      }

      this.items = [];

      if (this.isReady) {
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
        this.colorBuffer.destroy();
        this.idBuffer.destroy();
      }
    }
  };

  return constructor;

}());


/* A 'MapPlane' object is a rectangular mesh in the X/Y plane (Z=0) that is
 * guaranteed to cover all of the area of that plane that is inside the skydome.
 *
 * A 'MapPlane' is untextured and featureless. Its intended use is as a stand-in
 * for a 'BaseMap' in situations where either using the actual BaseMap would be
 * inefficient (e.g. when the BaseMap would be rendered without a texture) or 
 * no BaseMap is present (e.g. if OSMBuildings is used as an overlay to Leaflet
 * or MapBoxGL). This mostly applies to creating depth and normal textures of the
 * scene, not to the actual shaded scene rendering.

*/

mesh.MapPlane = (function() {

  function constructor(options) {
    options = options || {};

    this.id = options.id;
    /*if (options.color) {
      this.color = new Color(options.color).toArray(true);
    }*/

    this.radius = options.radius || 1500;
    this.createGlGeometry();

    this.minZoom = APP.minZoom;
    this.maxZoom = APP.maxZoom;
  }

  constructor.prototype = {

    createGlGeometry: function() {

      this.vertexBuffer = new glx.Buffer(3, new Float32Array([
        -this.radius, -this.radius, 0,
         this.radius,  this.radius, 0,
         this.radius, -this.radius, 0,
        
         this.radius,  this.radius, 0,
        -this.radius, -this.radius, 0,
        -this.radius,  this.radius, 0]));

      /*
      this.dummyMapPlaneTexCoords = new glx.Buffer(2, new Float32Array([
        0.0, 0.0,
          1, 0.0,
          1,   1,
        
        0.0, 0.0,
          1,   1,
        0.0,   1]));*/

      this.normalBuffer = new glx.Buffer(3, new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        
        0, 0, 1,
        0, 0, 1,
        0, 0, 1]));

      //this.numDummyVertices = 6;

    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      var scale = render.fogRadius/this.radius;
      var modelMatrix = new glx.Matrix();
      modelMatrix.scale(scale, scale, scale);
    
      return modelMatrix;
    },

    destroy: function() {
      this.vertexBuffer.destroy();
      this.normalBuffer.destroy();
      this.colorBuffer.destroy();
      this.idBuffer.destroy();
    }
  };

  return constructor;

}());


mesh.DebugQuad = (function() {

  function constructor(options) {
    options = options || {};

    this.id = options.id;
    /*if (options.color) {
      this.color = new Color(options.color).toArray();
    }*/

    this.v1 = this.v2 = this.v3 = this.v4 = [false, false, false];
    this.updateGeometry( [0,0,0], [0,0,0], [0,0,0], [0,0,0]);

    this.minZoom = APP.minZoom;
    this.maxZoom = APP.maxZoom;
  }

  function areEqual(a, b) {
    return a[0] === b[0] &&
           a[1] === b[1] &&
           a[2] === b[2];
  }

  constructor.prototype = {

    updateGeometry: function(v1, v2, v3, v4) {
      if ( areEqual(v1, this.v1) &&
           areEqual(v2, this.v2) &&
           areEqual(v3, this.v3) &&
           areEqual(v4, this.v4))
         return; //still up-to-date

      this.v1 = v1;
      this.v2 = v2;
      this.v3 = v3;
      this.v4 = v4;
      
      if (this.vertexBuffer)
        this.vertexBuffer.destroy();

      var vertices = [].concat(v1, v2, v3, v1, v3, v4);
      this.vertexBuffer = new glx.Buffer(3, new Float32Array(vertices));

      /*
      this.dummyMapPlaneTexCoords = new glx.Buffer(2, new Float32Array([
        0.0, 0.0,
          1, 0.0,
          1,   1,
        
        0.0, 0.0,
          1,   1,
        0.0,   1]));*/

      if (this.normalBuffer)
        this.normalBuffer.destroy();
        
      this.normalBuffer = new glx.Buffer(3, new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        
        0, 0, 1,
        0, 0, 1,
        0, 0, 1]));
      
      var color = [1, 0.5, 0.25];
      if (this.colorBuffer)
        this.colorBuffer.destroy();
        
      this.colorBuffer = new glx.Buffer(3, new Float32Array(
        [].concat(color, color, color, color, color, color)));


      if (this.idBuffer)
        this.idBuffer.destroy();

      this.idBuffer = new glx.Buffer(3, new Float32Array(
        [].concat(color, color, color, color, color, color)));
        
      //this.numDummyVertices = 6;
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      //var scale = render.fogRadius/this.radius;
      var modelMatrix = new glx.Matrix();
      //modelMatrix.scale(scale, scale, scale);
    
      return modelMatrix;
    },

    destroy: function() {
      this.vertexBuffer.destroy();
      this.normalBuffer.destroy();
      this.colorBuffer.destroy();
      this.idBuffer.destroy();
    }
  };

  return constructor;

}());


mesh.OBJ = (function() {

  function constructor(url, position, options) {
    options = options || {};

    this.id = options.id;
    if (options.color) {
      this.color = new Color(options.color).toArray();
    }

    this.replace   = !!options.replace;
    this.scale     = options.scale     || 1;
    this.rotation  = options.rotation  || 0;
    this.elevation = options.elevation || 0;
    this.position  = position;

    this.minZoom = parseFloat(options.minZoom) || APP.minZoom;
    this.maxZoom = parseFloat(options.maxZoom) || APP.maxZoom;
    if (this.maxZoom < this.minZoom) {
      this.maxZoom = this.minZoom;
    }

    this.inMeters = TILE_SIZE / (Math.cos(this.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);

    this.data = {
      vertices: [],
      normals: [],
      colors: [],
      ids: []
    };

    Activity.setBusy();
    this.request = Request.getText(url, function(obj) {
      this.request = null;
      var match;
      if ((match = obj.match(/^mtllib\s+(.*)$/m))) {
        this.request = Request.getText(url.replace(/[^\/]+$/, '') + match[1], function(mtl) {
          this.request = null;
          this.onLoad(obj, mtl);
        }.bind(this));
      } else {
        this.onLoad(obj, null);
      }
    }.bind(this));
  }

  constructor.prototype = {
    onLoad: function(obj, mtl) {
      var data = new OBJ.parse(obj, mtl);
      this.items = [];
      this.addItems(data);
      this.onReady();
    },

    addItems: function(items) {
      var
        item, color, idColor, j, jl,
        id, colorVariance,
        defaultColor = new Color(DEFAULT_COLOR).toArray();

      for (var i = 0, il = items.length; i < il; i++) {
        item = items[i];

        this.data.vertices.push.apply(this.data.vertices, item.vertices);
        this.data.normals.push.apply(this.data.normals, item.normals);

        id = this.id || item.id;
        idColor = render.Interaction.idToColor(id);

        colorVariance = (id/2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06);
        color = this.color || item.color || defaultColor;
        for (j = 0, jl = item.vertices.length - 2; j<jl; j += 3) {
          this.data.colors.push(color[0]+colorVariance, color[1]+colorVariance, color[2]+colorVariance);
          this.data.ids.push(idColor[0], idColor[1], idColor[2], 1);
        }

        this.items.push({ id:id, vertexCount:item.vertices.length/3 });
      }
    },

    applyFilter: function() {
      var item, filters = [];
      for (var i = 0, il = this.items.length; i < il; i++) {
        item = this.items[i];
        for (var j = 0, jl = item.vertexCount; j < jl; j++) {
          filters.push.apply(filters, item.filter || [0, 0, 1, 1]);
        }
      }
      this.filterBuffer = new glx.Buffer(4, new Float32Array(filters));
    },

    onReady: function() {
      this.vertexBuffer = new glx.Buffer(3, new Float32Array(this.data.vertices));
      this.normalBuffer = new glx.Buffer(3, new Float32Array(this.data.normals));
      this.colorBuffer  = new glx.Buffer(3, new Float32Array(this.data.colors));
      this.idBuffer     = new glx.Buffer(3, new Float32Array(this.data.ids));

      this.data = null;

      Filter.apply(this);
      data.Index.add(this);

      this.isReady = true;
      Activity.setIdle();
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      var matrix = new glx.Matrix();

      if (this.elevation) {
        matrix.translate(0, 0, this.elevation);
      }

      var scale = Math.pow(2, MAP.zoom) * this.inMeters * this.scale;
      matrix.scale(scale, scale, scale);

      if (this.rotation) {
        matrix.rotateZ(-this.rotation);
      }

      var
        position = project(this.position.latitude, this.position.longitude, TILE_SIZE*Math.pow(2, MAP.zoom)),
        mapCenter = MAP.center;

      matrix.translate(position.x-mapCenter.x, position.y-mapCenter.y, 0);

      return matrix;
    },

    destroy: function() {
      data.Index.remove(this);

      if (this.request) {
        this.request.abort();
      }

      this.items = [];

      if (this.isReady) {
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
        this.colorBuffer.destroy();
        this.idBuffer.destroy();
      }
    }
  };

  return constructor;

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
    if (typeof str !== 'string') {
      return null;
    }
    str = str.toLowerCase();
    if (str[0] === '#') {
      return str;
    }
    return materialColors[baseMaterials[str] || str] || null;
  }

  function isClockWise(latlngs) {
    return 0 < latlngs.reduce(function(a, b, c, d) {
      return a + ((c < d.length - 1) ? (d[c+1][0] - b[0]) * (d[c+1][1] + b[1]) : 0);
    }, 0);
  }

  function parseFeature(res, feature, origin, worldSize) {
    var
      prop = feature.properties,
      item = {};

    if (!prop) {
      return;
    }

    item.data = prop.data;

    item.height    = prop.height    || (prop.levels   ? prop.levels  *METERS_PER_LEVEL : DEFAULT_HEIGHT);
    item.minHeight = prop.minHeight || (prop.minLevel ? prop.minLevel*METERS_PER_LEVEL : 0);

    item.wallColor = new Color(prop.wallColor || prop.color || getMaterialColor(prop.material) || DEFAULT_COLOR).toArray();
    item.roofColor = new Color(prop.roofColor || prop.color || getMaterialColor(prop.material) || DEFAULT_COLOR).toArray();

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

    //if (item.height+item.roofHeight <= item.minHeight) {
    //  return;
    //}

    item.id = prop.relationId || feature.id || prop.id;

    var geometries = getGeometries(feature.geometry, origin, worldSize);
    var clonedItem = Object.create(item);
    var bbox;

    for (var i = 0, il = geometries.length; i < il; i++) {
      clonedItem.geometry = geometries[i];
      bbox = getBBox(geometries[i][0]);
      clonedItem.min = bbox.min;
      clonedItem.max = bbox.max;
      res.push(clonedItem);
    }
  }

  function getGeometries(geometry, origin, worldSize) {
    var i, il, polygonRings, sub;
    switch (geometry.type) {
      case 'GeometryCollection':
        var geometries = [];
        for (i = 0, il = geometry.geometries.length; i < il; i++) {
          if ((sub = getGeometries(geometry.geometries[i]))) {
            geometries.push.apply(geometries, sub);
          }
        }
        return geometries;

      case 'MultiPolygon':
        var polygons = [];
        for (i = 0, il = geometry.coordinates.length; i < il; i++) {
          if ((sub = getGeometries({ type: 'Polygon', coordinates: geometry.coordinates[i] }))) {
            polygons.push.apply(geometries, sub);
          }
        }
        return polygons;

      case 'Polygon':
        polygonRings = geometry.coordinates;
        break;

      default: return [];
    }

    var ring;
    var res = [];

    for (i = 0, il = polygonRings.length; i < il; i++) {
      if (!i) {
        ring = isClockWise(polygonRings[i]) ? polygonRings[i] : polygonRings[i].reverse();
      } else {
        ring = !isClockWise(polygonRings[i]) ? polygonRings[i] : polygonRings[i].reverse();
      }

      res[i] = transform(ring, origin, worldSize);
    }

    return [res];
  }

  function transform(ring, origin, worldSize) {
    var p, res = [];
    for (var i = 0, len = ring.length; i < len; i++) {
      p = project(ring[i][1], ring[i][0], worldSize);
      res[i] = [p.x-origin.x, p.y-origin.y];
    }

    return res;
  }

  function getBBox(ring) {
    var
      x =  Infinity, y =  Infinity,
      X = -Infinity, Y = -Infinity;

    for (var i = 0; i < ring.length; i++) {
      x = Math.min(x, ring[i][0]);
      y = Math.min(y, ring[i][1]);

      X = Math.max(X, ring[i][0]);
      Y = Math.max(Y, ring[i][1]);
    }

    return {
      min: { x:x, y:y },
      max: { x:X, y:Y }
    };
  }

  //***************************************************************************

  GeoJSON.parse = function(position, worldSize, geojson) {
    var res = [];

    if (geojson && geojson.type === 'FeatureCollection' && geojson.features.length) {

      var
        collection = geojson.features,
        origin = project(position.latitude, position.longitude, worldSize);

      for (var i = 0, il = collection.length; i<il; i++) {
        parseFeature(res, collection[i], origin, worldSize);
      }
    }

    return res;
  };

}());


var OBJ = function() {
  this.vertexIndex = [];
};

if (typeof module !== 'undefined') {
  module.exports = OBJ;
}

OBJ.prototype = {

  parseMaterials: function(str) {
    var lines = str.split(/[\r\n]/g), cols;
    var i, il;

    var materials = {};
    var data = null;

    for (i = 0, il = lines.length; i < il; i++) {
  	  cols = lines[i].trim().split(/\s+/);

      switch (cols[0]) {
  	    case 'newmtl':
          this.storeMaterial(materials, data);
          data = { id:cols[1], color:{} };
        break;

  	    case 'Kd':
  	      data.color.r = parseFloat(cols[1]);
  	      data.color.g = parseFloat(cols[2]);
  	      data.color.b = parseFloat(cols[3]);
  	    break;

  	    case 'd':
          data.color.a = parseFloat(cols[1]);
        break;
  	  }
    }

    this.storeMaterial(materials, data);

    str = null;

    return materials;
  },

  storeMaterial: function(materials, data) {
    if (data !== null) {
      materials[ data.id ] = data.color;
    }
  },

  parseModel: function(str, materials) {
    var lines = str.split(/[\r\n]/g), cols;
    var i, il;

    var meshes = [];
    var id;
    var color;
    var faces = [];

    for (i = 0, il = lines.length; i < il; i++) {
  	  cols = lines[i].trim().split(/\s+/);

      switch (cols[0]) {
        case 'g':
        case 'o':
          this.storeMesh(meshes, id, color, faces);
          id = cols[1];
          faces = [];
        break;

        case 'usemtl':
          this.storeMesh(meshes, id, color, faces);
          if (materials[ cols[1] ]) {
            color = materials[ cols[1] ];
          }
          faces = [];
        break;

        case 'v':
          this.vertexIndex.push([parseFloat(cols[1]), parseFloat(cols[2]), parseFloat(cols[3])]);
        break;

  	    case 'f':
  	      faces.push([ parseFloat(cols[1])-1, parseFloat(cols[2])-1, parseFloat(cols[3])-1 ]);
  	    break;
	    }
    }

    this.storeMesh(meshes, id, color, faces);

    str = null;

    return meshes;
  },

  storeMesh: function(meshes, id, color, faces) {
    if (faces.length) {
      var geometry = this.createGeometry(faces);
      meshes.push({
        id: id,
        color: color,
        vertices: geometry.vertices,
        normals: geometry.normals,
        min: geometry.min,
        max: geometry.max
      });
    }
  },

  createGeometry: function(faces) {
  	var v0, v1, v2;
  	var e1, e2;
  	var nor, len;
    var
      x =  Infinity, y =  Infinity, z =  Infinity,
      X = -Infinity, Y = -Infinity, Z = -Infinity;

    var geometry = { vertices:[], normals:[] };

    for (var i = 0, il = faces.length; i < il; i++) {
  		v0 = this.vertexIndex[ faces[i][0] ];
  		v1 = this.vertexIndex[ faces[i][1] ];
  		v2 = this.vertexIndex[ faces[i][2] ];

      x = Math.min(x, v0[0], v1[0], v2[0]);
      y = Math.min(x, v0[2], v1[2], v2[2]);
      z = Math.min(x, v0[1], v1[1], v2[1]);

      X = Math.max(X, v0[0], v1[0], v2[0]);
      Y = Math.max(Y, v0[2], v1[2], v2[2]);
      Z = Math.max(Z, v0[1], v1[1], v2[1]);

      e1 = [ v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2] ];
  		e2 = [ v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2] ];

  		nor = [ e1[1]*e2[2] - e1[2]*e2[1], e1[2]*e2[0] - e1[0]*e2[2], e1[0]*e2[1] - e1[1]*e2[0] ];
  		len = Math.sqrt(nor[0]*nor[0] + nor[1]*nor[1] + nor[2]*nor[2]);

  		nor[0] /= len;
      nor[1] /= len;
      nor[2] /= len;

  		geometry.vertices.push(
        v0[0], v0[2], v0[1],
        v1[0], v1[2], v1[1],
        v2[0], v2[2], v2[1]
      );

  		geometry.normals.push(
        nor[0], nor[1], nor[2],
        nor[0], nor[1], nor[2],
        nor[0], nor[1], nor[2]
      );
    }

    geometry.min = { x:x, y:y, z:z };
    geometry.max = { x:X, y:Y, z:Z };
    return geometry;
  }
};

OBJ.parse = function(obj, mtl) {
  var
    parser = new OBJ(),
    materials = mtl ? parser.parseMaterials(mtl) : {};
  return parser.parseModel(obj, materials);
};


function distance2(a, b) {
  var
    dx = a[0]-b[0],
    dy = a[1]-b[1];
  return dx*dx + dy*dy;
}

function normal(ax, ay, az, bx, by, bz, cx, cy, cz) {
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

function unit(x, y, z) {
  var m = Math.sqrt(x*x + y*y + z*z);

  if (m === 0) {
    m = 0.00001;
  }

  return [x/m, y/m, z/m];
}

/* Returns whether the point 'P' lies either inside the triangle (tA, tB, tC)
 * or on its edge.
 *
 * Implementation: we follow a barycentric development: The triangle
 *                 is interpreted as the point tA and two vectors v1 = tB - tA
 *                 and v2 = tC - tA. Then for any point P inside the triangle
 *                 holds P = tA + α*v1 + β*v2 subject to α >= 0, β>= 0 and
 *                 α + β <= 1.0
 */
function isPointInTriangle(tA, tB, tC, P) {
  var v1x = tB[0] - tA[0];
  var v1y = tB[1] - tA[1];

  var v2x = tC[0] - tA[0];
  var v2y = tC[1] - tA[1];

  var qx  = P[0] - tA[0];
  var qy  = P[1] - tA[1];

  /* 'denom' is zero iff v1 and v2 have the same direction. In that case,
   * the triangle has degenerated to a line, and no point can lie inside it */
  var denom = v2x * v1y - v2y * v1x;
  if (denom === 0)
    return false;

  var numeratorBeta = qx*v1y - qy*v1x;
  var beta = numeratorBeta/denom;

  var numeratorAlpha = qx*v2y - qy*v2x;
  var alpha = - numeratorAlpha / denom;

  return alpha >= 0.0 && beta >= 0.0 && (alpha + beta) <= 1.0;
}

/* transforms the 3D vector 'v' according to the transformation matrix 'm'.
 * Internally, the vector 'v' is interpreted as a 4D vector
 * (v[0], v[1], v[2], 1.0) in homogenous coordinates. The transformation is
 * performed on that vector, yielding a 4D homogenous result vector. That
 * vector is then converted back to a 3D Euler coordinates by dividing
 * its first three components each by its fourth component */
function transformVec3(m, v) {
  var x = v[0]*m[0] + v[1]*m[4] + v[2]*m[8]  + m[12];
  var y = v[0]*m[1] + v[1]*m[5] + v[2]*m[9]  + m[13];
  var z = v[0]*m[2] + v[1]*m[6] + v[2]*m[10] + m[14];
  var w = v[0]*m[3] + v[1]*m[7] + v[2]*m[11] + m[15];
  return [x/w, y/w, z/w]; //convert homogenous to Euler coordinates
}

/* returns the point (in OSMBuildings' local coordinates) on the XY plane (z==0)
 * that would be drawn at viewport position (screenNdcX, screenNdcY).
 * That viewport position is given in normalized device coordinates, i.e.
 * x==-1.0 is the left screen edge, x==+1.0 is the right one, y==-1.0 is the lower
 * screen edge and y==+1.0 is the upper one.
 */
function getIntersectionWithXYPlane(screenNdcX, screenNdcY, inverseTransform) {
  var v1 = transformVec3(inverseTransform, [screenNdcX, screenNdcY, 0]);
  var v2 = transformVec3(inverseTransform, [screenNdcX, screenNdcY, 1]);

  // direction vector from v1 to v2
  var vDir = [ v2[0] - v1[0],
    v2[1] - v1[1],
    v2[2] - v1[2]];

  if (vDir[2] >= 0) // ray would not intersect with the plane
  {
    return undefined;
  }
  /* ray equation for all world-space points 'p' lying on the screen-space NDC position
   * (screenNdcX, screenNdcY) is:  p = v1 + λ*vDirNorm
   * For the intersection with the xy-plane (-> z=0) holds: v1[2] + λ*vDirNorm[2] = p[2] = 0.0.
   * Rearranged, this reads:   */
  var lambda = -v1[2]/vDir[2];

  return [ v1[0] + lambda * vDir[0],
    v1[1] + lambda * vDir[1],
    v1[2] + lambda * vDir[2] +1.0]; //FIXME: remove debug z-offset "+1.0"
}

/* converts a 2D position from OSMBuildings' local coordinate system to slippy tile
 * coordinates for zoom level 'tileZoom'. The results are not integers, but have a
 * fractional component. Math.floor(tileX) gives the actual horizontal tile number,
 * while (tileX - Math.floor(tileX)) gives the relative position *inside* the tile. */
function asTilePosition(localXY, tileZoom) {
  var worldX = localXY[0] + MAP.center.x;
  var worldY = localXY[1] + MAP.center.y;
  var worldSize = TILE_SIZE*Math.pow(2, MAP.zoom);

  var tileX = worldX / worldSize * Math.pow(2, tileZoom);
  var tileY = worldY / worldSize * Math.pow(2, tileZoom);

  return [tileX, tileY];
}

function sub3(a,b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];}
function add3(a,b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];}
function mul3scalar(a,f) { return [a[0]*f, a[1]*f, a[2]*f];}
function len3(a)   { return Math.sqrt( a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);}
function norm3(a)  { var l = len3(a); return [a[0]/l, a[1]/l, a[2]/l]; }
function dist3(a,b){ return len3(sub3(a,b));}


var render = {

  getFramebufferConfig: function(width, height, maxTexSize) {
    var config = {};

    config.width = Math.min(glx.util.nextPowerOf2(width),  maxTexSize );
    config.height= Math.min(glx.util.nextPowerOf2(height), maxTexSize );

    config.usedWidth = Math.min(width, config.width);
    config.usedHeight= Math.min(height,config.height);

    config.tcLeft  = 0.5 / config.width;
    config.tcTop   = 0.5 / config.height;
    config.tcRight = (config.usedWidth  - 0.5) / config.width;
    config.tcBottom= (config.usedHeight - 0.5) / config.height;

    return config;
  },

  /* returns the quadrilateral part of the XY plane that is currently visible on
   * screen. The quad is returned in tile coordinates for tile zoom level
   * 'tileZoomLevel', and thus can directly be used to determine which basemap
   * and geometry tiles need to be loaded.
   * Note: if the horizon is level (as should usually be the case for 
   * OSMBuildings) then said quad is also a trapezoid. */
  getViewQuad: function(viewProjectionMatrix, tileZoomLevel) {
    //FIXME: determine a reasonable value (4000 was chosen rather arbitrarily)
    var MAX_EDGE_LENGTH = 4000; 

    var inverse = glx.Matrix.invert(viewProjectionMatrix);

    var vBottomLeft  = getIntersectionWithXYPlane(-1, -1, inverse);
    var vBottomRight = getIntersectionWithXYPlane( 1, -1, inverse);
    var vTopRight    = getIntersectionWithXYPlane( 1,  1, inverse);
    var vTopLeft     = getIntersectionWithXYPlane(-1,  1, inverse);

    /* If even the lower edge of the screen does not intersect with the map plane,
     * then the map plane is not visible at all.
     * (Or somebody screwed up the projection matrix, putting view upside-down 
     *  or something. But in any case we won't attempt to create a view rectangle).
     */
    if (!vBottomLeft || !vBottomRight) {
      return;
    }

    var vLeftDir, vRightDir, vLeftPoint, vRightPoint;

    /* The lower screen edge shows the map layer, but the upper one does not.
     * This usually happens when the camera is close to parallel to the ground
     * so that the upper screen edge lies above the horizon. This is not a bug
     * and can legitimately happen. But from a theoretical standpoint, this means 
     * that the view 'trapezoid' stretches infinitely toward the horizon. Since this
     * is not a practically useful result - though formally correct - we instead
     * manually bound that area.*/
    if (!vTopLeft || !vTopRight) {
      /* This point is chosen somewhat arbitrarily. It just *has* to lie on the
       * left edge of the screen. And it *should* be located relatively low
       * on that edge to ensure it lies below the horizon, but should not be too
       * close to 'vBottomLeft' to not cause numerical accuracy issues when computing
       * the vector between this point and 'vBottomLeft'. The value '-0.9' was 
       * chosen as it fits these criteria quite well, but no effort was made
       * to guarantee an *optimal* fit.  */
      vLeftPoint = getIntersectionWithXYPlane(-1, -0.9, inverse);
      vLeftDir = norm3(sub3( vLeftPoint, vBottomLeft));
      vTopLeft = add3( vBottomLeft, mul3scalar(vLeftDir, MAX_EDGE_LENGTH));
      
      /* arbitrary point on the right screen edge, subject to the same
       * requirements as 'vLeftPoint' */
      vRightPoint = getIntersectionWithXYPlane( 1, -0.9, inverse);
      vRightDir = norm3(sub3(vRightPoint, vBottomRight));
      vTopRight = add3(vBottomRight, mul3scalar(vRightDir, MAX_EDGE_LENGTH));
    }
    
    /* if vTopLeft is further than MAX_EDGE_LENGTH away from vBottomLeft,
     * move it closer. */
    if (dist3(vBottomLeft, vTopLeft) > MAX_EDGE_LENGTH) {
      vLeftDir = norm3(sub3(vTopLeft, vBottomLeft));
      vTopLeft = add3(vBottomLeft, mul3scalar(vLeftDir, MAX_EDGE_LENGTH));
    }
    
    /* do the same for the right edge */
    if (dist3(vBottomRight, vTopRight) > MAX_EDGE_LENGTH) {
      vRightDir = norm3(sub3(vTopRight, vBottomRight));
      vTopRight = add3(vBottomRight, mul3scalar(vRightDir, MAX_EDGE_LENGTH));
    }
    
    //return [ vBottomLeft, vBottomRight, vTopRight, vTopLeft];
    
    return [asTilePosition(vBottomLeft,  tileZoomLevel),
            asTilePosition(vBottomRight, tileZoomLevel),
            asTilePosition(vTopRight,    tileZoomLevel),
            asTilePosition(vTopLeft,     tileZoomLevel)];
  },

  start: function() {
    this.viewMatrix = new glx.Matrix();
    this.projMatrix = new glx.Matrix();
    this.viewProjMatrix = new glx.Matrix();

    MAP.on('change', this._onChange = this.onChange.bind(this));
    this.onChange();

    MAP.on('resize', this._onResize = this.onResize.bind(this));
    this.onResize();

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    render.Interaction.init(); // renders only on demand
    render.SkyDome.init();
    render.Buildings.init();
    render.Basemap.init();
    render.HudRect.init();
    render.Overlay.init();
    render.NormalMap.init();
    render.DepthMap.init();
    render.AmbientMap.init();
    render.Blur.init();
    
    //var quad = new mesh.DebugQuad();
    //quad.updateGeometry( [-100, -100, 1], [100, -100, 1], [100, 100, 1], [-100, 100, 1]);
    //data.Index.add(quad);

    this.loop = setInterval(function() {
      requestAnimationFrame(function() {
        gl.clearColor(this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (MAP.zoom < APP.minZoom || MAP.zoom > APP.maxZoom) {
          return;
        }

        //var viewTrapezoid = this.getViewQuad( this.viewProjMatrix.data, 16);
        //console.log( this.getTilesInQuad( viewTrapezoid) );
        //var s = "";
        //for (var i in window.tiles)
        //  s+= window.tiles[i][0] + ", " + window.tiles[i][1] + "\n";
        //window.s = s;
        //console.log(window.tiles.length);
        //console.log( viewTrapezoid[0], viewTrapezoid[1], viewTrapezoid[2], viewTrapezoid[3] );
        //quad.updateGeometry(viewTrapezoid[0], viewTrapezoid[1], viewTrapezoid[2], viewTrapezoid[3]);

        render.SkyDome.render();
        render.Buildings.render();
        render.Basemap.render();

        //render.NormalMap.render();

        if (render.optimize === 'quality') {
          var config = this.getFramebufferConfig(MAP.width, MAP.height, gl.getParameter(gl.MAX_TEXTURE_SIZE));

          render.DepthMap.render(config);
          render.AmbientMap.render(render.DepthMap.framebuffer.renderTexture.id, config, 0.5);
          render.Blur.render(render.AmbientMap.framebuffer.renderTexture.id, config);
        
          gl.blendFunc(gl.ZERO, gl.SRC_COLOR); //multiply DEST_COLOR by SRC_COLOR
          gl.enable(gl.BLEND);
          render.Overlay.render( render.Blur.framebuffer.renderTexture.id, config);
          gl.disable(gl.BLEND);
        }

      }.bind(this));
    }.bind(this), 17);
  },

  stop: function() {
    clearInterval(this.loop);
  },

  onChange: function() {
    this.viewMatrix = new glx.Matrix()
      .rotateZ(MAP.rotation)
      .rotateX(MAP.tilt);

    this.viewProjMatrix = new glx.Matrix(glx.Matrix.multiply(this.viewMatrix, this.projMatrix));
  },

  onResize: function() {
    var
      width = MAP.width,
      height = MAP.height,
      refHeight = 1024,
      refVFOV = 45;

      this.projMatrix = new glx.Matrix()
      .translate(0, -height/2, -1220) // 0, MAP y offset to neutralize camera y offset, MAP z -1220 scales MAP tiles to ~256px
      .scale(1, -1, 1) // flip Y
      .multiply(new glx.Matrix.Perspective(refVFOV * height / refHeight, width/height, 0.1, 5000))
      .translate(0, -1, 0); // camera y offset

    glx.context.canvas.width  = width;
    glx.context.canvas.height = height;
    glx.context.viewport(0, 0, width, height);

    this.viewProjMatrix = new glx.Matrix(glx.Matrix.multiply(this.viewMatrix, this.projMatrix));

    this.fogRadius = Math.sqrt(width*width + height*height) * 1.1; // 2 would fit fine but camera is too close
  },

  destroy: function() {
    MAP.off('change', this._onChange);
    MAP.off('resize', this._onResize);

    this.stop();
    render.Interaction.destroy();
    render.SkyDome.destroy();
    render.Buildings.destroy();
    render.Basemap.destroy();

    render.HudRect.destroy();
    render.Overlay.destroy();
    render.NormalMap.destroy();
    render.DepthMap.destroy();
    render.AmbientMap.destroy();
    render.Blur.destroy();
  }
};


// TODO: perhaps render only clicked area

render.Interaction = {

  idMapping: [null],
  viewportSize: 512,

  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.interaction.vertex,
      fragmentShader: Shaders.interaction.fragment,
      attributes: ['aPosition', 'aID', 'aFilter'],
      uniforms: [
        'uModelMatrix',
        'uViewMatrix',
        'uProjMatrix',
        'uMatrix',
        'uFogRadius',
        'uBendRadius',
        'uBendDistance',
        'uTime'
      ]
    });

    this.framebuffer = new glx.Framebuffer(this.viewportSize, this.viewportSize);
  },

  // TODO: throttle calls
  getTarget: function(x, y) {
    var
      shader = this.shader,
      framebuffer = this.framebuffer;

    gl.viewport(0, 0, this.viewportSize, this.viewportSize);
    shader.enable();
    framebuffer.enable();

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f(shader.uniforms.uFogRadius, render.fogRadius);

    gl.uniform1f(shader.uniforms.uBendRadius, render.bendRadius);
    gl.uniform1f(shader.uniforms.uBendDistance, render.bendDistance);

    gl.uniform1f(shader.uniforms.uTime, Filter.time());

    gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);

    var
      dataItems = data.Index.items,
      item,
      modelMatrix;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (MAP.zoom < item.minZoom || MAP.zoom > item.maxZoom) {
        continue;
      }

      if (!(modelMatrix = item.getMatrix())) {
        continue;
      }

      gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.idBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aID, item.idBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.filterBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aFilter, item.filterBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    var imageData = framebuffer.getData();

    // DEBUG
    // // disable framebuffer
    // var imageData = new Uint8Array(MAP.width*MAP.height*4);
    shader.disable();
    framebuffer.disable();

    gl.viewport(0, 0, MAP.width, MAP.height);

    //var index = ((MAP.height-y/)*MAP.width + x) * 4;
    x = x/MAP.width*this.viewportSize <<0;
    y = y/MAP.height*this.viewportSize <<0;
    var index = ((this.viewportSize-y)*this.viewportSize + x) * 4;
    var color = imageData[index] | (imageData[index + 1]<<8) | (imageData[index + 2]<<16);

    return this.idMapping[color];
  },

  idToColor: function(id) {
    var index = this.idMapping.indexOf(id);
    if (index === -1) {
      this.idMapping.push(id);
      index = this.idMapping.length-1;
    }
    return [
      ( index        & 0xff) / 255,
      ((index >>  8) & 0xff) / 255,
      ((index >> 16) & 0xff) / 255
    ];
  },

  destroy: function() {}
};


render.SkyDome = {

  init: function() {
    var geometry = this.createGeometry(this.baseRadius);
    this.vertexBuffer   = new glx.Buffer(3, new Float32Array(geometry.vertices));
    this.texCoordBuffer = new glx.Buffer(2, new Float32Array(geometry.texCoords));

    this.shader = new glx.Shader({
      vertexShader: Shaders.skydome.vertex,
      fragmentShader: Shaders.skydome.fragment,
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uModelMatrix', 'uViewMatrix', 'uProjMatrix', 'uMatrix', 'uTexIndex', 'uFogColor', 'uBendRadius', 'uBendDistance']
    });

    Activity.setBusy();
    var url = APP.baseURL + '/skydome.jpg';
    this.texture = new glx.texture.Image().load(url, function(image) {
      Activity.setIdle();
      if (image) {
        this.isReady = true;
      }
    }.bind(this));
  },

  baseRadius: 500,

  createGeometry: function(radius) {
    var
      latSegments = 8,
      lonSegments = 24,
      vertices = [],
      texCoords = [],
      sin = Math.sin,
      cos = Math.cos,
      PI = Math.PI,
      azimuth1, x1, y1,
      azimuth2, x2, y2,
      polar1,
      polar2,
      A, B, C, D,
      tcLeft,
      tcRight,
      tcTop,
      tcBottom;

    for (var i = 0, j; i < lonSegments; i++) {
      tcLeft = i/lonSegments;
      azimuth1 = tcLeft*2*PI; // convert to radiants [0...2*PI]
      x1 = cos(azimuth1)*radius;
      y1 = sin(azimuth1)*radius;

      tcRight = (i+1)/lonSegments;
      azimuth2 = tcRight*2*PI;
      x2 = cos(azimuth2)*radius;
      y2 = sin(azimuth2)*radius;

      for (j = 0; j < latSegments; j++) {
        polar1 = j*PI/(latSegments*2); //convert to radiants in [0..1/2*PI]
        polar2 = (j+1)*PI/(latSegments*2);

        A = [x1*cos(polar1), y1*cos(polar1), radius*sin(polar1)];
        B = [x2*cos(polar1), y2*cos(polar1), radius*sin(polar1)];
        C = [x2*cos(polar2), y2*cos(polar2), radius*sin(polar2)];
        D = [x1*cos(polar2), y1*cos(polar2), radius*sin(polar2)];

        vertices.push.apply(vertices, A);
        vertices.push.apply(vertices, B);
        vertices.push.apply(vertices, C);
        vertices.push.apply(vertices, A);
        vertices.push.apply(vertices, C);
        vertices.push.apply(vertices, D);

        tcTop    = 1 - (j+1)/latSegments;
        tcBottom = 1 - j/latSegments;

        texCoords.push(tcLeft, tcBottom, tcRight, tcBottom, tcRight, tcTop, tcLeft, tcBottom, tcRight, tcTop, tcLeft, tcTop);
      }
    }

    return { vertices: vertices, texCoords: texCoords };
  },

  render: function() {
    if (!this.isReady) {
      return;
    }

    var
      fogColor = render.fogColor,
      shader = this.shader;

    shader.enable();

    gl.uniform3fv(shader.uniforms.uFogColor, fogColor);

    gl.uniform1f(shader.uniforms.uBendRadius, render.bendRadius);
    gl.uniform1f(shader.uniforms.uBendDistance, render.bendDistance);

    var modelMatrix = new glx.Matrix();
    var scale = render.fogRadius/this.baseRadius;
    modelMatrix.scale(scale, scale, scale);

    gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

    this.vertexBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    this.texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.uniform1i(shader.uniforms.uTexIndex, 0);

    this.texture.enable(0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
  },

  destroy: function() {
    this.texture.destroy();
  }
};


render.Buildings = {

  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.buildings.vertex,
      fragmentShader: Shaders.buildings.fragment,
      attributes: ['aPosition', 'aColor', 'aFilter', 'aNormal', 'aID'],
      uniforms: [
        'uModelMatrix',
        'uViewMatrix',
        'uProjMatrix',
        'uMatrix',
        'uNormalTransform',
        'uAlpha',
        'uLightColor',
        'uLightDirection',
        'uFogRadius',
        'uFogColor',
        'uBendRadius',
        'uBendDistance',
        'uHighlightColor',
        'uHighlightID',
        'uTime'
      ]
    });
  },

  render: function(radius, distance) {
//  gl.enable(gl.BLEND);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//  gl.disable(gl.DEPTH_TEST);

    var shader = this.shader;
    shader.enable();

    if (this.showBackfaces) {
      gl.disable(gl.CULL_FACE);
    }

    // TODO: suncalc
    gl.uniform3fv(shader.uniforms.uLightColor, [0.5, 0.5, 0.5]);
    gl.uniform3fv(shader.uniforms.uLightDirection, unit(1, 1, 1));

    var normalMatrix = glx.Matrix.invert3(new glx.Matrix().data);
    gl.uniformMatrix3fv(shader.uniforms.uNormalTransform, false, glx.Matrix.transpose(normalMatrix));

    gl.uniform1f(shader.uniforms.uFogRadius, render.fogRadius);
    gl.uniform3fv(shader.uniforms.uFogColor, render.fogColor);

    gl.uniform1f(shader.uniforms.uBendRadius, render.bendRadius);
    gl.uniform1f(shader.uniforms.uBendDistance, render.bendDistance);

    gl.uniform3fv(shader.uniforms.uHighlightColor, render.highlightColor);

    gl.uniform1f(shader.uniforms.uTime, Filter.time());

    if (!this.highlightID) {
      this.highlightID = [0, 0, 0];
    }
    gl.uniform3fv(shader.uniforms.uHighlightID, this.highlightID);

    gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);

    var
      dataItems = data.Index.items,
      item,
      modelMatrix;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      // no visibility check needed, Grid.purge() is taking care

      item = dataItems[i];

      if (MAP.zoom < item.minZoom || MAP.zoom > item.maxZoom) {
        continue;
      }

      if (!(modelMatrix = item.getMatrix())) {
        continue;
      }

      gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.normalBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aNormal, item.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.colorBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aColor, item.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.filterBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aFilter, item.filterBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.idBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aID, item.idBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    if (this.showBackfaces) {
      gl.enable(gl.CULL_FACE);
    }

    shader.disable();
  },

  destroy: function() {}
};


render.Basemap = {

  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.basemap.vertex,
      fragmentShader: Shaders.basemap.fragment,
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uModelMatrix', 'uViewMatrix', 'uProjMatrix', 'uMatrix', 'uTexIndex', 'uFogRadius', 'uFogColor', 'uBendRadius', 'uBendDistance']
    });
  },

  render: function() {
    var layer = APP._basemapGrid;

    if (!layer) {
      return;
    }

    if (MAP.zoom < layer.minZoom || MAP.zoom > layer.maxZoom) {
      return;
    }

    var
      shader = this.shader,
      tile, modelMatrix,
      tileZoom = Math.round(MAP.zoom),
      ratio = 1 / Math.pow(2, tileZoom - MAP.zoom),
      mapCenter = MAP.center;

    shader.enable();

    gl.uniform1f(shader.uniforms.uFogRadius, render.fogRadius);
    gl.uniform3fv(shader.uniforms.uFogColor, render.fogColor);

    gl.uniform1f(shader.uniforms.uBendRadius, render.bendRadius);
    gl.uniform1f(shader.uniforms.uBendDistance, render.bendDistance);

    for (var key in layer.tiles) {
      tile = layer.tiles[key];

      // no visibility check needed, Grid.purge() is taking care
      if (!tile.isReady) {
        continue;
      }

      modelMatrix = new glx.Matrix();
      modelMatrix.scale(ratio, ratio, 1);
      modelMatrix.translate(tile.x * TILE_SIZE * ratio - mapCenter.x, tile.y * TILE_SIZE * ratio - mapCenter.y, 0);

      gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

      tile.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, tile.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      tile.texCoordBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aTexCoord, tile.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.uniform1i(shader.uniforms.uTexIndex, 0);

      tile.texture.enable(0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, tile.vertexBuffer.numItems);
    }

    shader.disable();
  },

  destroy: function() {}
};


/* 'HudRect' renders a textured rectangle to the top-right quarter of the viewport.
   The intended use is visualize render-to-texture effects during development.
 */
render.HudRect = {

  init: function() {
  
    var geometry = this.createGeometry();
    this.vertexBuffer   = new glx.Buffer(3, new Float32Array(geometry.vertices));
    this.texCoordBuffer = new glx.Buffer(2, new Float32Array(geometry.texCoords));

    this.shader = new glx.Shader({
      vertexShader: Shaders.texture.vertex,
      fragmentShader: Shaders.texture.fragment,
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: [ 'uMatrix', 'uTexIndex', 'uColor']
    });
  },

  createGeometry: function() {
    var vertices = [],
        texCoords= [];
    vertices.push(0, 0, 1E-5,
                  1, 0, 1E-5,
                  1, 1, 1E-5);
    
    vertices.push(0, 0, 1E-5,
                  1, 1, 1E-5,
                  0, 1, 1E-5);

    texCoords.push(0.5,0.5,
                   1.0,0.5,
                   1.0,1.0);

    texCoords.push(0.5,0.5,
                   1.0,1.0,
                   0.5,1.0);

    return { vertices: vertices , texCoords: texCoords };
  },

  render: function(texture) {
    var shader = this.shader;

    shader.enable();
    
    var identity = new glx.Matrix();
    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, identity.data);
    this.vertexBuffer.enable();

    gl.vertexAttribPointer(shader.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    this.texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shader.uniforms.uTexIndex, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
  },

  destroy: function() {
    this.texture.destroy();
  }
};


/* 'NormalMap' renders the surface normals of the current view into a texture.
   This normal texture can then be used for screen-space effects such as outline rendering
   and screen-space ambient occlusion (SSAO).
   
   TODO: convert normals from world-space to screen-space?

*/
render.NormalMap = {

  viewportSize: 512,

  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.normalmap.vertex,
      fragmentShader: Shaders.normalmap.fragment,
      attributes: ['aPosition', 'aNormal', 'aFilter'],
      uniforms: ['uMatrix', 'uTime']
    });

    this.framebuffer = new glx.Framebuffer(this.viewportSize, this.viewportSize);
    // enable texture filtering for framebuffer texture
    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.mapPlane = new mesh.MapPlane();
  },

  render: function() {

    var
      shader = this.shader,
      framebuffer = this.framebuffer;

    gl.viewport(0, 0, this.viewportSize, this.viewportSize);
    shader.enable();
    framebuffer.enable();

    //the color (0.5, 0.5, 1) corresponds to the normal (0, 0, 1), i.e. 'up'.
    gl.clearColor(0.5, 0.5, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f(shader.uniforms.uTime, Filter.time());

    var
      dataItems = data.Index.items.concat([this.mapPlane]),
      item,
      modelMatrix;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (MAP.zoom < item.minZoom || MAP.zoom > item.maxZoom) {
        continue;
      }

      if (!(modelMatrix = item.getMatrix())) {
        continue;
      }

      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.normalBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aNormal, item.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.filterBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aFilter, item.filterBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    shader.disable();
    framebuffer.disable();

    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
    gl.generateMipmap(gl.TEXTURE_2D);
    
    gl.viewport(0, 0, MAP.width, MAP.height);

  },

  destroy: function() {}
};


/* 'DepthMap' renders depth buffer of the current view into a texture. To be compatible with as
   many devices as possible, this code does not use the WEBGL_depth_texture extension, but
   instead color-codes the depth value into an ordinary RGB8 texture.

   This depth texture can then be used for effects such as outline rendering, screen-space
   ambient occlusion (SSAO) and shadow mapping.
   
*/
render.DepthMap = {


  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.depth.vertex,
      fragmentShader: Shaders.depth.fragment,
      attributes: ['aPosition', 'aFilter'],
      uniforms: ['uMatrix', 'uModelMatrix', 'uFogRadius', 'uTime']
    });

    this.framebuffer = new glx.Framebuffer(128, 128); //dummy values, will be resized dynamically

    this.mapPlane = new mesh.MapPlane();
  },

  render: function(framebufferConfig) {

    var
      shader = this.shader,
      framebuffer = this.framebuffer;


    if (framebuffer.width != framebufferConfig.width || 
        framebuffer.height!= framebufferConfig.height)
    {
      framebuffer.setSize( framebufferConfig.width, framebufferConfig.height );

      /* We will be sampling neighboring pixels of the depth texture to create an ambient
       * occlusion map. With the default texture wrap mode 'gl.REPEAT', sampling the neighbors
       * of edge texels would return texels on the opposite edge of the texture, which is not
       * what we want. Setting the wrap mode to 'gl.CLAMP_TO_EDGE' instead returns 
       * the texels themselves, which is far more useful for ambient occlusion maps */
      gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      /* We will explicitly access (neighbor) texel in depth texture to compute the ambient map.
       * So linear interpolation or mip-mapping of texels neither necessary nor desirable.
       * Disabling it can also noticably improve render performance, as it leads to fewer
       * texture lookups (1 for "NEAREST" vs. 4 for "LINEAR" vs. 8 for "LINEAR_MIPMAP_LINEAR");
       */
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
      
    gl.viewport(0, 0, framebufferConfig.usedWidth, framebufferConfig.usedHeight);
    shader.enable();
    framebuffer.enable();

    gl.clearColor(0.0, 0.0, 0.0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var item, modelMatrix;

    gl.uniform1f(shader.uniforms.uTime, Filter.time());
    gl.uniform1f(shader.uniforms.uFogRadius, render.fogRadius);

    // render all actual data items, but also a dummy map plane
    // Note: SSAO on the map plane has been disabled temporarily
    var dataItems = data.Index.items;//.concat([this.mapPlane]);

    for (var i = 0; i < dataItems.length; i++) {
      item = dataItems[i];

      if (MAP.zoom < item.minZoom || MAP.zoom > item.maxZoom) {
        continue;
      }

      if (!(modelMatrix = item.getMatrix())) {
        continue;
      }

      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));
      gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.filterBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aFilter, item.filterBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    shader.disable();
    framebuffer.disable();

    gl.viewport(0, 0, MAP.width, MAP.height);
  },

  destroy: function() {}
};


render.AmbientMap = {

  init: function() {
    this.shader = new glx.Shader({
      vertexShader:   Shaders.ambientFromDepth.vertex,
      fragmentShader: Shaders.ambientFromDepth.fragment,
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uMatrix', 'uInverseTexWidth', 'uInverseTexHeight', 'uTexIndex', 'uEffectStrength']
    });

    this.framebuffer = new glx.Framebuffer(128, 128); //dummy value, size will be set dynamically
    
    this.vertexBuffer = new glx.Buffer(3, new Float32Array([
      -1, -1, 1E-5,
       1, -1, 1E-5,
       1,  1, 1E-5,
      -1, -1, 1E-5,
       1,  1, 1E-5,
      -1,  1, 1E-5
    ]));
       
    this.texCoordBuffer = new glx.Buffer(2, new Float32Array([
      0,0,
      1,0,
      1,1,
      0,0,
      1,1,
      0,1
    ]));
  },

  render: function(depthTexture, framebufferConfig, effectStrength) {

    var
      shader = this.shader,
      framebuffer = this.framebuffer;

    if (effectStrength === undefined) {
      effectStrength = 1.0;
    }

    if (framebuffer.width != framebufferConfig.width || 
        framebuffer.height!= framebufferConfig.height)
    {
      framebuffer.setSize( framebufferConfig.width, framebufferConfig.height );
      gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
      // we'll render the blurred image 1:1 to the screen pixels,
      // so no interpolation is necessary
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }


    if (framebufferConfig.tcRight  != this.tcRight || 
        framebufferConfig.tcTop    != this.tcTop   || 
        framebufferConfig.tcLeft   != this.tcLeft  ||
        framebufferConfig.tcBottom != this.tcBottom )
    {
      this.texCoordBuffer.destroy();
      this.texCoordBuffer = new glx.Buffer(2, new Float32Array(
        [framebufferConfig.tcLeft,  framebufferConfig.tcTop,
         framebufferConfig.tcRight, framebufferConfig.tcTop,
         framebufferConfig.tcRight, framebufferConfig.tcBottom,
         framebufferConfig.tcLeft,  framebufferConfig.tcTop,
         framebufferConfig.tcRight, framebufferConfig.tcBottom,
         framebufferConfig.tcLeft,  framebufferConfig.tcBottom
        ]));      
    
      this.tcRight = framebufferConfig.tcRight;
      this.tcBottom= framebufferConfig.tcBottom;
      this.tcLeft =  framebufferConfig.tcLeft;
      this.tcTop =   framebufferConfig.tcTop;
    }
    gl.viewport(0, 0, framebufferConfig.usedWidth, framebufferConfig.usedHeight);
    shader.enable();
    framebuffer.enable();

    gl.clearColor(1.0, 0.0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    var identity = new glx.Matrix();
    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, identity.data);

    gl.uniform1f(shader.uniforms.uInverseTexWidth,  1/framebufferConfig.width);
    gl.uniform1f(shader.uniforms.uInverseTexHeight, 1/framebufferConfig.height);
    gl.uniform1f(shader.uniforms.uEffectStrength,  effectStrength);

    this.vertexBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    this.texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shader.uniforms.uTexIndex, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
    framebuffer.disable();

    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
    //gl.generateMipmap(gl.TEXTURE_2D); //no interpolation --> don't need a mipmap
    
    gl.viewport(0, 0, MAP.width, MAP.height);

  },

  destroy: function() {}
};


/* 'Overlay' renders part of a texture over the whole viewport.
   The intended use is for compositing of screen-space effects.
 */
render.Overlay = {

  init: function() {
  
    var geometry = this.createGeometry();
    this.vertexBuffer   = new glx.Buffer(3, new Float32Array(geometry.vertices));
    this.texCoordBuffer = new glx.Buffer(2, new Float32Array(geometry.texCoords));

    this.shader = new glx.Shader({
      vertexShader: Shaders.texture.vertex,
      fragmentShader: Shaders.texture.fragment,
      attributes: ["aPosition", "aTexCoord"],
      uniforms: [ "uMatrix", "uTexIndex", "uColor"]
    });
  },

  createGeometry: function() {
    var vertices = [],
        texCoords= [];
    vertices.push(-1,-1, 1E-5,
                   1,-1, 1E-5,
                   1, 1, 1E-5);
    
    vertices.push(-1,-1, 1E-5,
                   1, 1, 1E-5,
                  -1, 1, 1E-5);

    texCoords.push(0.0,0.0,
                   1.0,0.0,
                   1.0,1.0);

    texCoords.push(0.0,0.0,
                   1.0,1.0,
                   0.0,1.0);

    return { vertices: vertices , texCoords: texCoords };
  },

  render: function(texture, framebufferConfig) {
    var tcHorizMin, tcVertMin, tcHorizMax, tcVertMax;
    
    if (framebufferConfig !== undefined)
    {
      tcHorizMin = 0.5                                  / framebufferConfig.width;
      tcHorizMax = (framebufferConfig.usedWidth  - 0.5) / framebufferConfig.width;
      tcVertMin  = 0.5                                  / framebufferConfig.height;
      tcVertMax  = (framebufferConfig.usedHeight - 0.5) / framebufferConfig.height;
    } else
    {
      tcHorizMin = tcVertMin = 0.0;
      tcHorizMax = tcVertMax = 1.0;
    }

    if (tcHorizMin != this.tcHorizMin ||
        tcHorizMax != this.tcHorizMax ||
        tcVertMin != this.tcVertMin ||
        tcVertMax != this.tcVertMax)
    {
      //console.log("resetting texCoord buffer to", tcHorizMin, tcHorizMax, tcVertMin, tcVertMax);
      this.texCoordBuffer.destroy();
      this.texCoordBuffer = new glx.Buffer(2, new Float32Array([
        tcHorizMin, tcVertMin,
        tcHorizMax, tcVertMin,
        tcHorizMax, tcVertMax,

        tcHorizMin, tcVertMin,
        tcHorizMax, tcVertMax,
        tcHorizMin, tcVertMax]));
      
      this.tcHorizMin = tcHorizMin;
      this.tcHorizMax = tcHorizMax;
      this.tcVertMin  = tcVertMin;
      this.tcVertMax  = tcVertMax;
    }

    var shader = this.shader;

    shader.enable();
    
    var identity = new glx.Matrix();
    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, identity.data);
    this.vertexBuffer.enable();

    gl.vertexAttribPointer(shader.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    this.texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shader.uniforms.uTexIndex, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
  },

  destroy: function() {
    this.texture.destroy();
  }
};


render.Blur = {

  init: function() {
    this.shader = new glx.Shader({
      vertexShader:   Shaders.blur.vertex,
      fragmentShader: Shaders.blur.fragment,
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uMatrix', 'uInverseTexWidth', 'uInverseTexHeight', 'uTexIndex']
    });

    this.framebuffer = new glx.Framebuffer(128, 128); //dummy value, size will be set dynamically
    
    this.vertexBuffer = new glx.Buffer(3, new Float32Array([
      -1, -1, 1E-5,
       1, -1, 1E-5,
       1,  1, 1E-5,
      -1, -1, 1E-5,
       1,  1, 1E-5,
      -1,  1, 1E-5
    ]));
       
    this.texCoordBuffer = new glx.Buffer(2, new Float32Array([
      0,0,
      1,0,
      1,1,
      0,0,
      1,1,
      0,1
    ]));
  },

  render: function(inputTexture, framebufferConfig) {

    var
      shader = this.shader,
      framebuffer = this.framebuffer;


    if (framebuffer.width != framebufferConfig.width || 
        framebuffer.height!= framebufferConfig.height)
    {
      framebuffer.setSize( framebufferConfig.width, framebufferConfig.height );
      gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
      // we'll render the blurred image 1:1 to the screen pixels,
      // so no interpolation is necessary
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }


    if (framebufferConfig.tcRight  != this.tcRight || 
        framebufferConfig.tcTop    != this.tcTop   || 
        framebufferConfig.tcLeft   != this.tcLeft  ||
        framebufferConfig.tcBottom != this.tcBottom )
    {
      this.texCoordBuffer.destroy();
      this.texCoordBuffer = new glx.Buffer(2, new Float32Array(
        [framebufferConfig.tcLeft,  framebufferConfig.tcTop,
         framebufferConfig.tcRight, framebufferConfig.tcTop,
         framebufferConfig.tcRight, framebufferConfig.tcBottom,
         framebufferConfig.tcLeft,  framebufferConfig.tcTop,
         framebufferConfig.tcRight, framebufferConfig.tcBottom,
         framebufferConfig.tcLeft,  framebufferConfig.tcBottom
        ]));      
    
      this.tcRight = framebufferConfig.tcRight;
      this.tcBottom= framebufferConfig.tcBottom;
      this.tcLeft =  framebufferConfig.tcLeft;
      this.tcTop =   framebufferConfig.tcTop;
    }

    gl.viewport(0, 0, framebufferConfig.usedWidth, framebufferConfig.usedHeight);
    shader.enable();
    framebuffer.enable();

    gl.clearColor(1.0, 0.0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    var identity = new glx.Matrix();
    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, identity.data);

    gl.uniform1f(shader.uniforms.uInverseTexWidth,  1/framebuffer.width);
    gl.uniform1f(shader.uniforms.uInverseTexHeight, 1/framebuffer.height);

    this.vertexBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    this.texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shader.uniforms.uTexIndex, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
    framebuffer.disable();

    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
    //gl.generateMipmap(gl.TEXTURE_2D); //no interpolation --> don't need a mipmap
    
    gl.viewport(0, 0, MAP.width, MAP.height);

  },

  destroy: function() {}
};


var basemap = {};


basemap.Tile = function(x, y, zoom) {
  this.x = x;
  this.y = y;
  this.zoom = zoom;
  this.key = [x, y, zoom].join(',');

  var numSegments = 4;

  var meshStep = 256/numSegments;
  var textureStep = 1/numSegments;

  var vertices = [];
  var texCoords = [];

  // TODO: can probably be 1x1 again when better fog is in place
  for (var cols = 0; cols < numSegments; cols++) {
    for (var rows = 0; rows < numSegments; rows++) {
      vertices.push(
        (cols+1)*meshStep, (rows+1)*meshStep, 0,
        (cols+1)*meshStep, (rows+0)*meshStep, 0,
        (cols+0)*meshStep, (rows+1)*meshStep, 0,
        (cols+0)*meshStep, (rows+0)*meshStep, 0
      );

      texCoords.push(
        (cols+1)*textureStep, (rows+1)*textureStep,
        (cols+1)*textureStep, (rows+0)*textureStep,
        (cols+0)*textureStep, (rows+1)*textureStep,
        (cols+0)*textureStep, (rows+0)*textureStep
      );
    }
  }

  this.vertexBuffer = new glx.Buffer(3, new Float32Array(vertices));
  this.texCoordBuffer = new glx.Buffer(2, new Float32Array(texCoords));
};

basemap.Tile.prototype = {
  load: function(url) {
    Activity.setBusy();
    this.texture = new glx.texture.Image().load(url, function(image) {
      Activity.setIdle();
      if (image) {
        this.isReady = true;
        /* The whole texture will be mapped to fit the whole tile exactly. So
         * don't attempt to wrap around the texture coordinates. */
        gl.bindTexture(gl.TEXTURE_2D, this.texture.id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      }
    }.bind(this));
  },

  destroy: function() {
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();
    if (this.texture) {
      this.texture.destroy();
    }
  }
};
}(this));