var MAP;

var OSMBuildings = function(options) {
  options = options || {};

  if (options.style) {
    this.setStyle(options.style);
  }

  this.fogColor = options.fogColor ? Color.parse(options.fogColor).toRGBA(true) : FOG_COLOR;
  this.showBackfaces = options.showBackfaces;
};

OSMBuildings.VERSION = '1.0.0';
OSMBuildings.ATTRIBUTION = '© OSM Buildings (http://osmbuildings.org)';

OSMBuildings.prototype = {

  attribution: OSMBuildings.ATTRIBUTION,

  addTo: function(map) {
    MAP = map;
    MAP.addLayer(this);

    glx.setContext(MAP.getContext());

    Interaction.initShader();
    Buildings.initShader({ showBackfaces: this.showBackfaces, fogColor: this.fogColor });

    return this;
  },

  render: function(vpMatrix) {
    var gl = MAP.getContext();

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    Buildings.render(vpMatrix);
  },

  setStyle: function(style) {
    var color = style.color || style.wallColor;
    if (color) {
      DEFAULT_COLOR = Color.parse(color).toRGBA(true);
    }
    return this;
  },

  addOBJ: function(url, position, options) {
    return new mesh.OBJ(url, position, options);
  },

  addGeoJSON: function(url, options) {
    return new mesh.GeoJSON(url, options);
  },

  // TODO: what to return? allow multiple layers?
  addGeoJSONTiles: function(url, options) {
    DataGrid.setSource(url, options.dataKey || DATA_KEY);
  },

  highlight: function(id, color) {
    Buildings.highlightColor = color ? id && Color.parse(color).toRGBA(true) : null;
    Buildings.highlightID = id ? Interaction.idToColor(id) : null;
  },

  getTarget: function(x, y, callback) {
    Interaction.getTargetID(x, y, callback);
  },

  destroy: function() {
    Interaction.destroy();
    Buildings.destroy();
    DataGrid.destroy();
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
