
function MapTile(tileX, tileY, zoom) {
  this.tileX = tileX;
  this.tileY = tileY;
  this.zoom = zoom;

  this.vertexBuffer   = GL.createBuffer(3, new Float32Array([255, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 0]));
  this.texCoordBuffer = GL.createBuffer(2, new Float32Array([1, 1, 1, 0, 0, 1, 0, 0]));
}

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

  render: function(program, projection) {
    if (!this.isReady || !this.isVisible()) {
      return;
    }

    var ratio = 1 / Math.pow(2, this.zoom - Map.zoom);
    var adaptedTileSize = TILE_SIZE * ratio;
    var size = Map.size;
    var origin = Map.origin;

    var matrix = Matrix.create();

    matrix = Matrix.scale(matrix, ratio * 1.005, ratio * 1.005, 1);
    matrix = Matrix.translate(matrix, this.tileX * adaptedTileSize - origin.x, this.tileY * adaptedTileSize - origin.y, 0);
    matrix = Matrix.rotateZ(matrix, Map.rotation);
    matrix = Matrix.rotateX(matrix, Map.tilt);
    matrix = Matrix.translate(matrix, size.width / 2, size.height / 2, 0);
    matrix = Matrix.multiply(matrix, projection);

    gl.uniformMatrix4fv(program.uniforms.uMatrix, false, new Float32Array(matrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(program.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(program.attributes.aTexCoord, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(program.uniforms.uTileImage, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems);
  },

    //var
    //  xyz = key.split(','),
    //  x = parseInt(xyz[0], 10), y = parseInt(xyz[1], 10), z = parseInt(xyz[2], 10);
    //
    //// TODO: do not invalidate all zoom levels immediately
    //if (z !== this.zoom) {
    //  return false;
    //}

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

  getMatrix: function() {
  //  var ratio = 1/Math.pow(2, this.zoom-Map.zoom);
  //  var origin = Map.origin;
  //  var matrix = Matrix.create();
  //  matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.65);
  //  matrix = Matrix.translate(matrix, this.x*ratio - origin.x, this.y*ratio - origin.y, 0);
  //  return matrix;
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
