
var Basemap = {};

// TODO: try to use tiles from other zoom levels when some are missing

(function() {

  var shader;

  Basemap.initShader = function() {
    shader = new glx.Shader({
      vertexShader: SHADERS.basemap.vertex,
      fragmentShader: SHADERS.basemap.fragment,
      attributes: ["aPosition", "aTexCoord"],
      uniforms: ["uMatrix", "uTileImage", "uFogMatrix", "uFogNear", "uFogFar", "uFogColor"]
    });

    return this;
  };

  Basemap.render = function(vpMatrix) {
    var
      tiles = TileGrid.getTiles(), item,
      mMatrix, mvp;

    shader.enable();

    var mFogMatrix = new glx.Matrix();
    // TODO: move this to Map
    var inMeters = TILE_SIZE / (Math.cos(Map.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);
    var fogScale = Math.pow(2, 16) * inMeters;
    mFogMatrix.scale(fogScale, fogScale, fogScale);

    var mvpFog = glx.Matrix.multiply(mFogMatrix, vpMatrix);
    GL.uniformMatrix4fv(shader.uniforms.uFogMatrix, false, mvpFog);
    GL.uniform1f(shader.uniforms.uFogNear, FOG_RADIUS-1000);
    GL.uniform1f(shader.uniforms.uFogFar, FOG_RADIUS);
    GL.uniform3fv(shader.uniforms.uFogColor, [Renderer.backgroundColor.r, Renderer.backgroundColor.g, Renderer.backgroundColor.b]);

    for (var key in tiles) {
      item = tiles[key];

      if (!(mMatrix = item.getMatrix())) {
        continue;
      }

      mvp = glx.Matrix.multiply(mMatrix, vpMatrix);
      GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, mvp);

      item.vertexBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, GL.FLOAT, false, 0, 0);

      item.texCoordBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aTexCoord, item.texCoordBuffer.itemSize, GL.FLOAT, false, 0, 0);

      item.texture.enable(0);
      GL.uniform1i(shader.uniforms.uTileImage, 0);

      GL.drawArrays(GL.TRIANGLE_STRIP, 0, item.vertexBuffer.numItems);
    }

    shader.disable();
  };

}());
