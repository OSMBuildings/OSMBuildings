
var Depth = {};

(function() {

  var shader;

  Depth.initShader = function() {
    shader = new glx.Shader(SHADERS.depth);
    return this;
  };

  Depth.render = function(vpMatrix) {
    if (Map.zoom < MIN_ZOOM) {
      return;
    }

    shader.enable();

    GL.clearColor(0, 0, 0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    var item,
      mMatrix, mvp;

    var dataItems = Data.items;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(mMatrix = item.getMatrix())) {
        continue;
      }

      mvp = glx.Matrix.multiply(mMatrix, vpMatrix);
      GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, mvp);

      item.vertexBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, GL.FLOAT, false, 0, 0);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    shader.disable();
  };

}());
