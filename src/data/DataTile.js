
var DataTile = function(tileX, tileY, zoom, options) {
  this.tileX   = tileX;
  this.tileY   = tileY;
  this.zoom    = zoom;
  this.options = options;
};

DataTile.prototype = {

  load: function(url) {
    this.mesh = new mesh.GeoJSON(url, this.options);
  },

  destroy: function() {
    if (this.mesh) {
      this.mesh.destroy();
      this.mesh = null;
    }
  }
};
