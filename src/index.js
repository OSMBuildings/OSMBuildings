var MAP, glx, gl;
var MIN_ZOOM, MAX_ZOOM;

var OSMBuildings = function(options) {
  options = options || {};

  if (options.style) {
    this.setStyle(options.style);
  }

  render.fogColor = options.fogColor ? Color.parse(options.fogColor).toRGBA(true) : FOG_COLOR;
  render.Buildings.showBackfaces = options.showBackfaces;

  this.attribution = options.attribution || OSMBuildings.ATTRIBUTION;

  MIN_ZOOM = parseFloat(options.minZoom) || 15;
  MAX_ZOOM = parseFloat(options.maxZoom) || 22;
  if (MAX_ZOOM < MIN_ZOOM) {
    MAX_ZOOM = MIN_ZOOM;
  }
};

OSMBuildings.VERSION = '1.0.1';
OSMBuildings.ATTRIBUTION = '© OSM Buildings <a href="http://osmbuildings.org">http://osmbuildings.org</a>';

OSMBuildings.prototype = {

  addTo: function(map) {
    MAP = map;
    glx = new GLX(MAP.container, MAP.width, MAP.height);
    gl = glx.context;

    MAP.addLayer(this);

    render.start();

    return this;
  },

  remove: function() {
    render.stop();
    MAP.removeLayer(this);
    MAP = null;
  },

  render: function() {},

  setStyle: function(style) {
    var color = style.color || style.wallColor;
    if (color) {
      DEFAULT_COLOR = Color.parse(color).toRGBA(true);
    }
    return this;
  },

  transform: function(latitude, longitude, elevation) {
    var
      pos = MAP.project(latitude, longitude, TILE_SIZE*Math.pow(2, MAP.zoom)),
      x = pos.x-MAP.center.x,
      y = pos.y-MAP.center.y;

    var scale = 1/Math.pow(2, 16 - MAP.zoom);
    var modelMatrix = new glx.Matrix()
      .translate(0, 0, elevation)
      .scale(scale, scale, scale*HEIGHT_SCALE)
      .translate(x, y, 0);

    var mvp = glx.Matrix.multiply(modelMatrix, render.viewProjMatrix);
    var t = glx.Matrix.transform(mvp);
    return { x: t.x*MAP.width, y: MAP.height - t.y*MAP.height, z: t.z }; // takes current cam pos into account.
  },

  addOBJ: function(url, position, options) {
    return new mesh.OBJ(url, position, options);
  },

  addGeoJSON: function(url, options) {
    return new mesh.GeoJSON(url, options);
  },

  addGeoJSONTiles: function(url, options) {
    return (this.dataTiles = new data.Grid(url, options));
  },

  addMapTiles: function(url, options) {
    return (this.basemap = new basemap.Grid(url, options));
  },

  highlight: function(id, color) {
    render.Buildings.highlightColor = color ? id && Color.parse(color).toRGBA(true) : null;
    render.Buildings.highlightID = id ? render.Interaction.idToColor(id) : null;
  },

  getTarget: function(x, y) {
    return render.Interaction.getTarget(x, y);
  },

  destroy: function() {
    render.destroy();
    this.dataTiles.destroy();
    if (this.basemap) {
      this.basemap.destroy();
    }
  }
};

//*****************************************************************************

if (typeof global.define === 'function') {
  global.define([], OSMBuildings);
} else if (typeof global.exports === 'object') {
  global.module.exports = OSMBuildings;
} else {
  global.OSMBuildings = OSMBuildings;
}
