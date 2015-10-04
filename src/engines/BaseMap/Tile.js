
var Tile = function(layer, x, y, zoom) {
  this.layer = layer;
  this.x = x;
  this.y = y;
  this.zoom = zoom;
};

Tile.prototype = {
  load: function(url) {
    //Activity.setBusy();
    this.texture = new glx.texture.Image(url, function(image) {
      //Activity.setIdle();
      if (image) {
        this.isReady = true;
      }
    }.bind(this));
  },

  destroy: function() {
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();
    if (this.texture) {
      this.texture.destroy();
    }
  }
};
