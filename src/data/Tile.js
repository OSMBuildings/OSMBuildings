
data.Tile = function(x, y, zoom, options) {
  this.x = x;
  this.y = y;
  this.zoom = zoom;
  this.key = [x, y, zoom].join(',');

  this.options = options;
};

data.Tile.prototype = {
  load: function(url) {
    this.mesh = new mesh.GeoJSON(url, this.options);
  },

  destroy: function() {
    if (this.mesh) {
      this.mesh.destroy();
    }
  }
};
