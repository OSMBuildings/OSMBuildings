
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
  
  // neither value is valid
  if ((alphaX <= 0.0 || alphaX > 1.0) && (alphaY <= 0.0 || alphaY > 1.0)) {
    return [undefined, undefined];
  }
    
  if (alphaX <= 0.0 || alphaX > 1.0) { // only alphaY is valid
    return [currentPixel[0], currentPixel[1] + vInc[1]];
  }

  if (alphaY <= 0.0 || alphaY > 1.0) { // only alphaX is valid
    return [currentPixel[0] + vInc[0], currentPixel[1]];
  }
    
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
  return rasterFlatTriangle(p4, p2, p1).concat(rasterFlatTriangle(p4, p2, p3));
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
  
  var leftRasterPos = [other[0] <<0, other[1] <<0];
  var rightRasterPos = leftRasterPos.slice(0);
  points.push(leftRasterPos.slice(0));
  var yDir = other[1] < flat0[1] ? +1 : -1;
  var yStart = leftRasterPos[1];
  var yBeyond= (flat0[1] <<0) + yDir;
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

/* returns a unit-length vector pointing in (not away from!) the
 * direction given by rotationInDeg and tiltInDeg. */
function getDirection(rotationInDeg, tiltInDeg)
{
  var azimuth = rotationInDeg / 180 * Math.PI;
  var inclination= (90 - tiltInDeg) / 180 * Math.PI;
  
  var x = -Math.sin(azimuth) * Math.cos(inclination);
  var y =  Math.cos(azimuth) * Math.cos(inclination);
  var z =                      Math.sin(inclination);
  return [x,y,z];
  
}

function unit(x, y, z) {
  var m = Math.sqrt(x*x + y*y + z*z);

  if (m === 0) {
    m = 0.00001;
  }

  return [x/m, y/m, z/m];
}

/* returns the quadrilateral part of the XY plane that is currently visible on
 * screen. The quad is returned in tile coordinates for tile zoom level
 * 'tileZoomLevel', and thus can directly be used to determine which basemap
 * and geometry tiles need to be loaded.
 * Note: if the horizon is level (as should usually be the case for 
 * OSMBuildings) then said quad is also a trapezoid. */
function getViewQuad(viewProjectionMatrix, maxFarEdgeDistance, viewDirOnMap) {
  /* maximum distance from the map center at which
   * geometry is still visible */
  //console.log("FMED:", MAX_FAR_EDGE_DISTANCE);

  var inverse = glx.Matrix.invert(viewProjectionMatrix);

  var vBottomLeft  = getIntersectionWithXYPlane(-1, -1, inverse);
  var vBottomRight = getIntersectionWithXYPlane( 1, -1, inverse);
  var vTopRight    = getIntersectionWithXYPlane( 1,  1, inverse);
  var vTopLeft     = getIntersectionWithXYPlane(-1,  1, inverse);

  /* If even the lower edge of the screen does not intersect with the map plane,
   * then the map plane is not visible at all.
   * (Or somebody screwed up the projection matrix, putting the view upside-down 
   *  or something. But in any case we won't attempt to create a view rectangle).
   */
  if (!vBottomLeft || !vBottomRight) {
    return;
  }

  var vLeftDir, vRightDir, vLeftPoint, vRightPoint;
  var f;

  /* The lower screen edge shows the map layer, but the upper one does not.
   * This usually happens when the camera is close to parallel to the ground
   * so that the upper screen edge lies above the horizon. This is not a bug
   * and can legitimately happen. But from a theoretical standpoint, this means 
   * that the view 'trapezoid' stretches infinitely toward the horizon. Since this
   * is not a practically useful result - though formally correct - we instead
   * manually bound that area.*/
  if (!vTopLeft || !vTopRight) {
    /* point on the left screen edge with the same y-value as the map center*/
    vLeftPoint = getIntersectionWithXYPlane(-1, -0.9, inverse);
    vLeftDir = norm2(sub2( vLeftPoint, vBottomLeft));
    f = dot2(vLeftDir, viewDirOnMap);
    vTopLeft = add2( vBottomLeft, mul2scalar(vLeftDir, maxFarEdgeDistance/f));
    
    vRightPoint = getIntersectionWithXYPlane( 1, -0.9, inverse);
    vRightDir = norm2(sub2(vRightPoint, vBottomRight));
    f = dot2(vRightDir, viewDirOnMap);
    vTopRight = add2( vBottomRight, mul2scalar(vRightDir, maxFarEdgeDistance/f));
  }

  /* if vTopLeft is further than maxFarEdgeDistance away vertically from the map center,
   * move it closer. */
 if (dot2( viewDirOnMap, vTopLeft) > maxFarEdgeDistance) {
    vLeftDir = norm2(sub2( vTopLeft, vBottomLeft));
    f = dot2(vLeftDir, viewDirOnMap);
    vTopLeft = add2( vBottomLeft, mul2scalar(vLeftDir, maxFarEdgeDistance/f));
 }

 /* dito for vTopRight*/
 if (dot2( viewDirOnMap, vTopRight) > maxFarEdgeDistance) {
    vRightDir = norm2(sub2( vTopRight, vBottomRight));
    f = dot2(vRightDir, viewDirOnMap);
    vTopRight = add2( vBottomRight, mul2scalar(vRightDir, maxFarEdgeDistance/f));
 }
 
  return [vBottomLeft, vBottomRight, vTopRight, vTopLeft];
}


/* Returns an orthographic projection matrix whose view rectangle contains all
 * points of 'points' when watched from the position given by targetViewMatrix.
 * The depth range of the returned matrix is [near, far].
 * The 'points' are given as euclidean coordinates in [m] distance to the 
 * current reference point (MAP.position). 
 */
function getCoveringOrthoProjection(points, targetViewMatrix, near, far, height) {
  var p0 = transformVec3(targetViewMatrix.data, points[0]);
  var left = p0[0];
  var right= p0[0];
  var top  = p0[1];
  var bottom=p0[1];

  for (var i = 0; i < points.length; i++) {
    var p =  transformVec3(targetViewMatrix.data, points[i]);
    left = Math.min( left,  p[0]);
    right= Math.max( right, p[0]);
    top  = Math.max( top,   p[1]);
    bottom=Math.min( bottom,p[1]);
  }
  
  return new glx.Matrix.Ortho(left, right, top, bottom, near, far);
  
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
    return;
  }
  /* ray equation for all world-space points 'p' lying on the screen-space NDC position
   * (screenNdcX, screenNdcY) is:  p = v1 + λ*vDirNorm
   * For the intersection with the xy-plane (-> z=0) holds: v1[2] + λ*vDirNorm[2] = p[2] = 0.0.
   * Rearranged, this reads:   */
  var lambda = -v1[2]/vDir[2];
  var pos = add3( v1, mul3scalar(vDir, lambda));

  return [pos[0], pos[1]];  // z==0 
}

/* Returns: the number of screen pixels that would be covered by the tile 
 *          tileZoom/tileX/tileY *if* the screen would not end at the viewport
 *          edges. The intended use of this method is to return a measure of 
 *          how detailed the tile should be rendered.
 * Note: This method does not clip the tile to the viewport. So the number
 *       returned will be larger than the number of screen pixels covered iff.
 *       the tile intersects with a viewport edge. 
 */
function getTileSizeOnScreen(tileX, tileY, tileZoom, viewProjMatrix) {
  var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * 
                                 Math.cos(MAP.position.latitude / 180 * Math.PI);
  var tileLon = tile2lon(tileX, tileZoom);
  var tileLat = tile2lat(tileY, tileZoom);
  
  var modelMatrix = new glx.Matrix();
  modelMatrix.translate( (tileLon - MAP.position.longitude)* metersPerDegreeLongitude,
                        -(tileLat - MAP.position.latitude) * METERS_PER_DEGREE_LATITUDE, 0);

  var size = getTileSizeInMeters( MAP.position.latitude, tileZoom);
  
  var mvpMatrix = glx.Matrix.multiply(modelMatrix, viewProjMatrix);
  var tl = transformVec3(mvpMatrix, [0   , 0   , 0]);
  var tr = transformVec3(mvpMatrix, [size, 0   , 0]);
  var bl = transformVec3(mvpMatrix, [0   , size, 0]);
  var br = transformVec3(mvpMatrix, [size, size, 0]);
  var verts = [tl, tr, bl, br];
  for (var i in verts) { 
    // transformation from NDC [-1..1] to viewport [0.. width/height] coordinates
    verts[i][0] = (verts[i][0] + 1.0) / 2.0 * MAP.width;
    verts[i][1] = (verts[i][1] + 1.0) / 2.0 * MAP.height;
  }
  
  return getConvexQuadArea( [tl, tr, br, bl]);
}

function getTriangleArea(p1, p2, p3) {
  //triangle edge lengths
  var a = len2(sub2( p1, p2));
  var b = len2(sub2( p1, p3));
  var c = len2(sub2( p2, p3));
  
  //Heron's formula
  var s = 0.5 * (a+b+c);
  return Math.sqrt( s * (s-a) * (s-b) * (s-c));
}

function getConvexQuadArea(quad) {
  return getTriangleArea( quad[0], quad[1], quad[2]) + 
         getTriangleArea( quad[0], quad[2], quad[3]);
  
}

function getTileSizeInMeters( latitude, zoom) {
  return EARTH_CIRCUMFERENCE_IN_METERS * Math.cos(latitude / 180 * Math.PI) / 
         Math.pow(2, zoom);
}

function getTilePositionFromLocal(localXY, zoom) {
  
  var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * 
                                 Math.cos(MAP.position.latitude / 180 * Math.PI);

  var longitude= MAP.position.longitude + localXY[0] / metersPerDegreeLongitude;
  var latitude = MAP.position.latitude -  localXY[1] / METERS_PER_DEGREE_LATITUDE;
  
  return [long2tile(longitude, zoom), lat2tile(latitude, zoom)];
}

//all four were taken from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
function long2tile(lon,zoom) { return (lon+180)/360*Math.pow(2,zoom); }
function lat2tile(lat,zoom)  { return (1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom); }
function tile2lon(x,z) { return (x/Math.pow(2,z)*360-180); }
function tile2lat(y,z) { 
  var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
  return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}

function len2(a)   { return Math.sqrt( a[0]*a[0] + a[1]*a[1]);}
function dot2(a,b) { return a[0]*b[0] + a[1]*b[1];}
function sub2(a,b) { return [a[0]-b[0], a[1]-b[1]];}
function add2(a,b) { return [a[0]+b[0], a[1]+b[1]];}
function mul2scalar(a,f) { return [a[0]*f, a[1]*f];}
function norm2(a)  { var l = len2(a); return [a[0]/l, a[1]/l]; }

function dot3(a,b) { return a[0]*b[0] + a[1]*b[1] + a[2]+b[2];}
function sub3(a,b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];}
function add3(a,b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];}
function mul3scalar(a,f) { return [a[0]*f, a[1]*f, a[2]*f];}
function len3(a)   { return Math.sqrt( a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);}
function squaredLength(a) { return a[0]*a[0] + a[1]*a[1] + a[2]*a[2];}
function norm3(a)  { var l = len3(a); return [a[0]/l, a[1]/l, a[2]/l]; }
function dist3(a,b){ return len3(sub3(a,b));}
