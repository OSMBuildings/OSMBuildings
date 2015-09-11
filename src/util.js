
function transform(x, y, z) {
  var vpMatrix = new glx.Matrix(glx.Matrix.multiply(Map.transform, Renderer.perspective));

  var scale = 1/Math.pow(2, 16 - Map.zoom);
  var mMatrix = new glx.Matrix()
    .translate(0, 0, z)
    .scale(scale, scale, scale*HEIGHT_SCALE)
    .translate(x, y, 0);

  var mvp = glx.Matrix.multiply(mMatrix, vpMatrix);

  var t = glx.Matrix.transform(mvp);
  return { x: t.x*WIDTH, y: HEIGHT - t.y*HEIGHT, z: t.z }; // takes current cam pos into account.
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
