
var Basemap = {};

// TODO: try to use tiles from other zoom levels when some are missing

(function() {

  var shader;

  Basemap.initShader = function() {
    shader = new Shader('basemap');
  };

  Basemap.render = function(mapMatrix) {
    var
      tiles = TileGrid.getTiles(), item,
      backgroundColor = Scene.backgroundColor,
      matrix;

    shader.use();

    gl.clearColor(backgroundColor.r, backgroundColor.g, backgroundColor.b, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var key in tiles) {
      item = tiles[key];

      if (!(matrix = item.getMatrix())) {
        continue;
      }

      matrix = Matrix.multiply(matrix, mapMatrix);

      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, new Float32Array(matrix));

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.texCoordBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aTexCoord, item.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.texture.enable(0);
      gl.uniform1i(shader.uniforms.uTileImage, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, item.vertexBuffer.numItems);
    }

    shader.end();
  };

}());
