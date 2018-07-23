
function pattern(str, param) {
  return str.replace(/\{(\w+)\}/g, (tag, key) => param[key] || tag);
}

function substituteZCoordinate(points, zValue) {
  return points.map(point => [...point, zValue]);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(value, min));
}
