
basemap.Tile = function(x, y, zoom) {
  this.x = x;
  this.y = y;
  this.zoom = zoom;
};

basemap.Tile.prototype = {
  load: function(url) {
    //Activity.setBusy();
    this.texture = new glx.texture.Image(url, function(image) {
      //Activity.setIdle();
      if (image) {
        this.isReady = true;
      }
    }.bind(this));
  },

  isVisible: function(bounds, buffer) {
    buffer = buffer || 0;
    // TODO: factor in tile origin
    return (this.zoom === bounds.zoom && (this.x >= bounds.minX-buffer && this.x <= bounds.maxX+buffer && this.y >= bounds.minY-buffer && this.y <= bounds.maxY+buffer));
  },

  destroy: function() {
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();
    if (this.texture) {
      this.texture.destroy();
    }
  }
};
