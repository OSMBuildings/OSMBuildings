
var OSMBuildings = function(containerId, options) {
  options = options || {};

  var container = document.getElementById(containerId);

  Map.setState(options);
  Events.init(container);
  this._initRenderer(container);

  this.setDisabled(options.disabled);
  if (options.style) {
    this.setStyle(options.style);
  }

  TileGrid.setSource(options.tileSource);
  DataGrid.setSource(options.dataSource, options.dataKey || DATA_KEY);

  Basemap.initShader();
  Buildings.initShader();

//this.addAttribution(OSMBuildings.ATTRIBUTION);
};

OSMBuildings.VERSION = '0.1.5';
OSMBuildings.ATTRIBUTION = '&copy; <a href="http://osmbuildings.org">OSM Buildings</a>';

OSMBuildings.prototype = {

  setStyle: function(style) {
    var color = style.color || style.wallColor;
    if (color) {
      DEFAULT_COLOR = Color.parse(color).toRGBA();
    }
    return this;
  },

  addMesh: function(url, position) {
    var mesh = new Mesh(url, position);
    if (typeof url === 'string') {
      mesh.load(url);
    }
    return this;
  },

  on: function(type, fn) {
    Events.on(type, fn);
    return this;
  },

  off: function(type, fn) {
    Events.off(type, fn);
    return this;
  },

  setDisabled: function(flag) {
    Events.setDisabled(flag);
    return this;
  },

  isDisabled: function() {
    return Events.isDisabled();
  },

  setZoom: function(zoom) {
    Map.setZoom(zoom);
    return this;
  },

  getZoom: function() {
    return Map.zoom;
  },

  setCenter: function(center) {
    Map.setCenter(center);
    return this;
  },

  getCenter: function() {
    return Map.center;
  },

  getBounds: function() {
    return Map.bounds();
  },

  setSize: function(size) {
    Map.setSize(size);
    return this;
  },

  getSize: function() {
    return Map.size;
  },

  getOrigin: function() {
    return Map.origin;
  },

  setRotation: function(rotation) {
    Map.setRotation(rotation);
    return this;
  },

  getRotation: function() {
    return Map.rotation;
  },

  setTilt: function(tilt) {
    Map.setTilt(tilt);
    return this;
  },

  getTilt: function() {
    return Map.tilt;
  },

  _initRenderer: function(container) {
    var canvas = document.createElement('CANVAS');
    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';

    container.appendChild(canvas);

    // TODO: handle context loss
    try {
      gl = canvas.getContext('experimental-webgl', {
        antialias: true,
        depth: true,
        premultipliedAlpha: false
      });
    } catch (ex) {
      throw ex;
    }

    addListener(canvas, 'webglcontextlost', function(e) {
      cancelEvent(e);
      clearInterval(this._loop);
    }.bind(this));

//    addListener(canvas, 'webglcontextrestored', INIT GL);

    this.setSize({ width: container.offsetWidth, height: container.offsetHeight });

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    this._loop = setInterval(this._render.bind(this), 17);
  },

  _render: function() {
    requestAnimationFrame(function() {
      gl.clearColor(0.75, 0.75, 0.75, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      Basemap.render();
      Buildings.render();
    }.bind(this));
  },

  destroy: function() {
    var canvas = gl.canvas;
    canvas.parentNode.removeChild(canvas);
    gl = null;

    // TODO: stop render loop
    //  clearInterval(...);

    TileGrid.destroy();
    DataGrid.destroy();
  }
};

//*****************************************************************************

if (typeof define === 'function') {
  define([], OSMBuildings);
} else if (typeof exports === 'object') {
  module.exports = OSMBuildings;
} else {
  window.OSMBuildings = OSMBuildings;
}
