
render.Basemap = {

  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.basemap.vertex,
      fragmentShader: Shaders.basemap.fragment,
      attributes: ["aPosition", "aTexCoord"],
      uniforms: ["uMatrix", "uModelMatrix", "uTexIndex", "uFogRadius", "uFogColor"]
    });
  },

  render: function() {
    var
      fogColor = render.fogColor,
      shader = this.shader,
      tile, modelMatrix,
      tileZoom = Math.round(MAP.zoom),
      ratio = 1 / Math.pow(2, tileZoom - MAP.zoom),
      mapCenter = MAP.center;

    shader.enable();

    gl.uniform1f(shader.uniforms.uFogRadius, render.fogRadius);
    gl.uniform3fv(shader.uniforms.uFogColor, [fogColor.r, fogColor.g, fogColor.b]);

    var tiles = basemap.Grid.tiles;

    for (var key in tiles) {
      tile = tiles[key];

      if (!tile.isReady || !tile.isVisible(basemap.Grid.bounds)) {
        continue;
      }

      modelMatrix = new glx.Matrix();
      modelMatrix.scale(ratio * 1.005, ratio * 1.005, 1);
      modelMatrix.translate(tile.x * BaseMap.TILE_SIZE * ratio - mapCenter.x, tile.y * BaseMap.TILE_SIZE * ratio - mapCenter.y, 0);

      gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

      //gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
      //gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

      tile.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, tile.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      tile.texCoordBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aTexCoord, tile.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

      tile.texture.enable(0);
      gl.uniform1i(shader.uniforms.uTexIndex, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, tile.vertexBuffer.numItems);
    }

    shader.disable();
  },

  destroy: function() {}
};
