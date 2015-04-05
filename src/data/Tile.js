
var Tile = function(tileX, tileY, zoom) {
  this.x = tileX*TILE_SIZE;
  this.y = tileY*TILE_SIZE;
  this.zoom = zoom;
};

(function() {

  function createBuffer(itemSize, data) {
    var buffer = gl.createBuffer();
    buffer.itemSize = itemSize;
    buffer.numItems = data.length/itemSize;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }

  //***************************************************************************

  Tile.prototype.load = function(url) {
    this.isLoading = XHR.loadJSON(url, this.setData.bind(this));
  };

  Tile.prototype.setData = function(json) {
    this.isLoading = null;
    var geom = GeoJSON.read(this.x, this.y, this.zoom, json);
    this.vertexBuffer = createBuffer(3, new Float32Array(geom.vertices));
    this.normalBuffer = createBuffer(3, new Float32Array(geom.normals));
    this.colorBuffer  = createBuffer(3, new Uint8Array(geom.colors));
    geom = null; json = null;
  };

  Tile.prototype.isVisible = function(buffer) {
    buffer = buffer || 0;
    var
      gridBounds = Grid.bounds,
      tileX = this.x/TILE_SIZE,
      tileY = this.y/TILE_SIZE;

    return (this.zoom === gridBounds.zoom &&
      (tileX >= gridBounds.minX-buffer && tileX <= gridBounds.maxX+buffer && tileY >= gridBounds.minY-buffer && tileY <= gridBounds.maxY+buffer));
  };

  Tile.prototype.render = function(program, projection) {
    if (this.isLoading || !this.isVisible()) {
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

  Tile.prototype.destroy = function() {
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.normalBuffer);
    gl.deleteBuffer(this.colorBuffer);

    if (this.isLoading) {
      this.isLoading.abort();
    }
  };

}());
