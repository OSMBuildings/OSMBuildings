
function distance2(a, b) {
  var
    dx = a[0]-b[0],
    dy = a[1]-b[1];
  return dx*dx + dy*dy;
}

function isCircular(polygon, bbox, center) {
  var length = polygon.length;

  if (length < 16) {
    return false;
  }

  var
    width = bbox.maxX-bbox.minX,
    height = bbox.maxY-bbox.minY,
    sizeRatio = width/height;

  if (sizeRatio < 0.85 || sizeRatio > 1.15) {
    return false;
  }

  var
    radius = (width+height)/4,
    sqRadius = radius*radius,
    dist;


  for (var i = 0; i < length; i++) {
    dist = distance2(polygon[i], center);
    if (dist/sqRadius < 0.75 || dist/sqRadius > 1.25) {
      return false;
    }
  }

  return true;
}

function isClockWise(polygon) {
  return 0 < polygon.reduce(function(a, b, c, d) {
      return a + ((c < d.length - 1) ? (d[c+1][0] - b[0]) * (d[c+1][1] + b[1]) : 0);
    }, 0);
}

function getBBox(polygon) {
  var
    x =  Infinity, y =  Infinity,
    X = -Infinity, Y = -Infinity;

  for (var i = 0; i < polygon.length; i++) {
    x = Math.min(x, polygon[i][0]);
    y = Math.min(y, polygon[i][1]);

    X = Math.max(X, polygon[i][0]);
    Y = Math.max(Y, polygon[i][1]);
  }

  return { minX:x, minY:y, maxX:X, maxY:Y };
}

function assert(condition, message) {
  if (!condition) {
    throw message;
  }
}

/* Returns the distance of point 'p' from line 'line1'->'line2'.
 * based on http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html
 */
 /*
function getDistancePointLine2( line1, line2, p) {

  //v: a unit-length vector perpendicular to the line;
  var v = norm2( [ line2[1] - line1[1], line1[0] - line2[0] ] );
  var r = sub2( line1, p);
  return Math.abs(dot2(v, r));
} */

/*  given a pixel's (integer) position through which the line 'segmentStart' ->
 *  'segmentEnd' passes, this method returns the one neighboring pixel of 
 *  'currentPixel' that would be traversed next if the line is followed in 
 *  the direction from 'segmentStart' to 'segmentEnd' (even if the next point
 *  would lie beyond 'segmentEnd'. )
 */
function getNextPixel(segmentStart, segmentEnd, currentPixel) {

  var vInc = [segmentStart[0] < segmentEnd[0] ? 1 : -1, 
              segmentStart[1] < segmentEnd[1] ? 1 : -1];
         
  var nextX = currentPixel[0] + (segmentStart[0] < segmentEnd[0] ?  +1 : 0);
  var nextY = currentPixel[1] + (segmentStart[1] < segmentEnd[1] ?  +1 : 0);
  
  // position of the edge to the next pixel on the line 'segmentStart'->'segmentEnd'
  var alphaX = (nextX - segmentStart[0])/ (segmentEnd[0] - segmentStart[0]);
  var alphaY = (nextY - segmentStart[1])/ (segmentEnd[1] - segmentStart[1]);
  
  if (alphaX < 0.0 || alphaX > 1.0 || alphaY < 0.0 || alphaY > 1.0)
    return [undefined, undefined];
  
  if (alphaX == -Infinity) alphaX = Infinity;
  if (alphaY == -Infinity) alphaY = Infinity;

  assert(alphaX >= 0 && alphaY >= 0, "Invalid movement direction");
  
  return alphaX < alphaY ? [currentPixel[0]+vInc[0], currentPixel[1]] :
                           [currentPixel[0],         currentPixel[1] + vInc[1]];
}

/* returns all pixels that are at least partially covered by the triangle
 * p1-p2-p3. 
 * Note: the returned array of pixels *will* contain duplicates that may need 
 * to be removed.
 */
function rasterTriangle(p1, p2, p3) {
  var points = [p1, p2, p3];
  points.sort(function(p, q) {
    return p[1] < q[1];
  });
  p1 = points[0];
  p2 = points[1];
  p3 = points[2];
  
  if (p1[1] == p2[1])
    return rasterFlatTriangle( p1, p2, p3);
    
  if (p2[1] == p3[1])
    return rasterFlatTriangle( p2, p3, p1);
    
    
  var alpha = (p2[1] - p1[1]) / (p3[1] - p1[1]);
  //point on the line p1->p3 with the same y-value as p2
  var p4 = [p1[0] + alpha*(p3[0]-p1[0]), p2[1]];
  
  /*  P3
   *   |\
   *   | \
   *  P4--P2
   *   | /
   *   |/
   *   P1
   * */
  return rasterFlatTriangle(p4, p2, p1).concat(
         rasterFlatTriangle(p4, p2, p3));
}


/* Returns all pixels that are at least partially covered by the triangle
 * flat0-flat1-other, where the points flat0 and flat1 need to have the
 * same y-value. This method is used internally for rasterTriangle(), which
 * splits a general triangle into two flat triangles, and calls this method
 * for both parts.
 * Note: the returned array of pixels will contain duplicates.
 *
 * other
 *  | \_
 *  |   \_
 *  |     \_
 * f0/f1--f1/f0  
 */
function rasterFlatTriangle( flat0, flat1, other ) {

  //console.log("RFT:\n%s\n%s\n%s", String(flat0), String(flat1), String(other));
  var points = [];
  assert( flat0[1] === flat1[1], "not a flat triangle");
  assert( other[1] !== flat0[1], "not a triangle");
  assert( flat0[0] !== flat1[0], "not a triangle");

  if (flat0[0] > flat1[0]) //guarantees that flat0 is always left of flat1
  {
    var tmp = flat0;
    flat0 = flat1;
    flat1 = tmp;
  }
  
  var leftRasterPos = [Math.floor(other[0]), Math.floor(other[1])];
  var rightRasterPos = leftRasterPos.slice(0);
  points.push(leftRasterPos.slice(0));
  var yDir = other[1] < flat0[1] ? +1 : -1;
  var yStart = Math.floor(other[1]) + yDir;
  var yBeyond= Math.floor(flat0[1]) + yDir;
  var prevLeftRasterPos;
  var prevRightRasterPos;

  for (var y = yStart; (y*yDir) < (yBeyond*yDir); y+= yDir) {
    do {
      points.push( leftRasterPos.slice(0));
      prevLeftRasterPos = leftRasterPos;
      leftRasterPos = getNextPixel(other, flat0, leftRasterPos);
    } while (leftRasterPos[1]*yDir <= y*yDir);
    leftRasterPos = prevLeftRasterPos;
    
    do {
      points.push( rightRasterPos.slice(0));
      prevRightRasterPos = rightRasterPos;
      rightRasterPos = getNextPixel(other, flat1, rightRasterPos);
    } while (rightRasterPos[1]*yDir <= y*yDir);
    rightRasterPos = prevRightRasterPos;
    
    for (var x = leftRasterPos[0]; x <= rightRasterPos[0]; x++) {
      points.push( [x,y] );
    }
  }
  
  return points;
}

/* Returns an array of all pixels that are at least partially covered by the
 * convex quadrilateral 'quad'. If the passed quadrilateral is not convex,
 * then the return value of this method is undefined.
 */
function rasterConvexQuad (quad) {
  assert(quad.length == 4, "Error: Quadrilateral with more or less than four vertices");
  var res1  = rasterTriangle( quad[0], quad[1], quad[2]);
  var res2 =  rasterTriangle( quad[0], quad[2], quad[3]);
  
  return res1.concat(res2);
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
/*
function isPointInTriangle(tA, tB, tC, P) {
  var v1x = tB[0] - tA[0];
  var v1y = tB[1] - tA[1];

  var v2x = tC[0] - tA[0];
  var v2y = tC[1] - tA[1];

  var qx  = P[0] - tA[0];
  var qy  = P[1] - tA[1];

  // 'denom' is zero iff v1 and v2 have the same direction. In that case,
  // the triangle has degenerated to a line, and no point can lie inside it
  var denom = v2x * v1y - v2y * v1x;
  if (denom === 0)
    return false;

  var numeratorBeta = qx*v1y - qy*v1x;
  var beta = numeratorBeta/denom;

  var numeratorAlpha = qx*v2y - qy*v2x;
  var alpha = - numeratorAlpha / denom;

  return alpha >= 0.0 && beta >= 0.0 && (alpha + beta) <= 1.0;
}
*/

// FIXME: make this more robust so that it also works in non-monotonous situations

/* Determines a position on the ray starting at 'pStart' with direction 'pDir'
 * that is about 'distance' away from the plane through point 'pos' with normal
 * 'lookDir'. Since we currently have no way of computing this value directly,
 * we instead resort to an iterative approximation technique.
 * 
 * This method only works correctly of the computed distance is monotonously
 * increasing along 'pDir'.
 *
 * Implementation: the actual iterative approximation occurs in two phases
 *   1. iteratively find a position along the ray that is further than 
 *      'distance' away from the plane. To find that position, we simply
 *      go 1, 2, 4, 8, ... units away from pStart in direction pDir until
 *      the distance is large enough.
 *   2. with the original point 'pStart' being too close, and the point
 *      'pFarther' computed in step 1 being too far away, the sought point
 *      has to lie between the two. To find it, we use a binary search: 
 *      we iteratively compute the center between the two points to determine 
 *      in which half of the interval (pStart to center, or center to 
 *      pFarther) the sought point has to lie, and then adjust either pStart 
 *      or pFarther to match that interval. Once the center point has a 
 *      distance to the plane that matches 'distance' (within a certain 
 *      level of tolerance to allow for numerical inaccuracies), we return it.
 */
function getRayPointAtDistanceToPlane (pos, lookDir, pStart, pDir, distance) {
  
  if (len3(lookDir) === 0 || len3(pDir) === 0) {
    return;
  }

  pDir = norm3(pDir);
  lookDir = norm3(lookDir);
  
  pCloser = pStart;
  pCloserDistToPlane = dot3( sub3( pStart, pos), lookDir);
  var distMultiplier = 1;
  var pNext;
  if (pCloserDistToPlane > distance)
    return pCloser;
    
  while (true) {
    pNext = add3( pStart, mul3scalar(pDir, distMultiplier));
    var pNextDistToPlane = dot3( sub3(pNext, pos), lookDir);
    
    if (pNextDistToPlane > distance) // is too far away
      break;
      
    distMultiplier *= 2;
  }
  
  var pFarther = pNext;
  
  while (true)
  {
    var pMid = mul3scalar( add3(pCloser, pFarther), 0.5);
    var pMidDistToPlane = dot3( sub3(pMid, pos), lookDir);
    
    // if the relative difference is small enough, we found the result;
    if ( Math.abs( pMidDistToPlane/distance - 1) < 1E-5)
      return pMid;
      
    if (pMidDistToPlane > distance) // too far away
      pFarther = pMid;
    else
      pCloser = pMid;
  }
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
  var vDir = sub3(v2, v1);

  if (vDir[2] >= 0) // ray would not intersect with the plane
  {
    return undefined;
  }
  /* ray equation for all world-space points 'p' lying on the screen-space NDC position
   * (screenNdcX, screenNdcY) is:  p = v1 + λ*vDirNorm
   * For the intersection with the xy-plane (-> z=0) holds: v1[2] + λ*vDirNorm[2] = p[2] = 0.0.
   * Rearranged, this reads:   */
  var lambda = -v1[2]/vDir[2];

  return add3( v1, mul3scalar(vDir, lambda));

}

/* returns the camera position in world coordinates based on an inverse 
   view-projection matrix */
function getCameraPosition( inverseTransform)
{
  var p1BottomLeft = transformVec3(inverseTransform, [-1, -1, 0]);
  var p2BottomLeft = transformVec3(inverseTransform, [-1, -1, 1]);
  
  var vBottomLeft = sub3( p2BottomLeft, p1BottomLeft);
  
  var p1BottomRight = transformVec3(inverseTransform, [ 1, -1, 0]);
  var p2BottomRight = transformVec3(inverseTransform, [ 1, -1, 1]);
  var vBottomRight = sub3( p2BottomRight, p1BottomRight);
  
  return getPseudoIntersection(p1BottomLeft, vBottomLeft, 
                               p1BottomRight,vBottomRight);
}

/*
 * 
 * Given two lines, each by a point on the line (p1/p2) and the line's direction
 * (d1/d2), this function returns a point P that is as close as possible to
 * both lines at the same time.
 * This function's intented use is as a robust line intersection algorithm that 
 * works even when the two lines do not quite intersect due to numerical 
 * limitations.
 * Note: the code was taken and modified from 
 *       http://gamedev.stackexchange.com/questions/9738
 */
function getPseudoIntersection(p1, d1, p2, d2)
{
  if (len3(d1) === 0 || len3(d2) === 0) {
    // at least one of the direction vectors has no length and thus no direction
    return;
  }

  d1 = norm3(d1);
  d2 = norm3(d2);

  var a = 1; // was dot3(d1, d1)
  var b = dot3(d1, d2);
  var e = 1; // was dot3(d2, d2)
  
  var d = 1-b*b; // was a*e - b*b
  
  if (d === 0) {
    /* if the lines are parellel  */
    return;
  }
  
  var r = sub3(p1, p2);
  var c = dot3(d1, r);
  var f = dot3(d2, r);
  
  var s = (b*f - c*e) / d;
  var t = (a*f - b*c) / d;
  
  var pClosest1 = add3(p1, mul3scalar(d1, s));
  var pClosest2 = add3(p2, mul3scalar(d2, t));
  var midPoint =  mul3scalar( add3(pClosest1, pClosest2), 0.5);
  
  return midPoint;
}

function inMeters(localDistance) {
  var EARTH_CIRCUMFERENCE = 6371 * 2*3.141592; // [km]
  var earthCircumferenceAtLatitude = EARTH_CIRCUMFERENCE *  Math.cos(MAP.position.latitude/ 180 * Math.PI);
  return earthCircumferenceAtLatitude * localDistance / (TILE_SIZE *Math.pow(2, MAP.zoom));
}

function vec3InMeters(localVec) {
  return [ inMeters(localVec[0]),
           inMeters(localVec[1]),
           inMeters(localVec[2])];
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

function dot2(a,b) { return a[0]*b[0] + a[1]*b[1]; }
function sub2(a,b) { return [a[0]-b[0], a[1]-b[1]]; }
function len2(a)   { return Math.sqrt( a[0]*a[0] + a[1]*a[1]);}
function norm2(a)  { var l = len2(a); return [a[0]/l, a[1]/l];}

function dot3(a,b) { return a[0]*b[0] + a[1]*b[1] + a[2]+b[2];}
function sub3(a,b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];}
function add3(a,b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];}
function mul3scalar(a,f) { return [a[0]*f, a[1]*f, a[2]*f];}
function len3(a)   { return Math.sqrt( a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);}
function squaredLength(a) { return a[0]*a[0] + a[1]*a[1] + a[2]*a[2];}
function norm3(a)  { var l = len3(a); return [a[0]/l, a[1]/l, a[2]/l]; }
function dist3(a,b){ return len3(sub3(a,b));}
