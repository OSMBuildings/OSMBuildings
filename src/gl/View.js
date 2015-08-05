
var GL;
var WIDTH = 0, HEIGHT = 0;

gl.View = function(container) {
  var canvas = this.canvas = document.createElement('CANVAS');
  canvas.style.position = 'absolute';
  canvas.style.pointerEvents = 'none';

  container.appendChild(canvas);
  this.setSize(container.offsetWidth, container.offsetHeight);

  Events.on('resize', function() {
    this.setSize(container.offsetWidth, container.offsetHeight);
  }.bind(this));

  var options = {
    antialias: true,
    depth: true,
    premultipliedAlpha: false
  };

  try {
    GL = canvas.getContext('webgl', options);
  } catch (ex) {}
  if (!GL) try {
    GL = canvas.getContext('experimental-webgl', options);
  } catch (ex) {}
  if (!GL) {
    throw new Error('WebGL not supported');
  }

  //addListener(this.canvas, 'webglcontextlost', function(e) {
  //  Events.emit('contextlost');
  //});

  //addListener(this.canvas, 'webglcontextrestored', function(e) {
  //  Events.emit('contextrestored');
  //});
};

gl.View.prototype = {

  setSize: function(width, height) {
    if (width !== WIDTH || height !== HEIGHT) {
      this.canvas.width  = WIDTH  = width;
      this.canvas.height = HEIGHT = height;
      Events.emit('resize');
    }
  },

  destroy: function() {
    this.canvas.parentNode.removeChild(this.canvas);
    this.canvas = null;
  }
};
