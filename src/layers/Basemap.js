
var Basemap = {};

// TODO: try to use tiles from other zoom levels when some are missing

(function() {

  var shader;

  // TODO: move this
  function onResize() {
    gl.viewport(0, 0, Map.size.width, Map.size.height);
  }

  Basemap.initShader = function() {
    shader = new Shader('basemap');
    Events.on('resize', onResize);
    onResize();
  };

  Basemap.render = function(mapMatrix) {
    var
      program = shader.use(),
      tiles = TileGrid.getTiles(), item,
      matrix;

    for (var key in tiles) {
      item = tiles[key];

      if (!(matrix = item.getMatrix())) {
        continue;
      }

      matrix = Matrix.multiply(matrix, mapMatrix);

      gl.uniformMatrix4fv(program.uniforms.uMatrix, false, new Float32Array(matrix));

      gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
      gl.vertexAttribPointer(program.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, item.texCoordBuffer);
      gl.vertexAttribPointer(program.attributes.aTexCoord, item.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, item.texture);
      gl.uniform1i(program.uniforms.uTileImage, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, item.vertexBuffer.numItems);
    }

    program.end();
  };

}());
