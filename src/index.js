var GL;
var WIDTH = 0, HEIGHT = 0;

var OSMBuildingsGL = function(containerId, options) {
  options = options || {};

  var container = document.getElementById(containerId);
  container.classList.add('osmb-container');

  WIDTH = container.offsetWidth;
  HEIGHT = container.offsetHeight;
  GL = new glx.View(container, WIDTH, HEIGHT);

  Renderer.start({
    fogRadius: options.fogRadius,
    fogColor: options.fogColor,
    showBackfaces: options.showBackfaces
  });

  Interaction.initShader();

  Map.init(options);
  Events.init(container);

  this.setDisabled(options.disabled);
  if (options.style) {
    this.setStyle(options.style);
  }

  TileGrid.setSource(options.tileSource);
  DataGrid.setSource(options.dataSource, options.dataKey || DATA_KEY);

  if (options.attribution !== null && options.attribution !== false && options.attribution !== '') {
    var attribution = document.createElement('DIV');
    attribution.className = 'osmb-attribution';
    attribution.innerHTML = options.attribution || OSMBuildingsGL.ATTRIBUTION;
    container.appendChild(attribution);
  }
};

OSMBuildingsGL.VERSION = '0.1.8';
OSMBuildingsGL.ATTRIBUTION = '© OSM Buildings (http://osmbuildings.org)';
OSMBuildingsGL.ATTRIBUTION_HTML = '&copy; <a href="http://osmbuildings.org">OSM Buildings</a>';

OSMBuildingsGL.prototype = {

  setStyle: function(style) {
    var color = style.color || style.wallColor;
    if (color) {
      // TODO: move this to Renderer
      DEFAULT_COLOR = Color.parse(color).toRGBA(true);
    }
    return this;
  },

  addOBJ: function(url, position, options) {
    return new OSMBuildingsGL.mesh.OBJ(url, position, options);
  },

  addGeoJSON: function(url, options) {
    return new OSMBuildingsGL.mesh.GeoJSON(url, options);
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

  setPosition: function(position) {
    Map.setPosition(position);
    return this;
  },

  getPosition: function() {
    return Map.position;
  },

  getBounds: function() {
    var mapBounds = Map.bounds;
    var worldSize = TILE_SIZE*Math.pow(2, Map.zoom);
    var nw = unproject(mapBounds.minX, mapBounds.maxY, worldSize);
    var se = unproject(mapBounds.maxX, mapBounds.minY, worldSize);
    return {
      n: nw.latitude,
      w: nw.longitude,
      s: se.latitude,
      e: se.longitude
    };
  },

  setSize: function(size) {
    if (size.width !== WIDTH || size.height !== HEIGHT) {
      GL.canvas.width = WIDTH = size.width;
      GL.canvas.height = HEIGHT = size.height;
      Events.emit('resize');
    }
    return this;
  },

  getSize: function() {
    return { width: WIDTH, height: HEIGHT };
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

  transform: function(latitude, longitude, elevation) {
    var pos = project(latitude, longitude, TILE_SIZE*Math.pow(2, Map.zoom));
    var mapCenter = Map.center;

    var vpMatrix = new glx.Matrix(glx.Matrix.multiply(Map.transform, Renderer.perspective));

    var scale = 1/Math.pow(2, 16 - Map.zoom); // scales to tile data size, not perfectly clear yet
    var mMatrix = new glx.Matrix()
      .translate(0, 0, elevation)
      .scale(scale, scale, scale*0.7)
      .translate(pos.x - mapCenter.x, pos.y - mapCenter.y, 0);

    var mvp = glx.Matrix.multiply(mMatrix, vpMatrix);

    var t = glx.Matrix.transform(mvp);
    return { x: t.x*WIDTH, y: HEIGHT - t.y*HEIGHT };
  },

  highlight: function(id, color) {
    Buildings.highlightColor = color ? Color.parse(color).toRGBA(true) : null;
    Buildings.highlightID = Interaction.idToColor(id);
  },

  destroy: function() {
    glx.destroy(GL);
    Renderer.destroy();
    TileGrid.destroy();
    DataGrid.destroy();
  }
};

//*****************************************************************************

if (typeof global.define === 'function') {
  global.define([], OSMBuildingsGL);
} else if (typeof global.exports === 'object') {
  global.module.exports = OSMBuildingsGL;
} else {
  global.OSMBuildingsGL = OSMBuildingsGL;
}
