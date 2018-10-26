/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/icons/triangulateSVG.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/abs-svg-path/index.js":
/*!********************************************!*\
  !*** ./node_modules/abs-svg-path/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\nmodule.exports = absolutize\n\n/**\n * redefine `path` with absolute coordinates\n *\n * @param {Array} path\n * @return {Array}\n */\n\nfunction absolutize(path){\n\tvar startX = 0\n\tvar startY = 0\n\tvar x = 0\n\tvar y = 0\n\n\treturn path.map(function(seg){\n\t\tseg = seg.slice()\n\t\tvar type = seg[0]\n\t\tvar command = type.toUpperCase()\n\n\t\t// is relative\n\t\tif (type != command) {\n\t\t\tseg[0] = command\n\t\t\tswitch (type) {\n\t\t\t\tcase 'a':\n\t\t\t\t\tseg[6] += x\n\t\t\t\t\tseg[7] += y\n\t\t\t\t\tbreak\n\t\t\t\tcase 'v':\n\t\t\t\t\tseg[1] += y\n\t\t\t\t\tbreak\n\t\t\t\tcase 'h':\n\t\t\t\t\tseg[1] += x\n\t\t\t\t\tbreak\n\t\t\t\tdefault:\n\t\t\t\t\tfor (var i = 1; i < seg.length;) {\n\t\t\t\t\t\tseg[i++] += x\n\t\t\t\t\t\tseg[i++] += y\n\t\t\t\t\t}\n\t\t\t}\n\t\t}\n\n\t\t// update cursor state\n\t\tswitch (command) {\n\t\t\tcase 'Z':\n\t\t\t\tx = startX\n\t\t\t\ty = startY\n\t\t\t\tbreak\n\t\t\tcase 'H':\n\t\t\t\tx = seg[1]\n\t\t\t\tbreak\n\t\t\tcase 'V':\n\t\t\t\ty = seg[1]\n\t\t\t\tbreak\n\t\t\tcase 'M':\n\t\t\t\tx = startX = seg[1]\n\t\t\t\ty = startY = seg[2]\n\t\t\t\tbreak\n\t\t\tdefault:\n\t\t\t\tx = seg[seg.length - 2]\n\t\t\t\ty = seg[seg.length - 1]\n\t\t}\n\n\t\treturn seg\n\t})\n}\n\n\n//# sourceURL=webpack:///./node_modules/abs-svg-path/index.js?");

/***/ }),

/***/ "./node_modules/adaptive-bezier-curve/function.js":
/*!********************************************************!*\
  !*** ./node_modules/adaptive-bezier-curve/function.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function clone(point) { //TODO: use gl-vec2 for this\n    return [point[0], point[1]]\n}\n\nfunction vec2(x, y) {\n    return [x, y]\n}\n\nmodule.exports = function createBezierBuilder(opt) {\n    opt = opt||{}\n\n    var RECURSION_LIMIT = typeof opt.recursion === 'number' ? opt.recursion : 8\n    var FLT_EPSILON = typeof opt.epsilon === 'number' ? opt.epsilon : 1.19209290e-7\n    var PATH_DISTANCE_EPSILON = typeof opt.pathEpsilon === 'number' ? opt.pathEpsilon : 1.0\n\n    var curve_angle_tolerance_epsilon = typeof opt.angleEpsilon === 'number' ? opt.angleEpsilon : 0.01\n    var m_angle_tolerance = opt.angleTolerance || 0\n    var m_cusp_limit = opt.cuspLimit || 0\n\n    return function bezierCurve(start, c1, c2, end, scale, points) {\n        if (!points)\n            points = []\n\n        scale = typeof scale === 'number' ? scale : 1.0\n        var distanceTolerance = PATH_DISTANCE_EPSILON / scale\n        distanceTolerance *= distanceTolerance\n        begin(start, c1, c2, end, points, distanceTolerance)\n        return points\n    }\n\n\n    ////// Based on:\n    ////// https://github.com/pelson/antigrain/blob/master/agg-2.4/src/agg_curves.cpp\n\n    function begin(start, c1, c2, end, points, distanceTolerance) {\n        points.push(clone(start))\n        var x1 = start[0],\n            y1 = start[1],\n            x2 = c1[0],\n            y2 = c1[1],\n            x3 = c2[0],\n            y3 = c2[1],\n            x4 = end[0],\n            y4 = end[1]\n        recursive(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, 0)\n        points.push(clone(end))\n    }\n\n    function recursive(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, level) {\n        if(level > RECURSION_LIMIT) \n            return\n\n        var pi = Math.PI\n\n        // Calculate all the mid-points of the line segments\n        //----------------------\n        var x12   = (x1 + x2) / 2\n        var y12   = (y1 + y2) / 2\n        var x23   = (x2 + x3) / 2\n        var y23   = (y2 + y3) / 2\n        var x34   = (x3 + x4) / 2\n        var y34   = (y3 + y4) / 2\n        var x123  = (x12 + x23) / 2\n        var y123  = (y12 + y23) / 2\n        var x234  = (x23 + x34) / 2\n        var y234  = (y23 + y34) / 2\n        var x1234 = (x123 + x234) / 2\n        var y1234 = (y123 + y234) / 2\n\n        if(level > 0) { // Enforce subdivision first time\n            // Try to approximate the full cubic curve by a single straight line\n            //------------------\n            var dx = x4-x1\n            var dy = y4-y1\n\n            var d2 = Math.abs((x2 - x4) * dy - (y2 - y4) * dx)\n            var d3 = Math.abs((x3 - x4) * dy - (y3 - y4) * dx)\n\n            var da1, da2\n\n            if(d2 > FLT_EPSILON && d3 > FLT_EPSILON) {\n                // Regular care\n                //-----------------\n                if((d2 + d3)*(d2 + d3) <= distanceTolerance * (dx*dx + dy*dy)) {\n                    // If the curvature doesn't exceed the distanceTolerance value\n                    // we tend to finish subdivisions.\n                    //----------------------\n                    if(m_angle_tolerance < curve_angle_tolerance_epsilon) {\n                        points.push(vec2(x1234, y1234))\n                        return\n                    }\n\n                    // Angle & Cusp Condition\n                    //----------------------\n                    var a23 = Math.atan2(y3 - y2, x3 - x2)\n                    da1 = Math.abs(a23 - Math.atan2(y2 - y1, x2 - x1))\n                    da2 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - a23)\n                    if(da1 >= pi) da1 = 2*pi - da1\n                    if(da2 >= pi) da2 = 2*pi - da2\n\n                    if(da1 + da2 < m_angle_tolerance) {\n                        // Finally we can stop the recursion\n                        //----------------------\n                        points.push(vec2(x1234, y1234))\n                        return\n                    }\n\n                    if(m_cusp_limit !== 0.0) {\n                        if(da1 > m_cusp_limit) {\n                            points.push(vec2(x2, y2))\n                            return\n                        }\n\n                        if(da2 > m_cusp_limit) {\n                            points.push(vec2(x3, y3))\n                            return\n                        }\n                    }\n                }\n            }\n            else {\n                if(d2 > FLT_EPSILON) {\n                    // p1,p3,p4 are collinear, p2 is considerable\n                    //----------------------\n                    if(d2 * d2 <= distanceTolerance * (dx*dx + dy*dy)) {\n                        if(m_angle_tolerance < curve_angle_tolerance_epsilon) {\n                            points.push(vec2(x1234, y1234))\n                            return\n                        }\n\n                        // Angle Condition\n                        //----------------------\n                        da1 = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1))\n                        if(da1 >= pi) da1 = 2*pi - da1\n\n                        if(da1 < m_angle_tolerance) {\n                            points.push(vec2(x2, y2))\n                            points.push(vec2(x3, y3))\n                            return\n                        }\n\n                        if(m_cusp_limit !== 0.0) {\n                            if(da1 > m_cusp_limit) {\n                                points.push(vec2(x2, y2))\n                                return\n                            }\n                        }\n                    }\n                }\n                else if(d3 > FLT_EPSILON) {\n                    // p1,p2,p4 are collinear, p3 is considerable\n                    //----------------------\n                    if(d3 * d3 <= distanceTolerance * (dx*dx + dy*dy)) {\n                        if(m_angle_tolerance < curve_angle_tolerance_epsilon) {\n                            points.push(vec2(x1234, y1234))\n                            return\n                        }\n\n                        // Angle Condition\n                        //----------------------\n                        da1 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2))\n                        if(da1 >= pi) da1 = 2*pi - da1\n\n                        if(da1 < m_angle_tolerance) {\n                            points.push(vec2(x2, y2))\n                            points.push(vec2(x3, y3))\n                            return\n                        }\n\n                        if(m_cusp_limit !== 0.0) {\n                            if(da1 > m_cusp_limit)\n                            {\n                                points.push(vec2(x3, y3))\n                                return\n                            }\n                        }\n                    }\n                }\n                else {\n                    // Collinear case\n                    //-----------------\n                    dx = x1234 - (x1 + x4) / 2\n                    dy = y1234 - (y1 + y4) / 2\n                    if(dx*dx + dy*dy <= distanceTolerance) {\n                        points.push(vec2(x1234, y1234))\n                        return\n                    }\n                }\n            }\n        }\n\n        // Continue subdivision\n        //----------------------\n        recursive(x1, y1, x12, y12, x123, y123, x1234, y1234, points, distanceTolerance, level + 1) \n        recursive(x1234, y1234, x234, y234, x34, y34, x4, y4, points, distanceTolerance, level + 1) \n    }\n}\n\n\n//# sourceURL=webpack:///./node_modules/adaptive-bezier-curve/function.js?");

/***/ }),

/***/ "./node_modules/adaptive-bezier-curve/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/adaptive-bezier-curve/index.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! ./function */ \"./node_modules/adaptive-bezier-curve/function.js\")()\n\n//# sourceURL=webpack:///./node_modules/adaptive-bezier-curve/index.js?");

/***/ }),

/***/ "./node_modules/normalize-svg-path/index.js":
/*!**************************************************!*\
  !*** ./node_modules/normalize-svg-path/index.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\nvar PI = Math.PI\nvar _120 = radians(120)\n\nmodule.exports = normalize\n\n/**\n * describe `path` in terms of cubic bézier \n * curves and move commands\n *\n * @param {Array} path\n * @return {Array}\n */\n\nfunction normalize(path){\n\t// init state\n\tvar prev\n\tvar result = []\n\tvar bezierX = 0\n\tvar bezierY = 0\n\tvar startX = 0\n\tvar startY = 0\n\tvar quadX = null\n\tvar quadY = null\n\tvar x = 0\n\tvar y = 0\n\n\tfor (var i = 0, len = path.length; i < len; i++) {\n\t\tvar seg = path[i]\n\t\tvar command = seg[0]\n\t\tswitch (command) {\n\t\t\tcase 'M':\n\t\t\t\tstartX = seg[1]\n\t\t\t\tstartY = seg[2]\n\t\t\t\tbreak\n\t\t\tcase 'A':\n\t\t\t\tseg = arc(x, y,seg[1],seg[2],radians(seg[3]),seg[4],seg[5],seg[6],seg[7])\n\t\t\t\t// split multi part\n\t\t\t\tseg.unshift('C')\n\t\t\t\tif (seg.length > 7) {\n\t\t\t\t\tresult.push(seg.splice(0, 7))\n\t\t\t\t\tseg.unshift('C')\n\t\t\t\t}\n\t\t\t\tbreak\n\t\t\tcase 'S':\n\t\t\t\t// default control point\n\t\t\t\tvar cx = x\n\t\t\t\tvar cy = y\n\t\t\t\tif (prev == 'C' || prev == 'S') {\n\t\t\t\t\tcx += cx - bezierX // reflect the previous command's control\n\t\t\t\t\tcy += cy - bezierY // point relative to the current point\n\t\t\t\t}\n\t\t\t\tseg = ['C', cx, cy, seg[1], seg[2], seg[3], seg[4]]\n\t\t\t\tbreak\n\t\t\tcase 'T':\n\t\t\t\tif (prev == 'Q' || prev == 'T') {\n\t\t\t\t\tquadX = x * 2 - quadX // as with 'S' reflect previous control point\n\t\t\t\t\tquadY = y * 2 - quadY\n\t\t\t\t} else {\n\t\t\t\t\tquadX = x\n\t\t\t\t\tquadY = y\n\t\t\t\t}\n\t\t\t\tseg = quadratic(x, y, quadX, quadY, seg[1], seg[2])\n\t\t\t\tbreak\n\t\t\tcase 'Q':\n\t\t\t\tquadX = seg[1]\n\t\t\t\tquadY = seg[2]\n\t\t\t\tseg = quadratic(x, y, seg[1], seg[2], seg[3], seg[4])\n\t\t\t\tbreak\n\t\t\tcase 'L':\n\t\t\t\tseg = line(x, y, seg[1], seg[2])\n\t\t\t\tbreak\n\t\t\tcase 'H':\n\t\t\t\tseg = line(x, y, seg[1], y)\n\t\t\t\tbreak\n\t\t\tcase 'V':\n\t\t\t\tseg = line(x, y, x, seg[1])\n\t\t\t\tbreak\n\t\t\tcase 'Z':\n\t\t\t\tseg = line(x, y, startX, startY)\n\t\t\t\tbreak\n\t\t}\n\n\t\t// update state\n\t\tprev = command\n\t\tx = seg[seg.length - 2]\n\t\ty = seg[seg.length - 1]\n\t\tif (seg.length > 4) {\n\t\t\tbezierX = seg[seg.length - 4]\n\t\t\tbezierY = seg[seg.length - 3]\n\t\t} else {\n\t\t\tbezierX = x\n\t\t\tbezierY = y\n\t\t}\n\t\tresult.push(seg)\n\t}\n\n\treturn result\n}\n\nfunction line(x1, y1, x2, y2){\n\treturn ['C', x1, y1, x2, y2, x2, y2]\n}\n\nfunction quadratic(x1, y1, cx, cy, x2, y2){\n\treturn [\n\t\t'C',\n\t\tx1/3 + (2/3) * cx,\n\t\ty1/3 + (2/3) * cy,\n\t\tx2/3 + (2/3) * cx,\n\t\ty2/3 + (2/3) * cy,\n\t\tx2,\n\t\ty2\n\t]\n}\n\n// This function is ripped from \n// github.com/DmitryBaranovskiy/raphael/blob/4d97d4/raphael.js#L2216-L2304 \n// which references w3.org/TR/SVG11/implnote.html#ArcImplementationNotes\n// TODO: make it human readable\n\nfunction arc(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {\n\tif (!recursive) {\n\t\tvar xy = rotate(x1, y1, -angle)\n\t\tx1 = xy.x\n\t\ty1 = xy.y\n\t\txy = rotate(x2, y2, -angle)\n\t\tx2 = xy.x\n\t\ty2 = xy.y\n\t\tvar x = (x1 - x2) / 2\n\t\tvar y = (y1 - y2) / 2\n\t\tvar h = (x * x) / (rx * rx) + (y * y) / (ry * ry)\n\t\tif (h > 1) {\n\t\t\th = Math.sqrt(h)\n\t\t\trx = h * rx\n\t\t\try = h * ry\n\t\t}\n\t\tvar rx2 = rx * rx\n\t\tvar ry2 = ry * ry\n\t\tvar k = (large_arc_flag == sweep_flag ? -1 : 1)\n\t\t\t* Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x)))\n\t\tif (k == Infinity) k = 1 // neutralize\n\t\tvar cx = k * rx * y / ry + (x1 + x2) / 2\n\t\tvar cy = k * -ry * x / rx + (y1 + y2) / 2\n\t\tvar f1 = Math.asin(((y1 - cy) / ry).toFixed(9))\n\t\tvar f2 = Math.asin(((y2 - cy) / ry).toFixed(9))\n\n\t\tf1 = x1 < cx ? PI - f1 : f1\n\t\tf2 = x2 < cx ? PI - f2 : f2\n\t\tif (f1 < 0) f1 = PI * 2 + f1\n\t\tif (f2 < 0) f2 = PI * 2 + f2\n\t\tif (sweep_flag && f1 > f2) f1 = f1 - PI * 2\n\t\tif (!sweep_flag && f2 > f1) f2 = f2 - PI * 2\n\t} else {\n\t\tf1 = recursive[0]\n\t\tf2 = recursive[1]\n\t\tcx = recursive[2]\n\t\tcy = recursive[3]\n\t}\n\t// greater than 120 degrees requires multiple segments\n\tif (Math.abs(f2 - f1) > _120) {\n\t\tvar f2old = f2\n\t\tvar x2old = x2\n\t\tvar y2old = y2\n\t\tf2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1)\n\t\tx2 = cx + rx * Math.cos(f2)\n\t\ty2 = cy + ry * Math.sin(f2)\n\t\tvar res = arc(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy])\n\t}\n\tvar t = Math.tan((f2 - f1) / 4)\n\tvar hx = 4 / 3 * rx * t\n\tvar hy = 4 / 3 * ry * t\n\tvar curve = [\n\t\t2 * x1 - (x1 + hx * Math.sin(f1)),\n\t\t2 * y1 - (y1 - hy * Math.cos(f1)),\n\t\tx2 + hx * Math.sin(f2),\n\t\ty2 - hy * Math.cos(f2),\n\t\tx2,\n\t\ty2\n\t]\n\tif (recursive) return curve\n\tif (res) curve = curve.concat(res)\n\tfor (var i = 0; i < curve.length;) {\n\t\tvar rot = rotate(curve[i], curve[i+1], angle)\n\t\tcurve[i++] = rot.x\n\t\tcurve[i++] = rot.y\n\t}\n\treturn curve\n}\n\nfunction rotate(x, y, rad){\n\treturn {\n\t\tx: x * Math.cos(rad) - y * Math.sin(rad),\n\t\ty: x * Math.sin(rad) + y * Math.cos(rad)\n\t}\n}\n\nfunction radians(degress){\n\treturn degress * (PI / 180)\n}\n\n\n//# sourceURL=webpack:///./node_modules/normalize-svg-path/index.js?");

/***/ }),

/***/ "./node_modules/parse-svg-path/index.js":
/*!**********************************************!*\
  !*** ./node_modules/parse-svg-path/index.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\nmodule.exports = parse\n\n/**\n * expected argument lengths\n * @type {Object}\n */\n\nvar length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0}\n\n/**\n * segment pattern\n * @type {RegExp}\n */\n\nvar segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig\n\n/**\n * parse an svg path data string. Generates an Array\n * of commands where each command is an Array of the\n * form `[command, arg1, arg2, ...]`\n *\n * @param {String} path\n * @return {Array}\n */\n\nfunction parse(path) {\n\tvar data = []\n\tpath.replace(segment, function(_, command, args){\n\t\tvar type = command.toLowerCase()\n\t\targs = parseValues(args)\n\n\t\t// overloaded moveTo\n\t\tif (type == 'm' && args.length > 2) {\n\t\t\tdata.push([command].concat(args.splice(0, 2)))\n\t\t\ttype = 'l'\n\t\t\tcommand = command == 'm' ? 'l' : 'L'\n\t\t}\n\n\t\twhile (true) {\n\t\t\tif (args.length == length[type]) {\n\t\t\t\targs.unshift(command)\n\t\t\t\treturn data.push(args)\n\t\t\t}\n\t\t\tif (args.length < length[type]) throw new Error('malformed path data')\n\t\t\tdata.push([command].concat(args.splice(0, length[type])))\n\t\t}\n\t})\n\treturn data\n}\n\nvar number = /-?[0-9]*\\.?[0-9]+(?:e[-+]?\\d+)?/ig\n\nfunction parseValues(args) {\n\tvar numbers = args.match(number)\n\treturn numbers ? numbers.map(Number) : []\n}\n\n\n//# sourceURL=webpack:///./node_modules/parse-svg-path/index.js?");

/***/ }),

/***/ "./node_modules/svg-path-contours/index.js":
/*!*************************************************!*\
  !*** ./node_modules/svg-path-contours/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var bezier = __webpack_require__(/*! adaptive-bezier-curve */ \"./node_modules/adaptive-bezier-curve/index.js\")\nvar abs = __webpack_require__(/*! abs-svg-path */ \"./node_modules/abs-svg-path/index.js\")\nvar norm = __webpack_require__(/*! normalize-svg-path */ \"./node_modules/normalize-svg-path/index.js\")\nvar copy = __webpack_require__(/*! vec2-copy */ \"./node_modules/vec2-copy/index.js\")\n\nfunction set(out, x, y) {\n    out[0] = x\n    out[1] = y\n    return out\n}\n\nvar tmp1 = [0,0],\n    tmp2 = [0,0],\n    tmp3 = [0,0]\n\nfunction bezierTo(points, scale, start, seg) {\n    bezier(start, \n        set(tmp1, seg[1], seg[2]), \n        set(tmp2, seg[3], seg[4]),\n        set(tmp3, seg[5], seg[6]), scale, points)\n}\n\nmodule.exports = function contours(svg, scale) {\n    var paths = []\n\n    var points = []\n    var pen = [0, 0]\n    norm(abs(svg)).forEach(function(segment, i, self) {\n        if (segment[0] === 'M') {\n            copy(pen, segment.slice(1))\n            if (points.length>0) {\n                paths.push(points)\n                points = []\n            }\n        } else if (segment[0] === 'C') {\n            bezierTo(points, scale, pen, segment)\n            set(pen, segment[5], segment[6])\n        } else {\n            throw new Error('illegal type in SVG: '+segment[0])\n        }\n    })\n    if (points.length>0)\n        paths.push(points)\n    return paths\n}\n\n//# sourceURL=webpack:///./node_modules/svg-path-contours/index.js?");

/***/ }),

/***/ "./node_modules/vec2-copy/index.js":
/*!*****************************************!*\
  !*** ./node_modules/vec2-copy/index.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = function vec2Copy(out, a) {\n    out[0] = a[0]\n    out[1] = a[1]\n    return out\n}\n\n//# sourceURL=webpack:///./node_modules/vec2-copy/index.js?");

/***/ }),

/***/ "./src/icons/triangulateSVG.js":
/*!*************************************!*\
  !*** ./src/icons/triangulateSVG.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// webpack src/icons/triangulateSVG.js -o lib/triangulateSVG.js --mode development\n\nconst parseSVGPath = __webpack_require__(/*! parse-svg-path */ \"./node_modules/parse-svg-path/index.js\");\nconst getPathContours = __webpack_require__(/*! svg-path-contours */ \"./node_modules/svg-path-contours/index.js\");\n\n// TODO\n// rectangles, circles\n// colors from geometry\n// scale\n// simplify\n// ignore fill:none\n// <rect x=\"7.256\" y=\"17.315\" fill=\"none\" width=\"57.489\" height=\"35.508\"/>\n// <rect x=\"7.256\" y=\"49.216\" fill=\"#F07D00\" width=\"56.363\" height=\"3.607\"/>\n// <polygon fill=\"#003C64\" stroke=\"#003C64\" stroke-miterlimit=\"10\" points=\"18.465,18.011 12.628,29.15 12.628,18.011 7.256,18.011 7.256,42.903 12.628,42.903 12.628,29.867 18.789,42.903 24.84,42.903 17.75,29.365 24.195,18.011\"/>\n// <circle cx=\"25\" cy=\"75\" r=\"20\" stroke=\"red\" fill=\"transparent\" stroke-width=\"5\"/>\n// <ellipse cx=\"75\" cy=\"75\" rx=\"20\" ry=\"5\" stroke=\"red\" fill=\"transparent\" stroke-width=\"5\"/>\n\nfunction SVGtoPolygons (svg) {\n  const res = [];\n\n  let rx = /<path[^/]+d=\"([^\"]+)\"/g;\n  let match;\n  do {\n    match = rx.exec(svg);\n    if (match) {\n      const path = parseSVGPath(match[1]);\n      const contours = getPathContours(path);\n      res.push(contours);\n    }\n  } while (match);\n\n  rx = /<polygon[^/]+points=\"([^\"]+)\"/g;\n  do {\n    match = rx.exec(svg);\n    if (match) {\n      const points = match[1]\n        .split(/\\s+/g)\n        .map(point => {\n          const p = point.split(',');\n          return [\n            parseFloat(p[0]),\n            parseFloat(p[1]),\n          ];\n        });\n      res.push([points]);\n    }\n  } while (match);\n\n  return res;\n}\n\nfunction getOffsetAndScale (polygons) {\n  let\n    minX = Infinity, maxX = -Infinity,\n    minY = Infinity, maxY = -Infinity;\n\n  polygons.forEach(poly => {\n    poly.forEach(ring => {\n      ring.forEach(point => {\n        minX = Math.min(minX, point[0]);\n        maxX = Math.max(maxX, point[0]);\n        minY = Math.min(minY, point[1]);\n        maxY = Math.max(maxY, point[1]);\n      });\n    });\n  });\n\n  return { offset: [minX, minY], scale: Math.max(maxX-minX, maxY-minY) };\n}\n\nwindow.triangulateSVG = function (svg) { // window... exposes it in webpack\n  const polygons = SVGtoPolygons(svg);\n\n  const { offset, scale } = getOffsetAndScale(polygons);\n\n  const res = [];\n\n  polygons.forEach(poly => {\n    const\n      vertices = [],\n      ringIndex = [];\n\n    let r = 0;\n    poly.forEach((ring, i) => {\n      ring.forEach(point => {\n        vertices.push(...point);\n      });\n\n      if (i) {\n        r += poly[i - 1].length;\n        ringIndex.push(r);\n      }\n    });\n\n    const triangles = earcut(vertices, ringIndex);\n    for (let t = 0; t < triangles.length-2; t+=3) {\n      const i1 = triangles[t  ];\n      const i2 = triangles[t+1];\n      const i3 = triangles[t+2];\n\n      const a = [ (vertices[i1*2]-offset[0])/scale, (vertices[i1*2+1]-offset[1])/scale ];\n      const b = [ (vertices[i2*2]-offset[0])/scale, (vertices[i2*2+1]-offset[1])/scale ];\n      const c = [ (vertices[i3*2]-offset[0])/scale, (vertices[i3*2+1]-offset[1])/scale ];\n\n      res.push([a, b, c]);\n    }\n  });\n\n  return res;\n};\n\n\n//# sourceURL=webpack:///./src/icons/triangulateSVG.js?");

/***/ })

/******/ });