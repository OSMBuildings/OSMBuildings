
var MapTile = function(tileX, tileY, zoom) {
  this.tileX = tileX;
  this.tileY = tileY;
  this.zoom = zoom;

  this.vertexBuffer = new glx.Buffer(3, new Float32Array([
    255, 255, 0,
    255,   0, 0,
    0,   255, 0,
    0,     0, 0
  ]));
  this.texCoordBuffer = new glx.Buffer(2, new Float32Array([
    1, 1,
    1, 0,
    0, 1,
    0, 0
  ]));
};

MapTile.prototype = {

  load: function(url) {
    this.url = url;
    setBusy(url);
    this.texture = new glx.texture.Image(url, function(image) {
      setIdle(url);
      if (image) {
        this.isLoaded = true;
      }
    }.bind(this));
  },

  getMatrix: function() {
    if (!this.isLoaded) {
      return;
    }

    var mMatrix = new glx.Matrix();

    var
      ratio = 1 / Math.pow(2, this.zoom - Map.zoom),
      mapCenter = Map.center;

    mMatrix.scale(ratio * 1.005, ratio * 1.005, 1);
    mMatrix.translate(this.tileX * TILE_SIZE * ratio - mapCenter.x, this.tileY * TILE_SIZE * ratio - mapCenter.y, 0);

    return mMatrix;
  },

  destroy: function() {
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();
    if (this.texture) {
    this.texture.destroy();
    }
    setIdle(this.url);
  }
};
