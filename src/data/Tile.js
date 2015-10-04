
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

  isVisible: function(bounds, buffer) {
    buffer = buffer || 0;
    // TODO: factor in tile origin
    return (this.zoom === bounds.zoom && (this.x >= bounds.minX-buffer && this.x <= bounds.maxX+buffer && this.y >= bounds.minY-buffer && this.y <= bounds.maxY+buffer));
  },

  destroy: function() {
    if (this.mesh) {
      this.mesh.destroy();
      this.mesh = null;
    }
  }
};
