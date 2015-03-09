var OSMBuildings = (function(window) {

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.earcut=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = earcut;

function earcut(points) {

    var outerNode = linkedList(points[0], true);

    if (points.length > 1) outerNode = eliminateHoles(points, outerNode);

    var triangles = [];
    if (outerNode) earcutLinked(outerNode, triangles);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(points, clockwise) {
    var sum = 0,
        len = points.length,
        i, j, last;

    // calculate original winding order of a polygon ring
    for (i = 0, j = len - 1; i < len; j = i++) {
        var p1 = points[i],
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

function filterPoints(start) {
    // eliminate colinear or duplicate points
    var node = start,
        again;
    do {
        again = false;
        if (equals(node.p, node.next.p) || orient(node.prev.p, node.p, node.next.p) === 0) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
            node = start = node.prev;
            if (node === node.next) return null;
            again = true;

        } else {
            node = node.next;
        }
    } while (again || node !== start);

    return start;
}

function earcutLinked(ear, triangles, secondPass) {
    ear = filterPoints(ear);
    if (!ear) return;

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (isEar(ear)) {
            triangles.push(prev.p, ear.p, next.p);

            next.prev = prev;
            prev.next = next;

            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        if (ear === stop) {
            // if we can't find any more ears, try filtering points and cutting again
            if (!secondPass) earcutLinked(ear, triangles, true);
            // if this didn't work, try splitting the remaining polygon into two
            else splitEarcut(ear, triangles);
            break;
        }
    }
}

function isEar(ear) {

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

    var node = ear.next.next,
        cay = cy - ay,
        acx = ax - cx,
        aby = ay - by,
        bax = bx - ax,
        px, py, s, t, k;

    // make sure we don't have other points inside the potential ear
    while (node !== ear.prev) {

        px = node.p[0];
        py = node.p[1];

        node = node.next;

        s = cay * px + acx * py - acd;
        if (s >= 0) {
            t = aby * px + bax * py + abd;
            if (t >= 0) {
                k = A - s - t;
                if ((k >= 0) && ((s && t) || (s && k) || (t && k))) return false;
            }
        }
    }

    return true;
}

function splitEarcut(start, triangles) {
    // find a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // run earcut on each half
                earcutLinked(a, triangles);
                earcutLinked(c, triangles);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

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
        outerNode = filterPoints(outerNode);
    }

    return outerNode;
}

function eliminateHole(holeNode, outerNode) {
    outerNode = findHoleBridge(holeNode, outerNode);
    if (outerNode) splitPolygon(holeNode, outerNode);
}

function findHoleBridge(holeNode, outerNode) {
    var node = outerNode,
        p = holeNode.p,
        px = p[0],
        py = p[1],
        qMax = -Infinity,
        mNode, a, b;

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

function getLeftmost(start) {
    var node = start,
        leftmost = start;
    do {
        if (node.p[0] < leftmost.p[0]) leftmost = node;
        node = node.next;
    } while (node !== start);

    return leftmost;
}

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

// split the polygon vertices circular doubly-linked linked list into two
function splitPolygon(a, b) {
    var a2 = {p: a.p, prev: null, next: null},
        b2 = {p: b.p, prev: null, next: null},
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return a2;
}

function insertNode(point, last) {
    var node = {
        p: point,
        prev: null,
        next: null
    };

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

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjXFxlYXJjdXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZWFyY3V0O1xuXG5mdW5jdGlvbiBlYXJjdXQocG9pbnRzKSB7XG5cbiAgICB2YXIgb3V0ZXJOb2RlID0gbGlua2VkTGlzdChwb2ludHNbMF0sIHRydWUpO1xuXG4gICAgaWYgKHBvaW50cy5sZW5ndGggPiAxKSBvdXRlck5vZGUgPSBlbGltaW5hdGVIb2xlcyhwb2ludHMsIG91dGVyTm9kZSk7XG5cbiAgICB2YXIgdHJpYW5nbGVzID0gW107XG4gICAgaWYgKG91dGVyTm9kZSkgZWFyY3V0TGlua2VkKG91dGVyTm9kZSwgdHJpYW5nbGVzKTtcblxuICAgIHJldHVybiB0cmlhbmdsZXM7XG59XG5cbi8vIGNyZWF0ZSBhIGNpcmN1bGFyIGRvdWJseSBsaW5rZWQgbGlzdCBmcm9tIHBvbHlnb24gcG9pbnRzIGluIHRoZSBzcGVjaWZpZWQgd2luZGluZyBvcmRlclxuZnVuY3Rpb24gbGlua2VkTGlzdChwb2ludHMsIGNsb2Nrd2lzZSkge1xuICAgIHZhciBzdW0gPSAwLFxuICAgICAgICBsZW4gPSBwb2ludHMubGVuZ3RoLFxuICAgICAgICBpLCBqLCBsYXN0O1xuXG4gICAgLy8gY2FsY3VsYXRlIG9yaWdpbmFsIHdpbmRpbmcgb3JkZXIgb2YgYSBwb2x5Z29uIHJpbmdcbiAgICBmb3IgKGkgPSAwLCBqID0gbGVuIC0gMTsgaSA8IGxlbjsgaiA9IGkrKykge1xuICAgICAgICB2YXIgcDEgPSBwb2ludHNbaV0sXG4gICAgICAgICAgICBwMiA9IHBvaW50c1tqXTtcbiAgICAgICAgc3VtICs9IChwMlswXSAtIHAxWzBdKSAqIChwMVsxXSArIHAyWzFdKTtcbiAgICB9XG5cbiAgICAvLyBsaW5rIHBvaW50cyBpbnRvIGNpcmN1bGFyIGRvdWJseS1saW5rZWQgbGlzdCBpbiB0aGUgc3BlY2lmaWVkIHdpbmRpbmcgb3JkZXJcbiAgICBpZiAoY2xvY2t3aXNlID09PSAoc3VtID4gMCkpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSBsYXN0ID0gaW5zZXJ0Tm9kZShwb2ludHNbaV0sIGxhc3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaSA9IGxlbiAtIDE7IGkgPj0gMDsgaS0tKSBsYXN0ID0gaW5zZXJ0Tm9kZShwb2ludHNbaV0sIGxhc3QpO1xuICAgIH1cblxuICAgIHJldHVybiBsYXN0O1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJQb2ludHMoc3RhcnQpIHtcbiAgICAvLyBlbGltaW5hdGUgY29saW5lYXIgb3IgZHVwbGljYXRlIHBvaW50c1xuICAgIHZhciBub2RlID0gc3RhcnQsXG4gICAgICAgIGFnYWluO1xuICAgIGRvIHtcbiAgICAgICAgYWdhaW4gPSBmYWxzZTtcbiAgICAgICAgaWYgKGVxdWFscyhub2RlLnAsIG5vZGUubmV4dC5wKSB8fCBvcmllbnQobm9kZS5wcmV2LnAsIG5vZGUucCwgbm9kZS5uZXh0LnApID09PSAwKSB7XG4gICAgICAgICAgICBub2RlLnByZXYubmV4dCA9IG5vZGUubmV4dDtcbiAgICAgICAgICAgIG5vZGUubmV4dC5wcmV2ID0gbm9kZS5wcmV2O1xuICAgICAgICAgICAgbm9kZSA9IHN0YXJ0ID0gbm9kZS5wcmV2O1xuICAgICAgICAgICAgaWYgKG5vZGUgPT09IG5vZGUubmV4dCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBhZ2FpbiA9IHRydWU7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgICAgIH1cbiAgICB9IHdoaWxlIChhZ2FpbiB8fCBub2RlICE9PSBzdGFydCk7XG5cbiAgICByZXR1cm4gc3RhcnQ7XG59XG5cbmZ1bmN0aW9uIGVhcmN1dExpbmtlZChlYXIsIHRyaWFuZ2xlcywgc2Vjb25kUGFzcykge1xuICAgIGVhciA9IGZpbHRlclBvaW50cyhlYXIpO1xuICAgIGlmICghZWFyKSByZXR1cm47XG5cbiAgICB2YXIgc3RvcCA9IGVhcixcbiAgICAgICAgcHJldiwgbmV4dDtcblxuICAgIC8vIGl0ZXJhdGUgdGhyb3VnaCBlYXJzLCBzbGljaW5nIHRoZW0gb25lIGJ5IG9uZVxuICAgIHdoaWxlIChlYXIucHJldiAhPT0gZWFyLm5leHQpIHtcbiAgICAgICAgcHJldiA9IGVhci5wcmV2O1xuICAgICAgICBuZXh0ID0gZWFyLm5leHQ7XG5cbiAgICAgICAgaWYgKGlzRWFyKGVhcikpIHtcbiAgICAgICAgICAgIHRyaWFuZ2xlcy5wdXNoKHByZXYucCwgZWFyLnAsIG5leHQucCk7XG5cbiAgICAgICAgICAgIG5leHQucHJldiA9IHByZXY7XG4gICAgICAgICAgICBwcmV2Lm5leHQgPSBuZXh0O1xuXG4gICAgICAgICAgICBlYXIgPSBuZXh0Lm5leHQ7XG4gICAgICAgICAgICBzdG9wID0gbmV4dC5uZXh0O1xuXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVhciA9IG5leHQ7XG5cbiAgICAgICAgaWYgKGVhciA9PT0gc3RvcCkge1xuICAgICAgICAgICAgLy8gaWYgd2UgY2FuJ3QgZmluZCBhbnkgbW9yZSBlYXJzLCB0cnkgZmlsdGVyaW5nIHBvaW50cyBhbmQgY3V0dGluZyBhZ2FpblxuICAgICAgICAgICAgaWYgKCFzZWNvbmRQYXNzKSBlYXJjdXRMaW5rZWQoZWFyLCB0cmlhbmdsZXMsIHRydWUpO1xuICAgICAgICAgICAgLy8gaWYgdGhpcyBkaWRuJ3Qgd29yaywgdHJ5IHNwbGl0dGluZyB0aGUgcmVtYWluaW5nIHBvbHlnb24gaW50byB0d29cbiAgICAgICAgICAgIGVsc2Ugc3BsaXRFYXJjdXQoZWFyLCB0cmlhbmdsZXMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzRWFyKGVhcikge1xuXG4gICAgdmFyIGEgPSBlYXIucHJldi5wLFxuICAgICAgICBiID0gZWFyLnAsXG4gICAgICAgIGMgPSBlYXIubmV4dC5wLFxuXG4gICAgICAgIGF4ID0gYVswXSwgYnggPSBiWzBdLCBjeCA9IGNbMF0sXG4gICAgICAgIGF5ID0gYVsxXSwgYnkgPSBiWzFdLCBjeSA9IGNbMV0sXG5cbiAgICAgICAgYWJkID0gYXggKiBieSAtIGF5ICogYngsXG4gICAgICAgIGFjZCA9IGF4ICogY3kgLSBheSAqIGN4LFxuICAgICAgICBjYmQgPSBjeCAqIGJ5IC0gY3kgKiBieCxcbiAgICAgICAgQSA9IGFiZCAtIGFjZCAtIGNiZDtcblxuICAgIGlmIChBIDw9IDApIHJldHVybiBmYWxzZTsgLy8gcmVmbGV4LCBjYW4ndCBiZSBhbiBlYXJcblxuICAgIHZhciBub2RlID0gZWFyLm5leHQubmV4dCxcbiAgICAgICAgY2F5ID0gY3kgLSBheSxcbiAgICAgICAgYWN4ID0gYXggLSBjeCxcbiAgICAgICAgYWJ5ID0gYXkgLSBieSxcbiAgICAgICAgYmF4ID0gYnggLSBheCxcbiAgICAgICAgcHgsIHB5LCBzLCB0LCBrO1xuXG4gICAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IGhhdmUgb3RoZXIgcG9pbnRzIGluc2lkZSB0aGUgcG90ZW50aWFsIGVhclxuICAgIHdoaWxlIChub2RlICE9PSBlYXIucHJldikge1xuXG4gICAgICAgIHB4ID0gbm9kZS5wWzBdO1xuICAgICAgICBweSA9IG5vZGUucFsxXTtcblxuICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuXG4gICAgICAgIHMgPSBjYXkgKiBweCArIGFjeCAqIHB5IC0gYWNkO1xuICAgICAgICBpZiAocyA+PSAwKSB7XG4gICAgICAgICAgICB0ID0gYWJ5ICogcHggKyBiYXggKiBweSArIGFiZDtcbiAgICAgICAgICAgIGlmICh0ID49IDApIHtcbiAgICAgICAgICAgICAgICBrID0gQSAtIHMgLSB0O1xuICAgICAgICAgICAgICAgIGlmICgoayA+PSAwKSAmJiAoKHMgJiYgdCkgfHwgKHMgJiYgaykgfHwgKHQgJiYgaykpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gc3BsaXRFYXJjdXQoc3RhcnQsIHRyaWFuZ2xlcykge1xuICAgIC8vIGZpbmQgYSB2YWxpZCBkaWFnb25hbCB0aGF0IGRpdmlkZXMgdGhlIHBvbHlnb24gaW50byB0d29cbiAgICB2YXIgYSA9IHN0YXJ0O1xuICAgIGRvIHtcbiAgICAgICAgdmFyIGIgPSBhLm5leHQubmV4dDtcbiAgICAgICAgd2hpbGUgKGIgIT09IGEucHJldikge1xuICAgICAgICAgICAgaWYgKGlzVmFsaWREaWFnb25hbChhLCBiKSkge1xuICAgICAgICAgICAgICAgIC8vIHNwbGl0IHRoZSBwb2x5Z29uIGluIHR3byBieSB0aGUgZGlhZ29uYWxcbiAgICAgICAgICAgICAgICB2YXIgYyA9IHNwbGl0UG9seWdvbihhLCBiKTtcblxuICAgICAgICAgICAgICAgIC8vIHJ1biBlYXJjdXQgb24gZWFjaCBoYWxmXG4gICAgICAgICAgICAgICAgZWFyY3V0TGlua2VkKGEsIHRyaWFuZ2xlcyk7XG4gICAgICAgICAgICAgICAgZWFyY3V0TGlua2VkKGMsIHRyaWFuZ2xlcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYiA9IGIubmV4dDtcbiAgICAgICAgfVxuICAgICAgICBhID0gYS5uZXh0O1xuICAgIH0gd2hpbGUgKGEgIT09IHN0YXJ0KTtcbn1cblxuZnVuY3Rpb24gZWxpbWluYXRlSG9sZXMocG9pbnRzLCBvdXRlck5vZGUpIHtcbiAgICB2YXIgbGVuID0gcG9pbnRzLmxlbmd0aDtcblxuICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdmFyIGxpc3QgPSBmaWx0ZXJQb2ludHMobGlua2VkTGlzdChwb2ludHNbaV0sIGZhbHNlKSk7XG4gICAgICAgIGlmIChsaXN0KSBxdWV1ZS5wdXNoKGdldExlZnRtb3N0KGxpc3QpKTtcbiAgICB9XG4gICAgcXVldWUuc29ydChjb21wYXJlWCk7XG5cbiAgICAvLyBwcm9jZXNzIGhvbGVzIGZyb20gbGVmdCB0byByaWdodFxuICAgIGZvciAoaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGltaW5hdGVIb2xlKHF1ZXVlW2ldLCBvdXRlck5vZGUpO1xuICAgICAgICBvdXRlck5vZGUgPSBmaWx0ZXJQb2ludHMob3V0ZXJOb2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0ZXJOb2RlO1xufVxuXG5mdW5jdGlvbiBlbGltaW5hdGVIb2xlKGhvbGVOb2RlLCBvdXRlck5vZGUpIHtcbiAgICBvdXRlck5vZGUgPSBmaW5kSG9sZUJyaWRnZShob2xlTm9kZSwgb3V0ZXJOb2RlKTtcbiAgICBpZiAob3V0ZXJOb2RlKSBzcGxpdFBvbHlnb24oaG9sZU5vZGUsIG91dGVyTm9kZSk7XG59XG5cbmZ1bmN0aW9uIGZpbmRIb2xlQnJpZGdlKGhvbGVOb2RlLCBvdXRlck5vZGUpIHtcbiAgICB2YXIgbm9kZSA9IG91dGVyTm9kZSxcbiAgICAgICAgcCA9IGhvbGVOb2RlLnAsXG4gICAgICAgIHB4ID0gcFswXSxcbiAgICAgICAgcHkgPSBwWzFdLFxuICAgICAgICBxTWF4ID0gLUluZmluaXR5LFxuICAgICAgICBtTm9kZSwgYSwgYjtcblxuICAgIGRvIHtcbiAgICAgICAgYSA9IG5vZGUucDtcbiAgICAgICAgYiA9IG5vZGUubmV4dC5wO1xuXG4gICAgICAgIGlmIChweSA8PSBhWzFdICYmIHB5ID49IGJbMV0pIHtcbiAgICAgICAgICAgIHZhciBxeCA9IGFbMF0gKyAocHkgLSBhWzFdKSAqIChiWzBdIC0gYVswXSkgLyAoYlsxXSAtIGFbMV0pO1xuICAgICAgICAgICAgaWYgKHF4IDw9IHB4ICYmIHF4ID4gcU1heCkge1xuICAgICAgICAgICAgICAgIHFNYXggPSBxeDtcbiAgICAgICAgICAgICAgICBtTm9kZSA9IGFbMF0gPCBiWzBdID8gbm9kZSA6IG5vZGUubmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgIH0gd2hpbGUgKG5vZGUgIT09IG91dGVyTm9kZSk7XG5cbiAgICBpZiAoIW1Ob2RlKSByZXR1cm4gbnVsbDtcblxuICAgIHZhciBieCA9IG1Ob2RlLnBbMF0sXG4gICAgICAgIGJ5ID0gbU5vZGUucFsxXSxcbiAgICAgICAgcGJkID0gcHggKiBieSAtIHB5ICogYngsXG4gICAgICAgIHBjZCA9IHB4ICogcHkgLSBweSAqIHFNYXgsXG4gICAgICAgIGNweSA9IHB5IC0gcHksXG4gICAgICAgIHBjeCA9IHB4IC0gcU1heCxcbiAgICAgICAgcGJ5ID0gcHkgLSBieSxcbiAgICAgICAgYnB4ID0gYnggLSBweCxcbiAgICAgICAgQSA9IHBiZCAtIHBjZCAtIChxTWF4ICogYnkgLSBweSAqIGJ4KSxcbiAgICAgICAgc2lnbiA9IEEgPD0gMCA/IC0xIDogMSxcbiAgICAgICAgc3RvcCA9IG1Ob2RlLFxuICAgICAgICB0YW5NaW4gPSBJbmZpbml0eSxcbiAgICAgICAgbXgsIG15LCBhbXgsIHMsIHQsIHRhbjtcblxuICAgIG5vZGUgPSBtTm9kZS5uZXh0O1xuXG4gICAgd2hpbGUgKG5vZGUgIT09IHN0b3ApIHtcblxuICAgICAgICBteCA9IG5vZGUucFswXTtcbiAgICAgICAgbXkgPSBub2RlLnBbMV07XG4gICAgICAgIGFteCA9IHB4IC0gbXg7XG5cbiAgICAgICAgaWYgKGFteCA+PSAwICYmIG14ID49IGJ4KSB7XG4gICAgICAgICAgICBzID0gKGNweSAqIG14ICsgcGN4ICogbXkgLSBwY2QpICogc2lnbjtcbiAgICAgICAgICAgIGlmIChzID49IDApIHtcbiAgICAgICAgICAgICAgICB0ID0gKHBieSAqIG14ICsgYnB4ICogbXkgKyBwYmQpICogc2lnbjtcblxuICAgICAgICAgICAgICAgIGlmICh0ID49IDAgJiYgQSAqIHNpZ24gLSBzIC0gdCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhbiA9IE1hdGguYWJzKHB5IC0gbXkpIC8gYW14OyAvLyB0YW5nZW50aWFsXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YW4gPCB0YW5NaW4gJiYgbG9jYWxseUluc2lkZShub2RlLCBob2xlTm9kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1Ob2RlID0gbm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhbk1pbiA9IHRhbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1Ob2RlO1xufVxuXG5mdW5jdGlvbiBnZXRMZWZ0bW9zdChzdGFydCkge1xuICAgIHZhciBub2RlID0gc3RhcnQsXG4gICAgICAgIGxlZnRtb3N0ID0gc3RhcnQ7XG4gICAgZG8ge1xuICAgICAgICBpZiAobm9kZS5wWzBdIDwgbGVmdG1vc3QucFswXSkgbGVmdG1vc3QgPSBub2RlO1xuICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgIH0gd2hpbGUgKG5vZGUgIT09IHN0YXJ0KTtcblxuICAgIHJldHVybiBsZWZ0bW9zdDtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZERpYWdvbmFsKGEsIGIpIHtcbiAgICByZXR1cm4gIWludGVyc2VjdHNQb2x5Z29uKGEsIGEucCwgYi5wKSAmJlxuICAgICAgICAgICBsb2NhbGx5SW5zaWRlKGEsIGIpICYmIGxvY2FsbHlJbnNpZGUoYiwgYSkgJiZcbiAgICAgICAgICAgbWlkZGxlSW5zaWRlKGEsIGEucCwgYi5wKTtcbn1cblxuLy8gd2luZGluZyBvcmRlciBvZiB0cmlhbmdsZSBmb3JtZWQgYnkgMyBnaXZlbiBwb2ludHNcbmZ1bmN0aW9uIG9yaWVudChwLCBxLCByKSB7XG4gICAgdmFyIG8gPSAocVsxXSAtIHBbMV0pICogKHJbMF0gLSBxWzBdKSAtIChxWzBdIC0gcFswXSkgKiAoclsxXSAtIHFbMV0pO1xuICAgIHJldHVybiBvID4gMCA/IDEgOlxuICAgICAgICAgICBvIDwgMCA/IC0xIDogMDtcbn1cblxuZnVuY3Rpb24gZXF1YWxzKHAxLCBwMikge1xuICAgIHJldHVybiBwMVswXSA9PT0gcDJbMF0gJiYgcDFbMV0gPT09IHAyWzFdO1xufVxuXG4vLyBjaGVjayBpZiB0d28gc2VnbWVudHMgaW50ZXJzZWN0XG5mdW5jdGlvbiBpbnRlcnNlY3RzKHAxLCBxMSwgcDIsIHEyKSB7XG4gICAgcmV0dXJuIG9yaWVudChwMSwgcTEsIHAyKSAhPT0gb3JpZW50KHAxLCBxMSwgcTIpICYmXG4gICAgICAgICAgIG9yaWVudChwMiwgcTIsIHAxKSAhPT0gb3JpZW50KHAyLCBxMiwgcTEpO1xufVxuXG4vLyBjaGVjayBpZiBhIHBvbHlnb24gZGlhZ29uYWwgaW50ZXJzZWN0cyBhbnkgcG9seWdvbiBzZWdtZW50c1xuZnVuY3Rpb24gaW50ZXJzZWN0c1BvbHlnb24oc3RhcnQsIGEsIGIpIHtcbiAgICB2YXIgbm9kZSA9IHN0YXJ0O1xuICAgIGRvIHtcbiAgICAgICAgdmFyIHAxID0gbm9kZS5wLFxuICAgICAgICAgICAgcDIgPSBub2RlLm5leHQucDtcblxuICAgICAgICBpZiAocDEgIT09IGEgJiYgcDIgIT09IGEgJiYgcDEgIT09IGIgJiYgcDIgIT09IGIgJiYgaW50ZXJzZWN0cyhwMSwgcDIsIGEsIGIpKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgIH0gd2hpbGUgKG5vZGUgIT09IHN0YXJ0KTtcblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLy8gY2hlY2sgaWYgYSBwb2x5Z29uIGRpYWdvbmFsIGlzIGxvY2FsbHkgaW5zaWRlIHRoZSBwb2x5Z29uXG5mdW5jdGlvbiBsb2NhbGx5SW5zaWRlKGEsIGIpIHtcbiAgICByZXR1cm4gb3JpZW50KGEucHJldi5wLCBhLnAsIGEubmV4dC5wKSA9PT0gLTEgP1xuICAgICAgICBvcmllbnQoYS5wLCBiLnAsIGEubmV4dC5wKSAhPT0gLTEgJiYgb3JpZW50KGEucCwgYS5wcmV2LnAsIGIucCkgIT09IC0xIDpcbiAgICAgICAgb3JpZW50KGEucCwgYi5wLCBhLnByZXYucCkgPT09IC0xIHx8IG9yaWVudChhLnAsIGEubmV4dC5wLCBiLnApID09PSAtMTtcbn1cblxuLy8gY2hlY2sgaWYgdGhlIG1pZGRsZSBwb2ludCBvZiBhIHBvbHlnb24gZGlhZ29uYWwgaXMgaW5zaWRlIHRoZSBwb2x5Z29uXG5mdW5jdGlvbiBtaWRkbGVJbnNpZGUoc3RhcnQsIGEsIGIpIHtcbiAgICB2YXIgbm9kZSA9IHN0YXJ0LFxuICAgICAgICBpbnNpZGUgPSBmYWxzZSxcbiAgICAgICAgcHggPSAoYVswXSArIGJbMF0pIC8gMixcbiAgICAgICAgcHkgPSAoYVsxXSArIGJbMV0pIC8gMjtcbiAgICBkbyB7XG4gICAgICAgIHZhciBwMSA9IG5vZGUucCxcbiAgICAgICAgICAgIHAyID0gbm9kZS5uZXh0LnA7XG5cbiAgICAgICAgaWYgKCgocDFbMV0gPiBweSkgIT09IChwMlsxXSA+IHB5KSkgJiZcbiAgICAgICAgICAgIChweCA8IChwMlswXSAtIHAxWzBdKSAqIChweSAtIHAxWzFdKSAvIChwMlsxXSAtIHAxWzFdKSArIHAxWzBdKSkgaW5zaWRlID0gIWluc2lkZTtcblxuICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgIH0gd2hpbGUgKG5vZGUgIT09IHN0YXJ0KTtcblxuICAgIHJldHVybiBpbnNpZGU7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVYKGEsIGIpIHtcbiAgICByZXR1cm4gYS5wWzBdIC0gYi5wWzBdO1xufVxuXG4vLyBzcGxpdCB0aGUgcG9seWdvbiB2ZXJ0aWNlcyBjaXJjdWxhciBkb3VibHktbGlua2VkIGxpbmtlZCBsaXN0IGludG8gdHdvXG5mdW5jdGlvbiBzcGxpdFBvbHlnb24oYSwgYikge1xuICAgIHZhciBhMiA9IHtwOiBhLnAsIHByZXY6IG51bGwsIG5leHQ6IG51bGx9LFxuICAgICAgICBiMiA9IHtwOiBiLnAsIHByZXY6IG51bGwsIG5leHQ6IG51bGx9LFxuICAgICAgICBhbiA9IGEubmV4dCxcbiAgICAgICAgYnAgPSBiLnByZXY7XG5cbiAgICBhLm5leHQgPSBiO1xuICAgIGIucHJldiA9IGE7XG5cbiAgICBhMi5uZXh0ID0gYW47XG4gICAgYW4ucHJldiA9IGEyO1xuXG4gICAgYjIubmV4dCA9IGEyO1xuICAgIGEyLnByZXYgPSBiMjtcblxuICAgIGJwLm5leHQgPSBiMjtcbiAgICBiMi5wcmV2ID0gYnA7XG5cbiAgICByZXR1cm4gYTI7XG59XG5cbmZ1bmN0aW9uIGluc2VydE5vZGUocG9pbnQsIGxhc3QpIHtcbiAgICB2YXIgbm9kZSA9IHtcbiAgICAgICAgcDogcG9pbnQsXG4gICAgICAgIHByZXY6IG51bGwsXG4gICAgICAgIG5leHQ6IG51bGxcbiAgICB9O1xuXG4gICAgaWYgKCFsYXN0KSB7XG4gICAgICAgIG5vZGUucHJldiA9IG5vZGU7XG4gICAgICAgIG5vZGUubmV4dCA9IG5vZGU7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICBub2RlLm5leHQgPSBsYXN0Lm5leHQ7XG4gICAgICAgIG5vZGUucHJldiA9IGxhc3Q7XG4gICAgICAgIGxhc3QubmV4dC5wcmV2ID0gbm9kZTtcbiAgICAgICAgbGFzdC5uZXh0ID0gbm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG59XG4iXX0=

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

var OSMBuildings = function(options) {
  options = options || {};

  Data = new Grid(options.src || DATA_SRC.replace('{k}', options.dataKey || DATA_KEY), { fixedZoom: 16 });

  if (options.map) {
    this.addTo(options.map);
  }

  if (options.style) {
    this.setStyle(options.style);
  }
};

(function() {

  function onMapChange() {
    Data.updateTileBounds();
    Data.update(100);
  }

  function onMapResize() {
    Data.updateTileBounds();
    Data.update();
    Renderer.resize();
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
      Data.destroy();
    },

    setStyle: function(style) {
      var color = style.color || style.wallColor;
      if (color) {
        DEFAULT_COLOR = Color.parse(color).toRGBA();
      }
      return this;
    },

    addObject: function(type, url, position) {
      DataObjects.load(type, url, position);
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

var Map, Data, Renderer;

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
        try {
          callback(JSON.parse(req.responseText));
        } catch(ex) {}
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

function pattern(str, param) {
  return str.replace(/\{(\w+)\}/g, function(tag, key) {
    return param[key] || tag;
  });
}

var SHADERS = {"default":{"src":{"vertex":"\nprecision mediump float;\nattribute vec4 aPosition;\nattribute vec3 aNormal;\nattribute vec3 aColor;\nuniform mat4 uMatrix;\nuniform mat3 uNormalTransform;\nuniform vec3 uLightDirection;\nuniform vec3 uLightColor;\nvarying vec3 vColor;\nvarying vec4 vPosition;\nvoid main() {\n  gl_Position = uMatrix * aPosition;\n  vPosition = aPosition;\n  vec3 transformedNormal = aNormal * uNormalTransform;\n  float intensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;\n  vColor = aColor + uLightColor * intensity;\n}","fragment":"\nprecision mediump float;\nuniform float uAlpha;\nvarying vec4 vPosition;\nvarying vec3 vColor;\nfloat gradientHeight = 90.0;\nfloat maxGradientStrength = 0.3;\nvoid main() {\n  float shading = clamp((gradientHeight-vPosition.z) / (gradientHeight/maxGradientStrength), 0.0, maxGradientStrength);\n  gl_FragColor = vec4(vColor - shading, uAlpha);\n//  float fog = clamp((10.0-vPosition.y)/20.0, 0.0, 0.5);\n//  gl_FragColor = vec4(vColor - shading, uAlpha-fog);\n}\n"},"attributes":["aPosition","aColor","aNormal"],"uniforms":["uNormalTransform","uMatrix","uAlpha","uLightColor","uLightDirection"]}};


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


var Grid = function(url, options) {
  this.url = url;

  options = options || {};
  this.tileSize  = options.tileSize || 256;
  this.fixedZoom = options.fixedZoom;

  this.tiles = {};
  this.loading = {};
};

Grid.prototype = {

  updateTileBounds: function() {
    var
      bounds = Map.bounds,
      tileSize = this.tileSize,
      zoom = this.zoom = this.fixedZoom || Math.round(Map.zoom),
      worldSize = tileSize <<zoom,
      min = project(bounds.n, bounds.w, worldSize),
      max = project(bounds.s, bounds.e, worldSize);

    this.tileBounds = {
      minX: min.x/tileSize <<0,
      minY: min.y/tileSize <<0,
      maxX: Math.ceil(max.x/tileSize),
      maxY: Math.ceil(max.y/tileSize)
    };
  },

  update: function(delay) {
    if (!delay) {
      this.loadTiles();
      return;
    }

    if (!this.isWaiting) {
      this.isWaiting = setTimeout(function() {
        this.isWaiting = null;
        this.loadTiles();
      }.bind(this), delay);
    }
  },

  loadTiles: function() {
    var
      tileBounds = this.tileBounds,
      zoom = this.zoom,
      tiles = this.tiles,
      loading = this.loading,
      x, y, key,
      queue = [], queueLength;

    for (y = tileBounds.minY; y <= tileBounds.maxY; y++) {
      for (x = tileBounds.minX; x <= tileBounds.maxX; x++) {
        key = [x, y, zoom].join(',');
        if (tiles[key] || loading[key]) {
          continue;
        }
        queue.push({ x:x, y:y, z:zoom });
      }
    }

    if (!(queueLength = queue.length)) {
      return;
    }

    // TODO: currently viewport center but could be aligned to be camera pos
    var tileAnchor = {
      x:tileBounds.minX + (tileBounds.maxX-tileBounds.minX-1)/2,
      y:tileBounds.minY + (tileBounds.maxY-tileBounds.minY-1)/2
    };

    queue.sort(function(b, a) {
      return distance2(a, tileAnchor) - distance2(b, tileAnchor);
    });

    for (var i = 0; i < queueLength; i++) {
      this.loadTile(queue[i].x, queue[i].y, queue[i].z);
    }

    this.purge();
  },

  getURL: function(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(this.url, { s:s, x:x, y:y, z:z });
  },

  loadTile: function(x, y, z) {
    var key = [x, y, z].join(',');
    this.loading[key] = XHR.loadJSON(this.getURL(x, y, z), function(data) {
      delete this.loading[key];
      this.tiles[key] = new Tile(x, y, z, data);
    }.bind(this));
  },

  purge: function() {
    var
      key,
      tiles = this.tiles,
      loading = this.loading;

    for (key in tiles) {
      if (!this.isVisible(key, 2)) {
        tiles[key].destroy();
        delete tiles[key];
      }
    }

    for (key in loading) {
      if (!this.isVisible(key)) {
        loading[key].abort();
        delete loading[key];
      }
    }
  },

  // TODO: maybe make isVisible() a Tile method. Then create the tile early in order to profit in loading()
  isVisible: function(key, buffer) {
    buffer = buffer || 0;

    var
      tileSize = this.tileSize,
      tileBounds = this.tileBounds,
      xyz = key.split(','),
      x = parseInt(xyz[0], 10), y = parseInt(xyz[1], 10), z = parseInt(xyz[2], 10);

    if (z !== this.zoom) {
      return false;
    }

    return (x >= tileBounds.minX-buffer-tileSize && x <= tileBounds.maxX+buffer && y >= tileBounds.minY-buffer-tileSize && y <= tileBounds.maxY+buffer);
  },

  getVisibleItems: function() {
    var
      tiles = this.tiles,
      key,
      items = [];

    for (key in tiles) {
      if (this.isVisible(key)) {
        items.push(tiles[key]);
      }
    }

    return items;
  },

  destroy: function() {
    clearTimeout(this.isWaiting);

    for (var key in this.tiles) {
      this.tiles[key].destroy();
    }
    this.tiles = null;

    for (key in this.loading) {
      this.loading[key].abort();
    }
    this.loading = null;
  }
};


var Tile = function(x, y, z, geojson) {
  this.x = x;
  this.y = y;
  this.z = z;

  var data = GeoJSON.read(x, y, z, geojson);
  this.vertexBuffer = this.createBuffer(3, new Float32Array(data.vertices));
  this.normalBuffer = this.createBuffer(3, new Float32Array(data.normals));
  this.colorBuffer  = this.createBuffer(3, new Uint8Array(data.colors));
};

Tile.prototype = {

  createBuffer: function(itemSize, data) {
    var buffer = gl.createBuffer();
    buffer.itemSize = itemSize;
    buffer.numItems = data.length/itemSize;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  },

  render: function(program, projection) {
    var ratio = 1/Math.pow(2, this.z-Map.zoom);
    var adaptedTileSize = TILE_SIZE*ratio;
    var size = Map.size;
    var origin = Map.origin;

    var matrix = Matrix.create();

    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.65);
    matrix = Matrix.translate(matrix, this.x*adaptedTileSize - origin.x, this.y*adaptedTileSize - origin.y, 0);
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
  },

  destroy: function() {
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.normalBuffer);
    gl.deleteBuffer(this.colorBuffer);
  }
};


// TODO: maybe let grid data sources store their items here

var DataObjects = {

  items: [],

  getVisibleItems: function() {
    var items = [];
    for (var i = 0, il = this.items.length; i < il; i++) {
      // TODO: check visiblity => know the bbox
      items.push(this.items[i]);
    }
    return items;
  },

  load: function(type, url, position) {
    var req = new XMLHttpRequest();

    req.onreadystatechange = function() {
      if (req.readyState !== 4) {
        return;
      }

      if (!req.status || req.status < 200 || req.status > 299) {
        return;
      }

      if (req.responseText) {
        var data;
        switch (type.toLowerCase()) {
          case 'geojson': data = GeoJSON.read(0, 0, 16, JSON.parse(req.responseText)); break;
          case 'obj':     data = OBJ.read(req.responseText); break;
        }

        if (data) {
          this.items.push(new DataItem(data, position));
        }
      }
    }.bind(this);

    req.open('GET', url);
    req.send(null);

    return req;
  }
};


var DataItem = function(data) {
/*
  var i = Math.random() * 100;
  i = Math.round(i/3) * 3;

  var x = data.vertices[i+0];
  var y = data.vertices[i+1];
  var z = data.vertices[i+2];

  console.log('RAW', x, y, z);

  var ratio = 1/Math.pow(2, 16-Map.zoom);
  var size = Map.size;
  var origin = Map.origin;

  x *= ratio;
  y *= ratio;
  z *= ratio*0.65;

  console.log('SCALED', x, y, z);

  x -= origin.x;
  y -= origin.y;
  z -= 0;

  console.log('TRANSLATED 1', x, y, z);

  x += size.width/2;
  y += size.height/2;
  z -= 0;

  console.log('TRANSLATED 2', x, y, z);

*/

  this.vertexBuffer = this.createBuffer(3, new Float32Array(data.vertices));
  this.normalBuffer = this.createBuffer(3, new Float32Array(data.normals));
  this.colorBuffer  = this.createBuffer(3, new Uint8Array(data.colors));
};

DataItem.prototype = {

  createBuffer: function(itemSize, data) {
    var buffer = gl.createBuffer();
    buffer.itemSize = itemSize;
    buffer.numItems = data.length/itemSize;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  },

  render: function(program, projection) {
//  var ratio = (1/12000) / Math.pow(2, 16-Map.zoom);
    var ratio = 1/Math.pow(2, 16-Map.zoom);
    var size = Map.size;
    var origin = Map.origin;

    var matrix = Matrix.create();
    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.65);
//  var pos = project(this.position.latitude, this.position.longitude, TILE_SIZE * Math.pow(2, Map.zoom));
//  matrix = Matrix.translate(matrix, pos.x-origin.x, pos.y-origin.y, 0);
    matrix = Matrix.translate(matrix, -origin.x, -origin.y, 0);
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
  },

  destroy: function() {
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.normalBuffer);
    gl.deleteBuffer(this.colorBuffer);
  }
};


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

  function transform(x, y, z, coordinates) {
    var
      worldSize = TILE_SIZE * Math.pow(2, z),
      offX = x*TILE_SIZE,
      offY = y*TILE_SIZE,
      res = [],
      r, rl, p,
      ring;

    for (var c = 0, cl = coordinates.length; c < cl; c++) {
      ring = coordinates[c];
      res[c] = [];
      for (r = 0, rl = ring.length-1; r < rl; r++) {
        p = project(ring[r][1], ring[r][0], worldSize);
        res[c][r] = [p.x-offX, p.y-offY];
      }
    }

    return res;
  }

  GeoJSON.read = function(x, y, z, geojson) {
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
        polygon = transform(x, y, z, geometries[j]);

        if ((item.roofShape === 'cone' || item.roofShape === 'dome') && !item.shape && isRotational(polygon)) {
          item.shape = 'cylinder';
          item.isRotational = true;
        }

        if (item.isRotational) {
          bbox = getBBox(polygon);
          radius = (bbox.maxX-bbox.minX)/2;
          center = [ bbox.minX + (bbox.maxX-bbox.minX)/2, bbox.minY + (bbox.maxY-bbox.minY)/2 ];
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
//          Pyramid.draw(context, footprint, item.center, h, mh, wallColor);
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
//          Pyramid.draw(context, footprint, item.center, h+item.roofHeight, h, roofColor);
          break;
        }
      }
    }

    return data;
  };

}());


var OBJ = {};

(function() {

  function addVertex(index, line) {
    var x = parseFloat(line[1]);
    var y = parseFloat(line[2]);
    var z = parseFloat(line[3]);
    index.vertices.push([x, z, y]);
  }

  function addNormal(index, line) {
    index.normals.push([ parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3]) ]);
  }

  function addTexCoord(index, line) {
    index.texCoords.push([ parseFloat(line[1]), parseFloat(line[2]) ]);
  }

  function addFace(model, polygon, index) {
    var vertex, normal, color = [240, 220, 200], texCoord, attr;


    for (var i = 1, il = 4; i < il; i++) { // il = polygon.length
      attr = polygon[i].split('/');

      vertex   = index.vertices[  attr[0]-1 ];
      normal   = index.normals[   attr[2]-1 ];
      texCoord = index.texCoords[ attr[1]-1 ];

      model.vertices.push( vertex[0],   vertex[1], vertex[2]);
      model.normals.push(  normal[0],   normal[1], normal[2]);
      model.colors.push(   color[0],    color[1],  color[2]);
      model.texCoords.push(texCoord[0], texCoord[1]);
    }
  }

  OBJ.read = function(str) {
    var index = {
      vertices: [],
      normals: [],
      texCoords: []
    };

    var model = {
      vertices: [],
      normals: [],
      colors: [],
      texCoords: []
    };

    var lines = str.split('\n'), line;
    for (var i = 0, il = lines.length; i < il; i++) {
      line = lines[i].split(' ');
      switch (line[0]) {
        case 'v':  addVertex(index, line); break;
        case 'vn': addNormal(index, line); break;
        case 'vt': addTexCoord(index, line); break;
        case 'f':  addFace(model, line, index); break;
      }
    }

    return model;
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


var gl;

var GLRenderer = function(gl_) {
  gl = gl_;
  this.shaderPrograms.default = new Shader('default');
  this.resize();
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

//    this.clear();

    if (Map.zoom < MIN_ZOOM) {
      return;
    }

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.cullFace(gl.FRONT);

//  gl.enable(gl.BLEND);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//  gl.disable(gl.DEPTH_TEST);

    var items = Data.getVisibleItems();
    var objects = DataObjects.getVisibleItems();

    program = this.shaderPrograms.default.use();

    // TODO: suncalc
    gl.uniform3fv(program.uniforms.uLightColor, [0.5, 0.5, 0.5]);
    gl.uniform3fv(program.uniforms.uLightDirection, unit(1, 1, 1));

    gl.uniform1f(program.uniforms.uAlpha, adjust(Map.zoom, STYLE.zoomAlpha, 'zoom', 'alpha'));

    var normalMatrix = Matrix.invert3(Matrix.create());
    gl.uniformMatrix3fv(program.uniforms.uNormalTransform, false, new Float32Array(Matrix.transpose(normalMatrix)));

    for (i = 0, il = items.length; i < il; i++) {
      items[i].render(program, this.projections.perspective);
    }

    for (i = 0, il = objects.length; i < il; i++) {
      objects[i].render(program, this.projections.perspective);
    }

    program.end();
  },

  resize: function() {
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