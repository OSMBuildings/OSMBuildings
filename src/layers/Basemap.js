
var Basemap = {};

// TODO: try to use tiles from other zoom levels when some are missing

(function() {

  var shader;

  Basemap.initShader = function() {
    shader = new glx.Shader({
      vertexShader: SHADERS.basemap.vertex,
      fragmentShader: SHADERS.basemap.fragment,
      attributes: ["aPosition", "aTexCoord"],
      uniforms: ["uMatrix", "uTileImage", "uFogMatrix", "uFogRadius", "uFogColor"]
    });

    return this;
  };

  Basemap.render = function(vpMatrix) {
    var
      tiles = TileGrid.getTiles(), item,
      mMatrix, mvp;

    shader.enable();

    GL.uniformMatrix4fv(shader.uniforms.uFogMatrix, false, vpMatrix.data);

    var pixelsAtZoom = TILE_SIZE * Math.pow(2, Map.zoom);
    var scale = pixelsAtZoom / EARTH_CIRCUMFERENCE;
    GL.uniform1f(shader.uniforms.uFogRadius, SkyDome.radius);
    GL.uniform3fv(shader.uniforms.uFogColor, [Renderer.fogColor.r, Renderer.fogColor.g, Renderer.fogColor.b]);

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
