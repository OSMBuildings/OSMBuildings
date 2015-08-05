var gl;

var GL = {};
var WIDTH = 0, HEIGHT = 0;

GL.View = function(container) {
  var canvas = this.canvas = document.createElement('CANVAS');
  canvas.style.position = 'absolute';
  canvas.style.pointerEvents = 'none';

  container.appendChild(canvas);
  this.setSize(container.offsetWidth, container.offsetHeight);

  var options = {
    antialias: true,
    depth: true,
    premultipliedAlpha: false
  };

  try {
    gl = canvas.getContext('webgl', options);
  } catch (ex) {}
  if (!gl) try {
    gl = canvas.getContext('experimental-webgl', options);
  } catch (ex) {}
  if (!gl) {
    throw new Error('WebGL not supported');
  }

  //addListener(this.canvas, 'webglcontextlost', function(e) {
  //  Events.emit('contextlost');
  //});

  //addListener(this.canvas, 'webglcontextrestored', function(e) {
  //  Events.emit('contextrestored');
  //});
};

GL.View.prototype = {

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
