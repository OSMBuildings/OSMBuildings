
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