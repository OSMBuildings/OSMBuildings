
var MapTile = function(tileX, tileY, zoom) {
  this.tileX = tileX;
  this.tileY = tileY;
  this.zoom = zoom;

  this.vertexBuffer   = GL.createBuffer(3, new Float32Array([255, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 0]));
  this.texCoordBuffer = GL.createBuffer(2, new Float32Array([1, 1, 1, 0, 0, 1, 0, 0]));
};

MapTile.prototype = {

  load: function(url) {
    var img = this.image = new Image();
    img.crossOrigin = '*';
    img.onload = this.onLoad.bind(this);
    img.src = url;
  },

  onLoad: function() {
    this.texture = GL.createTexture(this.image);
    this.isReady = true;
  },

  getMatrix: function() {
    if (!this.isReady || !this.isVisible()) {
      return;
    }

    var
      ratio = 1 / Math.pow(2, this.zoom - Map.zoom),
      tileSize = TILE_SIZE * ratio,
      origin = Map.origin,
      matrix = Matrix.create();

    matrix = Matrix.scale(matrix, ratio * 1.005, ratio * 1.005, 1);
    matrix = Matrix.translate(matrix, this.tileX * tileSize - origin.x, this.tileY * tileSize - origin.y, 0);

    return matrix;
  },

  isVisible: function(buffer) {
    buffer = buffer || 0;

    var
      gridBounds = TileGrid.bounds,
      tileX = this.tileX,
      tileY = this.tileY;

    return (this.zoom === gridBounds.zoom &&
      // TODO: factor in tile origin
      (tileX >= gridBounds.minX-buffer && tileX <= gridBounds.maxX+buffer && tileY >= gridBounds.minY-buffer && tileY <= gridBounds.maxY+buffer));
  },

  destroy: function() {
    GL.deleteBuffer(this.vertexBuffer);
    GL.deleteBuffer(this.texCoordBuffer);

    this.image.src = '';

    if (this.texture) {
      GL.deleteTexture(this.texture);
    }
  }
};
