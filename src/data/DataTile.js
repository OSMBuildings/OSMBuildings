
var DataTile = function(tileX, tileY, zoom) {
  this.tileX = tileX;
  this.tileY = tileY;
  this.x = tileX*TILE_SIZE;
  this.y = tileY*TILE_SIZE;
  this.zoom = zoom;

  Data.add(this);
};

(function() {

  DataTile.prototype.load = function(url) {
    this.request = XHR.loadJSON(url, this.onLoad.bind(this));
  };

  DataTile.prototype.onLoad = function(json) {
    this.request = null;
    var geom = GeoJSON.read(this.x, this.y, this.zoom, json);
    this.vertexBuffer = GL.createBuffer(3, new Float32Array(geom.vertices));
    this.normalBuffer = GL.createBuffer(3, new Float32Array(geom.normals));
    this.colorBuffer  = GL.createBuffer(3, new Uint8Array(geom.colors));
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

  DataTile.prototype.render = function(program, projection) {
    if (!this.isReady || !this.isVisible()) {
      return;
    }

    var ratio = 1/Math.pow(2, this.zoom-Map.zoom);
    var viewport = Map.size;
    var origin = Map.origin;

    var matrix = Matrix.create();

    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.65);
    matrix = Matrix.translate(matrix, this.x*ratio - origin.x, this.y*ratio - origin.y, 0);
    matrix = Matrix.rotateZ(matrix, Map.rotation);
    matrix = Matrix.rotateX(matrix, Map.tilt);
    matrix = Matrix.translate(matrix, viewport.width/2, viewport.height/2, 0);
    matrix = Matrix.multiply(matrix, projection);

    gl.uniformMatrix4fv(program.uniforms.uMatrix, false, new Float32Array(matrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(program.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(program.attributes.aNormal, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(program.attributes.aColor, this.colorBuffer.itemSize, gl.UNSIGNED_BYTE, true, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);
  };

  DataTile.prototype.destroy = function() {
    GL.deleteBuffer(this.vertexBuffer);
    GL.deleteBuffer(this.normalBuffer);
    GL.deleteBuffer(this.colorBuffer);

    if (this.request) {
      this.request.abort();
    }
  };

}());
