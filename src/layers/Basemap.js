
var Basemap = {};

// TODO: try to use tiles from other zoom levels when some are missing

(function() {

  var shader;

  Basemap.initShader = function() {
    shader = new Shader('textured');
  };

  Basemap.render = function(pMatrix) {
    var
      tiles = TileGrid.getTiles(), item,
      mMatrix;

    shader.enable();

    for (var key in tiles) {
      item = tiles[key];

      if (!(mMatrix = item.getMatrix())) {
        continue;
      }

      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, new Float32Array(Matrix.multiply(mMatrix, pMatrix)));

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.texCoordBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aTexCoord, item.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.texture.enable(0);
      gl.uniform1i(shader.uniforms.uTileImage, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, item.vertexBuffer.numItems);
    }

    shader.disable();
  };

}());
