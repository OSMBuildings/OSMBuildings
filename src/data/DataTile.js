
var DataTile = function(tileX, tileY, zoom) {
  this.tileX = tileX;
  this.tileY = tileY;
  this.zoom = zoom;

  Data.add(this);
};

(function() {

  DataTile.prototype.load = function(url) {
    this.request = XHR.loadJSON(url, this.onLoad.bind(this));
  };

  DataTile.prototype.onLoad = function(json) {
    this.request = null;
    var geom = GeoJSON.read(this.tileX * TILE_SIZE, this.tileY * TILE_SIZE, this.zoom, json);
    this.vertexBuffer  = GL.createBuffer(3, new Float32Array(geom.vertices));
    this.normalBuffer  = GL.createBuffer(3, new Float32Array(geom.normals));
    this.colorBuffer   = GL.createBuffer(3, new Uint8Array(geom.colors));
    this.idColorBuffer = GL.createBuffer(3, new Uint8Array(geom.idColors));
    geom = null; json = null;
    this.isReady = true;
  };

  DataTile.prototype.isVisible = function(buffer) {
    buffer = buffer || 0;
    var
      gridBounds = DataGrid.bounds,
      tileX = this.tileX,
      tileY = this.tileY;

    return (this.zoom === gridBounds.zoom &&
      // TODO: factor in tile origin
      (tileX >= gridBounds.minX-buffer && tileX <= gridBounds.maxX+buffer && tileY >= gridBounds.minY-buffer && tileY <= gridBounds.maxY+buffer));
  };

  DataTile.prototype.getMatrix = function() {
    if (!this.isReady || !this.isVisible()) {
      return;
    }

    var
      ratio = 1 / Math.pow(2, this.zoom - Map.zoom),
      origin = Map.origin,
      matrix = Matrix.create();

    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.65);
    matrix = Matrix.translate(matrix, this.tileX * TILE_SIZE * ratio - origin.x, this.tileY * TILE_SIZE * ratio - origin.y, 0);
    return matrix;
  };

  DataTile.prototype.destroy = function() {
    GL.deleteBuffer(this.vertexBuffer);
    GL.deleteBuffer(this.normalBuffer);
    GL.deleteBuffer(this.colorBuffer);
    GL.deleteBuffer(this.idColorBuffer);

    if (this.request) {
      this.request.abort();
      this.request = null;
    }

    Data.remove(this);
  };

}());
