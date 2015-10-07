/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(global) {
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
	    a = (r.a !== undefined ? r.a : 1);
	    r = r.r / 255;
	  } else {
	    r /= 255;
	    g /= 255;
	    b /= 255;
	    a = (a !== undefined ? a : 1);
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

	  toRGBA: function(normalized) {
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

	    if (normalized) {
	      return rgba;
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
	  }
	};


	glx.Framebuffer = function(width, height) {
	  this.setSize(width, height);
	};

	glx.Framebuffer.prototype = {

	  setSize: function(width, height) {
	    this.frameBuffer = GL.createFramebuffer();
	    GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);

	    this.width  = width;
	    this.height = height;
	    var size = glx.util.nextPowerOf2(Math.max(this.width, this.height));

	    this.renderBuffer = GL.createRenderbuffer();
	    GL.bindRenderbuffer(GL.RENDERBUFFER, this.renderBuffer);
	    GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, size, size);

	    if (this.renderTexture) {
	      this.renderTexture.destroy();
	    }

	    this.renderTexture = new glx.texture.Data(size);

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
	  
	  destroy: function() {}
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


	glx.texture.Image = function(src, callback) {
	  this.id = GL.createTexture();
	  GL.bindTexture(GL.TEXTURE_2D, this.id);

	  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
	  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
	//GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
	//GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

	  GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
	  GL.bindTexture(GL.TEXTURE_2D, null);

	  var image = new Image();

	  image.crossOrigin = '*';

	  image.onload = function() {
	    // TODO: do this only once
	    var maxTexSize = GL.getParameter(GL.MAX_TEXTURE_SIZE);
	    if (image.width > maxTexSize || image.height > maxTexSize) {
	      var w = maxTexSize, h = maxTexSize;
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
	      image = canvas;
	    }

	    if (!this.id) {
	      image = null;
	    } else {
	      GL.bindTexture(GL.TEXTURE_2D, this.id);
	      GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
	      GL.generateMipmap(GL.TEXTURE_2D);
	    
	      if (GL.anisotropyExtension) {
	        GL.texParameterf(
	          GL.TEXTURE_2D,
	          GL.anisotropyExtension.TEXTURE_MAX_ANISOTROPY_EXT,
	          GL.anisotropyExtension.maxAnisotropyLevel
	        );
	      }
	      GL.bindTexture(GL.TEXTURE_2D, null);
	    }

	    if (callback) {
	      callback(image);
	    }

	  }.bind(this);

	  image.onerror = function() {
	    if (callback) {
	      callback();
	    }
	  };

	  image.src = src;
	};

	glx.texture.Image.prototype = {

	  enable: function(index) {
	    if (!this.id) {
	      return;
	    }
	    GL.bindTexture(GL.TEXTURE_2D, this.id);
	    GL.activeTexture(GL.TEXTURE0 + (index || 0));
	  },

	  disable: function() {
	    GL.bindTexture(GL.TEXTURE_2D, null);
	  },

	  destroy: function() {
	    GL.bindTexture(GL.TEXTURE_2D, null);
	    GL.deleteTexture(this.id);
	    this.id = null;
	  }
	};


	glx.texture.Data = function(size, data, options) {
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
	    var length = size*size*4;
	    bytes = new Uint8Array(length);
	    bytes.set(data.subarray(0, length));
	  }

	  GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, size, size, 0, GL.RGBA, GL.UNSIGNED_BYTE, bytes);
	  GL.bindTexture(GL.TEXTURE_2D, null);
	};

	glx.texture.Data.prototype = {

	  enable: function(index) {
	    GL.bindTexture(GL.TEXTURE_2D, this.id);
	    GL.activeTexture(GL.TEXTURE0 + (index || 0));
	  },

	  disable: function() {
	    GL.bindTexture(GL.TEXTURE_2D, null);
	  },

	  destroy: function() {
	    GL.bindTexture(GL.TEXTURE_2D, null);
	    GL.deleteTexture(this.id);
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

	if (true) {
	  !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (GLX), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if (typeof exports === 'object') {
	  module.exports = GLX;
	} else {
	  global.GLX = GLX;
	}

	var MAP, glx, gl;
	var MIN_ZOOM, MAX_ZOOM;

	var OSMBuildings = function(options) {
	  options = options || {};

	  if (options.style) {
	    this.setStyle(options.style);
	  }

	  render.bendRadius = 500;
	  render.bendDistance = 500;

	  render.fogColor = options.fogColor ? Color.parse(options.fogColor).toRGBA(true) : FOG_COLOR;
	  render.Buildings.showBackfaces = options.showBackfaces;

	  this.attribution = options.attribution || OSMBuildings.ATTRIBUTION;

	  MIN_ZOOM = parseFloat(options.minZoom) || 15;
	  MAX_ZOOM = parseFloat(options.maxZoom) || 22;
	  if (MAX_ZOOM < MIN_ZOOM) {
	    MAX_ZOOM = MIN_ZOOM;
	  }
	};

	OSMBuildings.VERSION = '1.0.1';
	OSMBuildings.ATTRIBUTION = '© OSM Buildings <a href="http://osmbuildings.org">http://osmbuildings.org</a>';

	OSMBuildings.prototype = {

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
	    var color = style.color || style.wallColor;
	    if (color) {
	      DEFAULT_COLOR = Color.parse(color).toRGBA(true);
	    }
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

	  addGeoJSONTiles: function(url, options) {
	    return data.Grid.init(url, options);
	  },

	  addMapTiles: function(url, options) {
	    return basemap.Grid.init(url, options);
	  },

	  highlight: function(id, color) {
	    render.Buildings.highlightColor = color ? id && Color.parse(color).toRGBA(true) : null;
	    render.Buildings.highlightID = id ? render.Interaction.idToColor(id) : null;
	  },

	  getTarget: function(x, y) {
	    return render.Interaction.getTarget(x, y);
	  },

	  destroy: function() {
	    render.destroy();
	    this.data.Grid.destroy();
	    this.basemap.Grid.destroy();
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

	  Events.on = function(type, fn) {
	    if (!listeners[type]) {
	      listeners[type] = { fn:[] };
	    }

	    listeners[type].fn.push(fn);
	  };

	  Events.off = function(type, fn) {};

	  Events.emit = function(type, payload) {
	    if (!listeners[type]) {
	      return;
	    }

	    var l = listeners[type];
	    if (l.timer) {
	      return;
	    }
	    l.timer = setTimeout(function() {
	      l.timer = null;
	      for (var i = 0, il = l.fn.length; i < il; i++) {
	        l.fn[i](payload);
	      }
	    }, 17);
	  };

	  Events.destroy = function() {
	    listeners = null;
	  };

	}());


	var Activity = {};

	(function() {

	  var count = 0;
	  var timer;

	  Activity.setBusy = function(msg) {
	    //if (msg) {
	    //  console.log('setBusy', msg, count);
	    //}

	    if (!count) {
	      if (timer) {
	        clearTimeout(timer);
	        timer = null;
	      } else {
	        Events.emit('busy');
	      }
	    }
	    count++;
	  };

	  Activity.setIdle = function(msg) {
	    if (!count) {
	      return;
	    }

	    count--;
	    if (!count) {
	      timer = setTimeout(function() {
	        timer = null;
	        Events.emit('idle');
	      }, 33);
	    }

	    //if (msg) {
	    //  console.log('setIdle', msg, count);
	    //}
	  };

	  Activity.isBusy = function() {
	    return !!count;
	  };

	}());


	var PI = Math.PI;

	var TILE_SIZE = 256;

	var DATA_KEY = 'anonymous';
	var DATA_SRC = 'http://{s}.data.osmbuildings.org/0.2/{k}/tile/{z}/{x}/{y}.json';

	var DEFAULT_HEIGHT = 10;
	var HEIGHT_SCALE = 0.7;

	var DEFAULT_COLOR = Color.parse('rgb(220, 210, 200)').toRGBA(true);
	var DEFAULT_HIGHLIGHT_COLOR = Color.parse('#f08000').toRGBA(true);

	var FOG_COLOR = Color.parse('#f0f8ff').toRGBA(true);

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
	    queue = null;
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

	function relax(callback, startIndex, dataLength, chunkSize, delay) {
	  chunkSize = chunkSize || 1000;
	  delay = delay || 1;

	  var endIndex = startIndex + Math.min((dataLength-startIndex), chunkSize);

	  if (startIndex === endIndex) {
	    return;
	  }

	  callback(startIndex, endIndex);

	  if (startIndex < dataLength) {
	    setTimeout(function() {
	      relax(callback, endIndex, dataLength, chunkSize, delay);
	    }, delay);
	  }
	}

	var Shaders = {"interaction":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec3 aColor;\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjMatrix;\nuniform mat4 uMatrix;\nuniform float uFogRadius;\nvarying vec4 vColor;\nuniform float uBendRadius;\nuniform float uBendDistance;\nvoid main() {\n  //*** bending ***************************************************************\n//  vec4 mwPosition = uViewMatrix * uModelMatrix * aPosition;\n//\n//  float innerRadius = uBendRadius + mwPosition.y;\n//  float depth = abs(mwPosition.z);\n//  float s = depth-uBendDistance;\n//  float theta = min(max(s, 0.0)/uBendRadius, halfPi);\n//\n//  // halfPi*uBendRadius, not halfPi*innerRadius, because the \"base\" of a building\n//  // travels the full uBendRadius path\n//  float newY = cos(theta)*innerRadius - uBendRadius - max(s-halfPi*uBendRadius, 0.0);\n//  float newZ = normalize(mwPosition.z) * (min(depth, uBendDistance) + sin(theta)*innerRadius);\n//\n//  vec4 newPosition = vec4(mwPosition.x, newY, newZ, 1.0);\n//  gl_Position = uProjMatrix * newPosition;\n  gl_Position = uMatrix * aPosition;\n  vec4 mPosition = vec4(uModelMatrix * aPosition);\n  float distance = length(mPosition);\n  if (distance > uFogRadius) {\n    vColor = vec4(0.0, 0.0, 0.0, 0.0);\n  } else {\n    vColor = vec4(aColor, 1.0);\n  }\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nvarying vec4 vColor;\nvoid main() {\n  gl_FragColor = vColor;\n}\n"},"buildings":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec3 aNormal;\nattribute vec3 aColor;\nattribute vec3 aIDColor;\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjMatrix;\nuniform mat4 uMatrix;\nuniform mat3 uNormalTransform;\nuniform vec3 uLightDirection;\nuniform vec3 uLightColor;\nuniform vec3 uFogColor;\nuniform float uFogRadius;\nuniform vec3 uHighlightColor;\nuniform vec3 uHighlightID;\nvarying vec3 vColor;\nfloat fogBlur = 200.0;\nfloat gradientHeight = 90.0;\nfloat gradientStrength = 0.4;\n// helsinki has small buildings :-)\n//float gradientHeight = 30.0;\n//float gradientStrength = 0.3;\nuniform float uBendRadius;\nuniform float uBendDistance;\nvoid main() {\n  //*** bending ***************************************************************\n//  vec4 mwPosition = uViewMatrix * uModelMatrix * aPosition;\n//\n//  float innerRadius = uBendRadius + mwPosition.y;\n//  float depth = abs(mwPosition.z);\n//  float s = depth-uBendDistance;\n//  float theta = min(max(s, 0.0)/uBendRadius, halfPi);\n//\n//  // halfPi*uBendRadius, not halfPi*innerRadius, because the \"base\" of a building\n//  // travels the full uBendRadius path\n//  float newY = cos(theta)*innerRadius - uBendRadius - max(s-halfPi*uBendRadius, 0.0);\n//  float newZ = normalize(mwPosition.z) * (min(depth, uBendDistance) + sin(theta)*innerRadius);\n//\n//  vec4 newPosition = vec4(mwPosition.x, newY, newZ, 1.0);\n//  gl_Position = uProjMatrix * newPosition;\n  gl_Position = uMatrix * aPosition;\n  //*** highlight object ******************************************************\n  vec3 color = aColor;\n  if (uHighlightID.r == aIDColor.r && uHighlightID.g == aIDColor.g && uHighlightID.b == aIDColor.b) {\n    color = mix(aColor, uHighlightColor, 0.5);\n  }\n  //*** light intensity, defined by light direction on surface ****************\n  vec3 transformedNormal = aNormal * uNormalTransform;\n  float lightIntensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;\n  color = color + uLightColor * lightIntensity;\n  //*** vertical shading ******************************************************\n  float verticalShading = clamp((gradientHeight-aPosition.z) / (gradientHeight/gradientStrength), 0.0, gradientStrength);\n  //*** fog *******************************************************************\n  vec4 mPosition = uModelMatrix * aPosition;\n  float distance = length(mPosition);\n  float fogIntensity = (distance - uFogRadius) / fogBlur + 1.1; // <- shifts blur in/out\n  fogIntensity = clamp(fogIntensity, 0.0, 1.0);\n  //***************************************************************************\n  vColor = mix(vec3(color - verticalShading), uFogColor, fogIntensity);\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nvarying vec3 vColor;\nvoid main() {\n  gl_FragColor = vec4(vColor, 1.0);\n}\n"},"skydome":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjMatrix;\nuniform mat4 uMatrix;\nvarying vec2 vTexCoord;\nvarying float vFogIntensity;\nfloat gradientHeight = 10.0;\nfloat gradientStrength = 1.0;\nuniform float uBendRadius;\nuniform float uBendDistance;\nvoid main() {\n  //*** bending ***************************************************************\n//  vec4 mwPosition = uViewMatrix * uModelMatrix * aPosition;\n//\n//  float innerRadius = uBendRadius + mwPosition.y;\n//  float depth = abs(mwPosition.z);\n//  float s = depth-uBendDistance;\n//  float theta = min(max(s, 0.0)/uBendRadius, halfPi);\n//\n//  // halfPi*uBendRadius, not halfPi*innerRadius, because the \"base\" of a building\n//  // travels the full uBendRadius path\n//  float newY = cos(theta)*innerRadius - uBendRadius - max(s-halfPi*uBendRadius, 0.0);\n//  float newZ = normalize(mwPosition.z) * (min(depth, uBendDistance) + sin(theta)*innerRadius);\n//\n//  vec4 newPosition = vec4(mwPosition.x, newY, newZ, 1.0);\n//  gl_Position = uProjMatrix * newPosition;\n  gl_Position = uMatrix * aPosition;\n  vTexCoord = aTexCoord;\n  vFogIntensity = clamp((gradientHeight-aPosition.z) / (gradientHeight/gradientStrength), 0.0, gradientStrength);\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform vec3 uFogColor;\nvarying vec2 vTexCoord;\nvarying float vFogIntensity;\nvoid main() {\n  vec3 color = vec3(texture2D(uTexIndex, vec2(vTexCoord.x, -vTexCoord.y)));\n  gl_FragColor = vec4(mix(color, uFogColor, vFogIntensity), 1.0);\n}\n"},"basemap":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjMatrix;\nuniform mat4 uMatrix;\nuniform float uFogRadius;\nvarying vec2 vTexCoord;\nvarying float vFogIntensity;\nfloat fogBlur = 200.0;\nuniform float uBendRadius;\nuniform float uBendDistance;\nvoid main() {\n  //*** bending ***************************************************************\n//  vec4 mwPosition = uViewMatrix * uModelMatrix * aPosition;\n//\n//  float innerRadius = uBendRadius + mwPosition.y;\n//  float depth = abs(mwPosition.z);\n//  float s = depth-uBendDistance;\n//  float theta = min(max(s, 0.0)/uBendRadius, halfPi);\n//\n//  // halfPi*uBendRadius, not halfPi*innerRadius, because the \"base\" of a building\n//  // travels the full uBendRadius path\n//  float newY = cos(theta)*innerRadius - uBendRadius - max(s-halfPi*uBendRadius, 0.0);\n//  float newZ = normalize(mwPosition.z) * (min(depth, uBendDistance) + sin(theta)*innerRadius);\n//\n//  vec4 newPosition = vec4(mwPosition.x, newY, newZ, 1.0);\n//  vec4 glPosition = uProjMatrix * newPosition;\n  vec4 glPosition = uMatrix * aPosition;\n  gl_Position = glPosition;\n  vTexCoord = aTexCoord;\n  //*** fog *******************************************************************\n  vec4 mPosition = uModelMatrix * aPosition;\n  float distance = length(mPosition);\n  // => (distance - (uFogRadius - fogBlur)) / (uFogRadius - (uFogRadius - fogBlur));\n  float fogIntensity = (distance - uFogRadius) / fogBlur + 1.1; // <- shifts blur in/out\n  vFogIntensity = clamp(fogIntensity, 0.0, 1.0);\n  //vFogIntensity = 0.0;\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform vec3 uFogColor;\nvarying vec2 vTexCoord;\nvarying float vFogIntensity;\nvoid main() {\n  vec3 color = vec3(texture2D(uTexIndex, vec2(vTexCoord.x, -vTexCoord.y)));\n  gl_FragColor = vec4(mix(color, uFogColor, vFogIntensity), 1.0);\n}\n"},"texture":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uMatrix;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_FragColor = vec4(texture2D(uTexIndex, vTexCoord.st).rgb, 1.0);\n}\n"},"normalmap":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\nattribute vec4 aPosition;\nattribute vec3 aNormal;\nuniform mat4 uMatrix;\nvarying vec3 vNormal;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vNormal = aNormal;\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\n//uniform sampler2D uTexIndex;\nvarying vec2 vTexCoord;\nvarying vec3 vNormal;\nvoid main() {\n  gl_FragColor = vec4( (vNormal + 1.0)/2.0, 1.0);\n}\n"},"depth":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\nattribute vec4 aPosition;\nuniform mat4 uMatrix;\nvarying vec4 vPosition;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vPosition = uMatrix * aPosition;\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nvarying vec4 vPosition;\nvoid main() {\n  float depth = gl_FragCoord.z / gl_FragCoord.w;\n  float z = depth/1500.0;//gl_FragCoord.z;\n  float z1 = fract(z*255.0);\n  float z2 = fract(z1*255.0);\n  float z3 = fract(z2*255.0);\n  /* The following biasing is necessary for shadow mapping to work correctly.\n   * Source: http://forum.devmaster.net/t/shader-effects-shadow-mapping/3002\n   * This might be due to the GPU *rounding* the float values to the nearest uint8_t \n   * instead of *truncating* as would be expected in C/C++ */\n  z  -= 1.0/255.0*z1;\n  z1 -= 1.0/255.0*z2;\n  z2 -= 1.0/255.0*z3;\n  \n  // option 1: this line outputs high-precision (24bit) depth values\n  gl_FragColor = vec4(z, z1, z2, z3);\n  \n  // option 2: this line outputs human-interpretable depth values, but with low precision\n  //gl_FragColor = vec4(z, z, z, 1.0); \n}\n"},"ambientFromDepth":{"vertex":"#ifdef GL_ES\n  precision mediump float;\n#endif\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uMatrix;\nvarying vec2 vTexCoord;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vTexCoord = aTexCoord;\n}\n","fragment":"#ifdef GL_ES\n  precision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform float uInverseTexWidth;   //in 1/pixels, e.g. 1/512 if the texture is 512px wide\nuniform float uInverseTexHeight;  //in 1/pixels\nvarying vec2 vTexCoord;\n/* Retrieves the depth value (dx, dy) pixels away from 'pos' from texture 'uTexIndex'. */\nfloat getDepth(vec2 pos, int dx, int dy)\n{\n  //retrieve the color-coded depth\n  vec4 codedDepth = texture2D(uTexIndex, vec2(pos.s + float(dx) * uInverseTexWidth, \n                                              pos.t + float(dy) * uInverseTexHeight));\n  //convert back to depth value\n  return codedDepth.x + codedDepth.y/255.0 + codedDepth.z/(255.0*255.0);\n}\n/* getOcclusionFactor() determines a heuristic factor for how much the fragment at 'pos' \n * with depth 'depthHere'is occluded by the fragment that is (dx, dy) texels away from it.\n * \n * The heuristic is as follows:\n * - if the fragment at (dx, dy) has no depth (i.e. there was nothing rendered there), then\n *   'here' is not occluded (result 1.0)\n * - if the fragment at (dx, dy) is further away from the viewer than 'here', then\n *   'here is not occluded'\n * - if the fragment at (dx, dy) is closer to the viewer than 'here', then it occluded\n *   'here' the higher the depth difference between the two locations is.\n*/\nfloat getOcclusionFactor(float depthHere, vec2 pos, int dx, int dy)\n{\n    float depthThere = getDepth(pos, dx, dy);\n    if (depthThere == 0.0)\n        return 1.0;\n    \n    return depthHere < depthThere ? 1.0 : /*0.99;//*/ depthThere / depthHere;\n}\nvoid main() {\n  float depthHere = getDepth(vTexCoord.st, 0, 0);\n  if (depthHere == 0.0)\n  {\n    gl_FragColor = vec4( vec3(0.0), 1.0);\n    return;\n  }\n  \n  float occlusionFactor = 1.0;\n  for (int x = -3; x <= 3; x++)\n    for (int y = -3; y <= 3; y++)\n        occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  x,  y);\n  gl_FragColor = vec4( vec3(occlusionFactor) , 1.0);\n}\n"}};



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

	//  { r:255, g:0, b:0 }

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
	//      Events.emit('modify');
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
	          //Events.emit('modify');
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
	      this.items = null;
	//    this.blockers = null;
	    }
	  }
	};


	data.Grid = {

	  tiles: {},
	  internalZoom: 16,

	  init: function(src, options) {
	    if (src === undefined || src === false || src === '') {
	      src = DATA_SRC.replace('{k}', options.dataKey || DATA_KEY);
	    }
	    this.source = src;
	    this.options = options || {};
	    // TODO: buffer is a bad idea with fixed internalZoom
	    this.buffer = this.options.buffer || 1;

	    MAP.on('change', function() {
	      this.update(2000);
	    }.bind(this));

	    MAP.on('resize', this.update.bind(this));

	    this.update();
	  },

	  // strategy: start loading in {delay} ms after movement ends, ignore any attempts until then
	  update: function(delay) {
	    if (MAP.zoom < MIN_ZOOM || MAP.zoom > MAX_ZOOM) {
	      return;
	    }

	    if (!delay) {
	      this.loadTiles();
	      return;
	    }

	    if (this.isDelayed) {
	      clearTimeout(this.isDelayed);
	    }

	    this.isDelayed = setTimeout(function() {
	      this.isDelayed = null;
	      this.loadTiles();
	    }.bind(this), delay);
	  },

	  updateBounds: function() {
	    var
	      zoom = Math.round(this.internalZoom || MAP.zoom),
	      radius = 1500, // render.SkyDome.radius,
	      ratio = Math.pow(2, zoom-MAP.zoom)/TILE_SIZE,
	      mapCenter = MAP.center;

	    this.bounds = {
	      zoom: zoom,
	      minX: ((mapCenter.x-radius)*ratio <<0) - this.buffer,
	      minY: ((mapCenter.y-radius)*ratio <<0) - this.buffer,
	      maxX: Math.ceil((mapCenter.x+radius)*ratio) + this.buffer,
	      maxY: Math.ceil((mapCenter.y+radius)*ratio) + this.buffer
	    };
	  },

	  getURL: function(x, y, z) {
	    var s = 'abcd'[(x+y) % 4];
	    return pattern(this.source, { s:s, x:x, y:y, z:z });
	  },

	  loadTiles: function() {
	    this.updateBounds();

	    var
	      tileX, tileY,
	      key,
	      queue = [], queueLength,
	      bounds = this.bounds,
	      tileAnchor = [
	        MAP.center.x/TILE_SIZE <<0,
	        MAP.center.y/TILE_SIZE <<0
	      ];

	    for (tileY = bounds.minY; tileY < bounds.maxY; tileY++) {
	      for (tileX = bounds.minX; tileX < bounds.maxX; tileX++) {
	        key = [tileX, tileY, bounds.zoom].join(',');
	        if (this.tiles[key]) {
	          continue;
	        }
	        this.tiles[key] = new data.Tile(tileX, tileY, bounds.zoom, this.options);
	        queue.push({ tile:this.tiles[key], dist:distance2([tileX, tileY], tileAnchor) });
	      }
	    }

	    if (!(queueLength = queue.length)) {
	      return;
	    }

	    queue.sort(function(a, b) {
	      return a.dist-b.dist;
	    });

	    var tile;
	    for (var i = 0; i < queueLength; i++) {
	      tile = queue[i].tile;
	      tile.load(this.getURL(tile.x, tile.y, tile.zoom));
	    }

	    this.purge();
	  },

	  purge: function() {
	    for (var key in this.tiles) {
	      if (!this.tiles[key].isVisible(this.bounds)) {
	        this.tiles[key].destroy();
	        delete this.tiles[key];
	      }
	    }
	  },

	  destroy: function() {
	    clearTimeout(this.isDelayed);
	    for (var key in this.tiles) {
	      this.tiles[key].destroy();
	    }
	    this.tiles = null;
	  }
	};


	data.Tile = function(x, y, zoom, options) {
	  this.x = x;
	  this.y = y;
	  this.zoom = zoom;
	  this.options = options;
	};

	data.Tile.prototype = {

	  load: function(url) {
	    this.mesh = new mesh.GeoJSON(url, this.options);
	  },

	  isVisible: function(bounds) {
	    // TODO: factor in tile origin
	    return (this.zoom === bounds.zoom && (this.x >= bounds.minX && this.x <= bounds.maxX && this.y >= bounds.minY && this.y <= bounds.maxY));
	  },

	  destroy: function() {
	    if (this.mesh) {
	      this.mesh.destroy();
	      this.mesh = null;
	    }
	  }
	};


	var mesh = {};


	mesh.GeoJSON = (function() {

	  var
	    zoom = 16,
	    worldSize = TILE_SIZE <<zoom,
	    featuresPerChunk = 150,
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
	      this.color = Color.parse(options.color).toRGBA(true);
	    }

	    this.replace   = !!options.replace;
	    this.scale     = options.scale     || 1;
	    this.rotation  = options.rotation  || 0;
	    this.elevation = options.elevation || 0;
	    this.position  = {};

	    this.data = {
	      vertices: [],
	      normals: [],
	      colors: [],
	      idColors: []
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

	      relax(function(startIndex, endIndex) {
	        var features = json.features.slice(startIndex, endIndex);
	        var geojson = { type: 'FeatureCollection', features: features };
	        var data = GeoJSON.parse(this.position, worldSize, geojson);

	        this.addItems(data);

	        if (endIndex === json.features.length) {
	          this.onReady();
	        }
	      }.bind(this), 0, json.features.length, featuresPerChunk, delayPerChunk);
	    },

	    addItems: function(items) {
	      var
	        item, color, idColor, center, radius,
	        vertexCount,
	        id, colorVariance,
	        j;

	      for (var i = 0, il = items.length; i < il; i++) {
	        item = items[i];

	//      item.numVertices = item.vertices.length/3;
	//        this.items.push({ id:item.id, min:item.min, max:item.max });

	        id = this.id || item.id;
	        idColor = render.Interaction.idToColor(id);
	        colorVariance = (id/2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06);

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

	        color = this.color || item.wallColor || DEFAULT_COLOR;
	        for (j = 0; j < vertexCount; j++) {
	          this.data.colors.push(color.r+colorVariance, color.g+colorVariance, color.b+colorVariance);
	          this.data.idColors.push(idColor.r, idColor.g, idColor.b);
	        }

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

	        color = this.color || item.roofColor || DEFAULT_COLOR;
	        for (j = 0; j < vertexCount; j++) {
	          this.data.colors.push(color.r+colorVariance, color.g+colorVariance, color.b+colorVariance);
	          this.data.idColors.push(idColor.r, idColor.g, idColor.b);
	        }
	      }
	    },

	//  modify: function() {
	//    if (!this.items) {
	//      return;
	//    }
	//
	//    var item, hidden, visibilities = [];
	//    for (var i = 0, il = this.items.length; i<il; i++) {
	//      item = this.items[i];
	        //hidden = data.Index.checkCollisions(item);
	//        for (var j = 0, jl = item.numVertices; j<jl; j++) {
	//          visibilities.push(item.hidden ? 1 : 0);
	//        }
	//    }
	//
	//    this.visibilityBuffer = new glx.Buffer(1, new Float32Array(visibilities));
	//    visibilities = null;
	//  },

	    onReady: function() {
	      //this.modify();

	      this.vertexBuffer  = new glx.Buffer(3, new Float32Array(this.data.vertices));
	      this.normalBuffer  = new glx.Buffer(3, new Float32Array(this.data.normals));
	      this.colorBuffer   = new glx.Buffer(3, new Float32Array(this.data.colors));
	      this.idColorBuffer = new glx.Buffer(3, new Float32Array(this.data.idColors));

	      this.data = null;

	      data.Index.add(this);
	//    Events.on('modify', this.modify.bind(this));

	      this.isReady = true;
	      Activity.setIdle();
	    },

	    // TODO: switch to mesh.transform
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
	      if (this.request) {
	        this.request.abort();
	      }

	      this.items = null;

	      if (this.isReady) {
	        data.Index.remove(this);
	        this.vertexBuffer.destroy();
	        this.normalBuffer.destroy();
	        this.colorBuffer.destroy();
	        this.idColorBuffer.destroy();
	      }
	    }
	  };

	  return constructor;

	}());


	mesh.OBJ = (function() {

	  function constructor(url, position, options) {
	    options = options || {};

	    this.id = options.id;
	    if (options.color) {
	      this.color = Color.parse(options.color).toRGBA(true);
	    }

	    this.replace   = !!options.replace;
	    this.scale     = options.scale     || 1;
	    this.rotation  = options.rotation  || 0;
	    this.elevation = options.elevation || 0;
	    this.position  = position;

	    this.inMeters = TILE_SIZE / (Math.cos(this.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);

	    this.data = {
	      vertices: [],
	      normals: [],
	      colors: [],
	      idColors: []
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
	        id, colorVariance;

	        for (var i = 0, il = items.length; i < il; i++) {
	        item = items[i];

	//      item.numVertices = item.vertices.length/3;
	//        this.items.push({ id:item.id, min:item.min, max:item.max });

	        this.data.vertices.push.apply(this.data.vertices, item.vertices);
	        this.data.normals.push.apply(this.data.normals, item.normals);

	        id = this.id || item.id;
	        colorVariance = (id/2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06);
	        color = this.color || item.color || DEFAULT_COLOR;
	        idColor = render.Interaction.idToColor(id);
	        for (j = 0, jl = item.vertices.length - 2; j<jl; j += 3) {
	          this.data.colors.push(color.r+colorVariance, color.g+colorVariance, color.b+colorVariance);
	          this.data.idColors.push(idColor.r, idColor.g, idColor.b);
	        }
	      }
	    },

	//  modify: function() {
	//    if (!this.items) {
	//      return;
	//    }
	//
	//    var item, hidden, visibilities = [];
	//    for (var i = 0, il = this.items.length; i<il; i++) {
	//      item = this.items[i];
	        //hidden = data.Index.checkCollisions(item);
	//        for (var j = 0, jl = item.numVertices; j<jl; j++) {
	//          visibilities.push(item.hidden ? 1 : 0);
	//        }
	//    }
	//
	//    this.visibilityBuffer = new glx.Buffer(1, new Float32Array(visibilities));
	//    visibilities = null;
	//  },

	    onReady: function() {
	      //this.modify();

	      this.vertexBuffer  = new glx.Buffer(3, new Float32Array(this.data.vertices));
	      this.normalBuffer  = new glx.Buffer(3, new Float32Array(this.data.normals));
	      this.colorBuffer   = new glx.Buffer(3, new Float32Array(this.data.colors));
	      this.idColorBuffer = new glx.Buffer(3, new Float32Array(this.data.idColors));

	      this.data = null;

	      data.Index.add(this);
	//    Events.on('modify', this.modify.bind(this));

	      this.isReady = true;
	      Activity.setIdle();
	    },

	    // TODO: switch to mesh.transform
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
	      if (this.request) {
	        this.request.abort();
	      }

	      this.items = null;

	      if (this.isReady) {
	        data.Index.remove(this);
	        this.vertexBuffer.destroy();
	        this.normalBuffer.destroy();
	        this.colorBuffer.destroy();
	        this.idColorBuffer.destroy();
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
	      item = {},
	      color,
	      wallColor, roofColor;

	    if (!prop) {
	      return;
	    }

	    item.height    = prop.height    || (prop.levels   ? prop.levels  *METERS_PER_LEVEL : DEFAULT_HEIGHT);
	    item.minHeight = prop.minHeight || (prop.minLevel ? prop.minLevel*METERS_PER_LEVEL : 0);

	    wallColor = prop.material ? getMaterialColor(prop.material) : (prop.wallColor || prop.color);
	    item.wallColor = (color = Color.parse(wallColor)) ? color.toRGBA(true) : DEFAULT_COLOR;

	    roofColor = prop.roofMaterial ? getMaterialColor(prop.roofMaterial) : prop.roofColor;
	    item.roofColor = (color = Color.parse(roofColor)) ? color.toRGBA(true) : DEFAULT_COLOR;

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

	if (true) {
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

	function rotatePoint(x, y, angle) {
	  return {
	    x: Math.cos(angle)*x - Math.sin(angle)*y,
	    y: Math.sin(angle)*x + Math.cos(angle)*y
	  };
	}


	var render = {

	  start: function() {
	    this.viewMatrix = new glx.Matrix();
	    this.projMatrix = new glx.Matrix();
	    this.viewProjMatrix = new glx.Matrix();

	    MAP.on('resize', this.onResize.bind(this));
	    this.onResize();

	    MAP.on('change', this.onChange.bind(this));
	    this.onChange();

	    gl.cullFace(gl.BACK);
	    gl.enable(gl.CULL_FACE);
	    gl.enable(gl.DEPTH_TEST);

	    render.Interaction.init(); // renders only on demand
	    render.SkyDome.init();
	    render.Buildings.init();
	    render.Basemap.init();
	    render.HudRect.init();
	    render.NormalMap.init();
	    render.DepthMap.init();
	    render.AmbientMap.init();

	    this.loop = setInterval(function() {
	      requestAnimationFrame(function() {
	        gl.clearColor(this.fogColor.r, this.fogColor.g, this.fogColor.b, 1);
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        render.SkyDome.render();
	        render.Buildings.render();
	        render.Basemap.render();

	        //render.NormalMap.render();

	/*
	        render.DepthMap.render();
	        render.AmbientMap.render(render.DepthMap.framebuffer.renderTexture.id);
	        render.HudRect.render(render.AmbientMap.framebuffer.renderTexture.id);
	*/
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

	    this.fogRadius = Math.sqrt(width*width + height*height) / 1; // 2 would fit fine but camera is too close
	  },

	  destroy: function() {
	    this.stop();
	    render.Interaction.destroy();
	    render.Skydome.destroy();
	    render.Buildings.destroy();
	    render.Basemap.destroy();
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
	      attributes: ["aPosition", "aColor"],
	      uniforms: ["uModelMatrix", "uViewMatrix", "uProjMatrix", "uMatrix", "uFogRadius", "uBendRadius", "uBendDistance"]
	    });

	    this.framebuffer = new glx.Framebuffer(this.viewportSize, this.viewportSize);
	  },

	  // TODO: throttle calls
	  getTarget: function(x, y) {
	    if (MAP.zoom < MIN_ZOOM) {
	      return;
	    }

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

	    var
	      dataItems = data.Index.items,
	      item,
	      modelMatrix, mvp;

	    for (var i = 0, il = dataItems.length; i < il; i++) {
	      item = dataItems[i];

	      if (!(modelMatrix = item.getMatrix())) {
	        continue;
	      }

	      //gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
	      //gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

	      gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

	      item.vertexBuffer.enable();
	      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	      item.idColorBuffer.enable();
	      gl.vertexAttribPointer(shader.attributes.aColor, item.idColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	      //item.visibilityBuffer.enable();
	      //gl.vertexAttribPointer(shader.attributes.aHidden, item.visibilityBuffer.itemSize, gl.FLOAT, false, 0, 0);

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
	    return {
	      r: ( index        & 0xff) / 255,
	      g: ((index >>  8) & 0xff) / 255,
	      b: ((index >> 16) & 0xff) / 255
	    };
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
	      attributes: ["aPosition", "aTexCoord"],
	      uniforms: ["uModelMatrix", "uViewMatrix", "uProjMatrix", "uMatrix", "uTexIndex", "uFogColor", "uBendRadius", "uBendDistance"]
	    });

	    Activity.setBusy();
	    var url = 'OSMBuildings/skydome.jpg';
	    this.texture = new glx.texture.Image(url, function(image) {
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

	    gl.uniform3fv(shader.uniforms.uFogColor, [fogColor.r, fogColor.g, fogColor.b]);

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

	    this.texture.enable(0);
	    gl.uniform1i(shader.uniforms.uTexIndex, 0);

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
	      attributes: ["aPosition", "aColor", "aNormal", "aIDColor"],
	      uniforms: ["uModelMatrix", "uViewMatrix", "uProjMatrix", "uMatrix", "uNormalTransform", "uAlpha", "uLightColor", "uLightDirection", "uFogRadius", "uFogColor", "uBendRadius", "uBendDistance", "uHighlightColor", "uHighlightID"]
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
	    gl.uniform3fv(shader.uniforms.uFogColor, [render.fogColor.r, render.fogColor.g, render.fogColor.b]);

	    gl.uniform1f(shader.uniforms.uBendRadius, render.bendRadius);
	    gl.uniform1f(shader.uniforms.uBendDistance, render.bendDistance);

	    if (!this.highlightColor) {
	      this.highlightColor = DEFAULT_HIGHLIGHT_COLOR;
	    }
	    gl.uniform3fv(shader.uniforms.uHighlightColor, [this.highlightColor.r, this.highlightColor.g, this.highlightColor.b]);

	    if (!this.highlightID) {
	      this.highlightID = { r:0, g:0, b:0 };
	    }
	    gl.uniform3fv(shader.uniforms.uHighlightID, [this.highlightID.r, this.highlightID.g, this.highlightID.b]);

	    var
	      dataItems = data.Index.items,
	      item,
	      modelMatrix;

	    for (var i = 0, il = dataItems.length; i < il; i++) {
	      item = dataItems[i];

	      if (!(modelMatrix = item.getMatrix())) {
	        continue;
	      }

	      gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

	      item.vertexBuffer.enable();
	      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	      item.normalBuffer.enable();
	      gl.vertexAttribPointer(shader.attributes.aNormal, item.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	      item.colorBuffer.enable();
	      gl.vertexAttribPointer(shader.attributes.aColor, item.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	      item.idColorBuffer.enable();
	      gl.vertexAttribPointer(shader.attributes.aIDColor, item.idColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	//    item.visibilityBuffer.enable();
	//    gl.vertexAttribPointer(shader.attributes.aHidden, item.visibilityBuffer.itemSize, gl.FLOAT, false, 0, 0);

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
	      attributes: ["aPosition", "aTexCoord"],
	      uniforms: ["uModelMatrix", "uViewMatrix", "uProjMatrix", "uMatrix", "uTexIndex", "uFogRadius", "uFogColor", "uBendRadius", "uBendDistance"]
	    });
	  },

	  render: function() {
	    var
	      fogColor = render.fogColor,
	      shader = this.shader,
	      tile, modelMatrix,
	      tileZoom = Math.round(MAP.zoom),
	      ratio = 1 / Math.pow(2, tileZoom - MAP.zoom),
	      mapCenter = MAP.center;

	    shader.enable();

	    gl.uniform1f(shader.uniforms.uFogRadius, render.fogRadius);
	    gl.uniform3fv(shader.uniforms.uFogColor, [fogColor.r, fogColor.g, fogColor.b]);

	    gl.uniform1f(shader.uniforms.uBendRadius, render.bendRadius);
	    gl.uniform1f(shader.uniforms.uBendDistance, render.bendDistance);

	    var tiles = basemap.Grid.tiles;

	    for (var key in tiles) {
	      tile = tiles[key];

	      if (!tile.isReady || !tile.isVisible(basemap.Grid.bounds)) {
	        continue;
	      }

	      modelMatrix = new glx.Matrix();
	      modelMatrix.scale(ratio * 1.005, ratio * 1.005, 1);
	      modelMatrix.translate(tile.x * TILE_SIZE * ratio - mapCenter.x, tile.y * TILE_SIZE * ratio - mapCenter.y, 0);

	      gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

	      tile.vertexBuffer.enable();
	      gl.vertexAttribPointer(shader.attributes.aPosition, tile.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	      tile.texCoordBuffer.enable();
	      gl.vertexAttribPointer(shader.attributes.aTexCoord, tile.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	      tile.texture.enable(0);
	      gl.uniform1i(shader.uniforms.uTexIndex, 0);

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
	      attributes: ["aPosition", "aTexCoord"],
	      uniforms: [ "uMatrix", "uTexIndex", "uColor"]
	    });

	    this.isReady = true;
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

	    texCoords.push(0,0,
	                   1,0,
	                   1,1);

	    texCoords.push(0,0,
	                   1,1,
	                   0,1);

	    return { vertices: vertices , texCoords: texCoords };
	  },

	  render: function(texture) {
	    if (!this.isReady) {
	      return;
	    }

	    var
	      shader = this.shader;

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
	      attributes: ["aPosition", "aNormal"],
	      uniforms: [/*"uModelMatrix", "uViewMatrix", "uProjMatrix",*/ "uMatrix"]
	    });

	    this.framebuffer = new glx.Framebuffer(this.viewportSize, this.viewportSize);

	    // enable texture filtering for framebuffer texture
	    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

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

	    var
	      dataItems = data.Index.items,
	      item,
	      modelMatrix, mvp;

	    for (var i = 0, il = dataItems.length; i < il; i++) {
	      item = dataItems[i];

	      if (!(modelMatrix = item.getMatrix())) {
	        continue;
	      }

	      //gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
	      //gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

	      /*gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);*/
	      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

	      item.vertexBuffer.enable();
	      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	      item.normalBuffer.enable();
	      gl.vertexAttribPointer(shader.attributes.aNormal, item.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

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

	  viewportSize: 512,

	  init: function() {
	    this.shader = new glx.Shader({
	      vertexShader: Shaders.depth.vertex,
	      fragmentShader: Shaders.depth.fragment,
	      attributes: ["aPosition"],
	      uniforms: ["uMatrix"]
	    });

	    this.framebuffer = new glx.Framebuffer(this.viewportSize, this.viewportSize);
	  },

	  // TODO: throttle calls
	  render: function() {

	    var
	      shader = this.shader,
	      framebuffer = this.framebuffer;

	    gl.viewport(0, 0, this.viewportSize, this.viewportSize);
	    shader.enable();
	    framebuffer.enable();

	    gl.clearColor(0.0, 0.0, 0, 1);
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	    var
	      dataItems = data.Index.items,
	      item,
	      modelMatrix, mvp;

	    for (var i = 0, il = dataItems.length; i < il; i++) {
	      item = dataItems[i];

	      if (!(modelMatrix = item.getMatrix())) {
	        continue;
	      }

	      //gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
	      //gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

	      /*gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
	      gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);*/
	      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

	      item.vertexBuffer.enable();
	      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	      /*item.normalBuffer.enable();
	      gl.vertexAttribPointer(shader.attributes.aNormal, item.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);*/

	      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
	    }

	    //render.Basemap.render();
	    shader.disable();
	    framebuffer.disable();

	    //gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
	    //gl.generateMipmap(gl.TEXTURE_2D);
	    
	    gl.viewport(0, 0, MAP.width, MAP.height);

	  },

	  destroy: function() {}
	};


	render.AmbientMap = {

	  viewportSize: 512,

	  init: function() {
	    this.shader = new glx.Shader({
	      vertexShader:   Shaders.ambientFromDepth.vertex,
	      fragmentShader: Shaders.ambientFromDepth.fragment,
	      attributes: ["aPosition", "aTexCoord"],
	      uniforms: ["uMatrix", "uInverseTexWidth", "uInverseTexHeight", "uTexIndex"]
	    });

	    this.framebuffer = new glx.Framebuffer(this.viewportSize, this.viewportSize);
	    
	    // enable texture filtering for framebuffer texture
	    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	    
	    this.vertexBuffer   = new glx.Buffer(3, new Float32Array(
	      [-1, -1, 1E-5,
	        1, -1, 1E-5,
	        1,  1, 1E-5, 
	       -1, -1, 1E-5,
	        1,  1, 1E-5,
	       -1,  1, 1E-5]));
	       
	    this.texCoordBuffer = new glx.Buffer(2, new Float32Array(
	      [0,0,
	       1,0,
	       1,1,
	       0,0,
	       1,1,
	       0,1
	      ]));
	  },

	  render: function(depthTexture) {

	    var
	      shader = this.shader,
	      framebuffer = this.framebuffer;

	    gl.viewport(0, 0, this.viewportSize, this.viewportSize);
	    shader.enable();
	    framebuffer.enable();

	    gl.clearColor(1.0, 0.0, 0, 1);
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


	    var identity = new glx.Matrix();
	    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, identity.data);

	    gl.uniform1f(shader.uniforms.uInverseTexWidth,  1/this.viewportSize);
	    gl.uniform1f(shader.uniforms.uInverseTexHeight, 1/this.viewportSize);


	    this.vertexBuffer.enable();
	    gl.vertexAttribPointer(shader.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	    this.texCoordBuffer.enable();
	    gl.vertexAttribPointer(shader.attributes.aTexCoord, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	    gl.activeTexture(gl.TEXTURE0);
	    gl.uniform1i(shader.uniforms.uTexIndex, 0);

	    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

	    //render.Basemap.render();
	    shader.disable();
	    framebuffer.disable();

	    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
	    gl.generateMipmap(gl.TEXTURE_2D);
	    
	    gl.viewport(0, 0, MAP.width, MAP.height);

	  },

	  destroy: function() {}
	};


	var basemap = {};


	basemap.Grid = {

	  tiles: {},

	  init: function(src, options) {
	    this.source = src;
	    this.options = options || {};
	    this.buffer = this.options.buffer || 1;

	    MAP.on('change', function() {
	      this.update(2000);
	    }.bind(this));

	    MAP.on('resize', this.update.bind(this));

	    this.update();
	  },

	  // strategy: start loading after {delay}ms, skip any attempts until then
	  // effectively loads in intervals during movement
	  update: function(delay) {
	    if (MAP.zoom < MIN_ZOOM || MAP.zoom > MAX_ZOOM) {
	      return;
	    }

	    if (!delay) {
	      this.loadTiles();
	      return;
	    }

	    if (this.isDelayed) {
	      return;
	    }

	    this.isDelayed = setTimeout(function() {
	      this.isDelayed = null;
	      this.loadTiles();
	    }.bind(this), delay);
	  },

	  updateBounds: function() {
	    var
	      zoom = Math.round(this.internalZoom || MAP.zoom),
	      radius = 1500, // render.SkyDome.radius,
	      ratio = Math.pow(2, zoom-MAP.zoom)/TILE_SIZE,
	      mapCenter = MAP.center;

	    this.bounds = {
	      zoom: zoom,
	      minX: ((mapCenter.x-radius)*ratio <<0) - this.buffer,
	      minY: ((mapCenter.y-radius)*ratio <<0) - this.buffer,
	      maxX: Math.ceil((mapCenter.x+radius)*ratio) + this.buffer,
	      maxY: Math.ceil((mapCenter.y+radius)*ratio) + this.buffer
	    };
	  },

	  getURL: function(x, y, z) {
	    var s = 'abcd'[(x+y) % 4];
	    return pattern(this.source, { s:s, x:x, y:y, z:z });
	  },

	  loadTiles: function() {
	    this.updateBounds();

	    var
	      tileX, tileY,
	      key,
	      queue = [], queueLength,
	      bounds = this.bounds,
	      tileAnchor = [
	        MAP.center.x/TILE_SIZE <<0,
	        MAP.center.y/TILE_SIZE <<0
	      ];

	    for (tileY = bounds.minY; tileY < bounds.maxY; tileY++) {
	      for (tileX = bounds.minX; tileX < bounds.maxX; tileX++) {
	        key = [tileX, tileY, bounds.zoom].join(',');
	        if (this.tiles[key]) {
	          continue;
	        }
	        this.tiles[key] = new basemap.Tile(tileX, tileY, bounds.zoom);
	        // TODO: rotate anchor point
	        queue.push({ tile:this.tiles[key], dist:distance2([tileX, tileY], tileAnchor) });
	      }
	    }

	    if (!(queueLength = queue.length)) {
	      return;
	    }

	    queue.sort(function(a, b) {
	      return a.dist-b.dist;
	    });

	    var tile;
	    for (var i = 0; i < queueLength; i++) {
	      tile = queue[i].tile;
	      tile.load(this.getURL(tile.x, tile.y, tile.zoom));
	    }

	    this.purge();
	  },

	  purge: function() {
	    for (var key in this.tiles) {
	      if (!this.tiles[key].isVisible(this.bounds)) {
	        this.tiles[key].destroy();
	        delete this.tiles[key];
	      }
	    }
	  },

	  destroy: function() {
	    clearTimeout(this.isDelayed);
	    for (var key in this.tiles) {
	      this.tiles[key].destroy();
	    }
	    this.tiles = null;
	  }
	};


	basemap.Tile = function(x, y, zoom) {
	  this.x = x;
	  this.y = y;
	  this.zoom = zoom;
	  var numSegments = 4;

	  var meshStep = 255/numSegments;
	  var textureStep = 1/numSegments;

	  var vertices = [];
	  var texCoords = [];

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
	    this.texture = new glx.texture.Image(url, function(image) {
	      Activity.setIdle();
	      if (image) {
	        this.isReady = true;
	      }
	    }.bind(this));
	  },

	  isVisible: function(bounds) {
	    // TODO: factor in tile origin
	    return (this.zoom === bounds.zoom && (this.x >= bounds.minX && this.x <= bounds.maxX && this.y >= bounds.minY && this.y <= bounds.maxY));
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

/***/ }
/******/ ]);