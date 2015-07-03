
var Depth = {};

(function() {

  var shader;

  Depth.initShader = function() {
    shader = new Shader('depth');
  };

  Depth.render = function(pMatrix) {
    shader.enable();

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var item, mMatrix;

    //*** Basemap ***

    //var tiles = TileGrid.getTiles();
    //
    //for (var key in tiles) {
    //  item = tiles[key];
    //
    //  if (!(mMatrix = item.getMatrix())) {
    //    continue;
    //  }
    //
    //  gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, new Float32Array(Matrix.multiply(mMatrix, pMatrix)));
    //
    //  item.vertexBuffer.enable();
    //  gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    // item.visibilityBuffer.enable();
    // gl.vertexAttribPointer(shader.attributes.aHidden, item.visibilityBuffer.itemSize, gl.FLOAT, false, 0, 0);
    //  gl.drawArrays(gl.TRIANGLE_STRIP, 0, item.vertexBuffer.numItems);
    //}

    //*** Buildings ***

    //if (Map.zoom < MIN_ZOOM) {
    //  return;
    //}

    var dataItems = Data.items;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(mMatrix = item.getMatrix())) {
        continue;
      }

      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, new Float32Array(Matrix.multiply(mMatrix, pMatrix)));

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    shader.disable();
  };

}());
