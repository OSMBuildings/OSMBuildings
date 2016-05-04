
data.TerrainTile = function(x, y, zoom, options) {
  this.x = x;
  this.y = y;
  this.zoom = zoom;
  this.key = [x, y, zoom].join(',');

  this.options = options;
};

data.TerrainTile.prototype = {
  load: function(url) {
    this.mesh = new mesh.Terrain(url, this.options);
  },

  destroy: function() {
    if (this.mesh) {
      this.mesh.destroy();
    }
  }
};
