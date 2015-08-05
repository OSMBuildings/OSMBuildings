
var MapTile = function(tileX, tileY, zoom) {
  this.tileX = tileX;
  this.tileY = tileY;
  this.zoom = zoom;

  this.vertexBuffer   = new gl.Buffer(3, new Float32Array([255, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 0]));
  this.texCoordBuffer = new gl.Buffer(2, new Float32Array([1, 1, 1, 0, 0, 1, 0, 0]));
  this.texture = new gl.Texture();
};

MapTile.prototype = {

  load: function(url) {
    this.texture.load(url);
  },

  getMatrix: function() {
    if (!this.texture.isLoaded) {
      return;
    }

    var mMatrix = new Matrix();

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
    this.texture.destroy();
  }
};
