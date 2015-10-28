
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
    return undefined;
  }

  d1 = norm3(d1);
  d2 = norm3(d2);

  var a = 1; // was dot3(d1, d1)
  var b = dot3(d1, d2)
  var e = 1; // was dot3(d2, d2)
  
  var d = 1-b*b; // was a*e - b*b
  
  if (d === 0) {
    /* if the lines are parellel  */
    return undefined;
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

function dot3(a,b) { return a[0]*b[0] + a[1]*b[1] + a[2]+b[2];}
function sub3(a,b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];}
function add3(a,b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];}
function mul3scalar(a,f) { return [a[0]*f, a[1]*f, a[2]*f];}
function len3(a)   { return Math.sqrt( a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);}
function squaredLength(a) { return a[0]*a[0] + a[1]*a[1] + a[2]*a[2];}
function norm3(a)  { var l = len3(a); return [a[0]/l, a[1]/l, a[2]/l]; }
function dist3(a,b){ return len3(sub3(a,b));}
