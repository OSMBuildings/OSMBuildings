
var OSMBuildings = function(containerId, options) {
  options = options || {};

  var container = document.getElementById(containerId);

  Map.setState(options);
  Events.init(container);
  GL.createContext(container, options);

  this.setDisabled(options.disabled);
  if (options.style) {
    this.setStyle(options.style);
  }

  TileGrid.setSource(options.tileSource);
  DataGrid.setSource(options.dataSource, options.dataKey || DATA_KEY);

//this.addAttribution(OSMBuildings.ATTRIBUTION);
};

OSMBuildings.VERSION = '0.1.5';
OSMBuildings.ATTRIBUTION = '&copy; <a href="http://osmbuildings.org">OSM Buildings</a>';

OSMBuildings.prototype = {

  setStyle: function(style) {
    var color = style.color || style.wallColor;
    if (color) {
      // TODO: move this to Renderer
      DEFAULT_COLOR = Color.parse(color).toRGBA();
    }
    return this;
  },

  addMesh: function(dataOrURL, options) {
    new Mesh(dataOrURL, options);
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
    return Map.bounds;
  },

  setSize: function(size) {
    GL.setSize(size);
    return this;
  },

  getSize: function() {
    return { width:GL.width, height:GL.height };
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

  destroy: function() {
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
  global.OSMBuildings = OSMBuildings;
}
