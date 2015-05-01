
var Basemap = {};

// TODO: try to use tiles from other zoom levels when some are missing

(function() {

  var shader, projection;

  function onResize() {
    var size = Map.size;
    gl.viewport(0, 0, size.width, size.height);
    projection = Matrix.perspective(20, size.width, size.height, 40000);
//  projectionOrtho = Matrix.ortho(size.width, size.height, 40000);
  }

  Basemap.initShader = function() {
    shader = new Shader('basemap');
    Events.on('resize', onResize);
    onResize();
  };

  Basemap.render = function() {
    var
      program = shader.use(),
      tiles = TileGrid.getTiles(), tile,
      matrix;

    for (var key in tiles) {
      tile = tiles[key];

      if (!(matrix = tile.getMatrix())) {
        continue;
      }

      // TODO: do this once outside the loop
      matrix = Matrix.rotateZ(matrix, Map.rotation);
      matrix = Matrix.rotateX(matrix, Map.tilt);
      matrix = Matrix.translate(matrix, Map.size.width / 2, Map.size.height / 2, 0);
      matrix = Matrix.multiply(matrix, projection);

      gl.uniformMatrix4fv(program.uniforms.uMatrix, false, new Float32Array(matrix));

      gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
      gl.vertexAttribPointer(program.attributes.aPosition, tile.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, tile.texCoordBuffer);
      gl.vertexAttribPointer(program.attributes.aTexCoord, tile.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tile.texture);
      gl.uniform1i(program.uniforms.uTileImage, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, tile.vertexBuffer.numItems);
    }

    program.end();
  };

}());
