
data.Tile = function(x, y, zoom, options) {
  this.x = x;
  this.y = y;
  this.zoom = zoom;
  this.options = options;
};

data.Tile.prototype = {

  load: function(url) {
    this.mesh = new mesh.GeoJSON(url, this.options);
  },

  isVisible: function(bounds) {
    // TODO: factor in tile origin
    return (this.zoom === bounds.zoom && (this.x >= bounds.minX && this.x <= bounds.maxX && this.y >= bounds.minY && this.y <= bounds.maxY));
  },

  destroy: function() {
    if (this.mesh) {
      this.mesh.destroy();
      this.mesh = null;
    }
  }
};
