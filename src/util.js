
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

function getFramebufferConfig(width, height, maxTexSize) {
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
}

