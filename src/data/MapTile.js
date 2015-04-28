var GL = {};

GL.createTexture = function(img) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D);

  //  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  //  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  //  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

//  img = null;
  return texture;
};

GL.createBuffer = function(itemSize, data) {
  var buffer = gl.createBuffer();
  buffer.itemSize = itemSize;
  buffer.numItems = data.length / itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  data = null;
  return buffer;
};

//*****************************************************************************

function MapTile(grid, tileX, tileY, zoom) {
  this.grid = grid;

  this.tileX = tileX;
  this.tileY = tileY;
  this.zoom = zoom;

  this._vertexBuffer   = GL.createBuffer(3, new Float32Array([255, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 0]));
  this._texCoordBuffer = GL.createBuffer(2, new Float32Array([1, 1, 1, 0, 0, 1, 0, 0]));
}

MapTile.prototype = {

  load: function(url) {
    var img = this._image = new Image();
    img.crossOrigin = '*';
    img.onload = this.onLoad.bind(this);
    img.src = url;
  },

  onLoad: function() {
    this._texture = GL.createTexture(this._image);
    this.isReady = true;
  },

  render: function(program, projection, map) {
    if (!this.isReady || !this.isVisible()) {
      return;
    }

    var ratio = 1 / Math.pow(2, this.zoom - map.getZoom());
    var adaptedTileSize = TILE_SIZE * ratio;
    var size = map.getSize();
    var origin = map.getOrigin();

    var matrix = Matrix.create();

    matrix = Matrix.scale(matrix, ratio * 1.005, ratio * 1.005, 1);
    matrix = Matrix.translate(matrix, this.tileX * adaptedTileSize - origin.x, this.tileY * adaptedTileSize - origin.y, 0);
    matrix = Matrix.rotateZ(matrix, map.getRotation());
    matrix = Matrix.rotateX(matrix, map.getTilt());
    matrix = Matrix.translate(matrix, size.width / 2, size.height / 2, 0);
    matrix = Matrix.multiply(matrix, projection);

    gl.uniformMatrix4fv(program.uniforms.uMatrix, false, new Float32Array(matrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.vertexAttribPointer(program.attributes.aPosition, this._vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer);
    gl.vertexAttribPointer(program.attributes.aTexCoord, this._texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.uniform1i(program.uniforms.uTileImage, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this._vertexBuffer.numItems);
  },

    //var
    //  xyz = key.split(','),
    //  x = parseInt(xyz[0], 10), y = parseInt(xyz[1], 10), z = parseInt(xyz[2], 10);
    //
    //// TODO: do not invalidate all zoom levels immediately
    //if (z !== this._zoom) {
    //  return false;
    //}

  isVisible: function(buffer) {
    buffer = buffer || 0;

    var
      gridBounds = this.grid.bounds,
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
    gl.deleteBuffer(this._vertexBuffer);
    gl.deleteBuffer(this._texCoordBuffer);

    this._image.src = '';

    if (this._texture) {
      gl.deleteTexture(this._texture);
    }
  }
};
