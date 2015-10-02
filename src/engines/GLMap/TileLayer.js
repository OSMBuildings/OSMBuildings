
var TileLayerGL = function(source, options) {
  GLMap.TileLayer.call(this, source, options);

  this.shader = new glx.Shader({
    vertexShader: Shaders.tile.vertex,
    fragmentShader: Shaders.tile.fragment,
    attributes: ["aPosition", "aTexCoord"],
    uniforms: ["uMatrix", "uMMatrix", "uTexIndex", "uFogRadius", "uFogColor"]
  });
};

TileLayerGL.prototype = Object.create(GLMap.TileLayer.prototype);

TileLayerGL.prototype.createTile: function(tileX, tileY, tileZoom) {
  return new Tile(tileX, tileY, tileZoom);
};

TileLayerGL.prototype.render = function() {
  var
    map = this.map,
    fogColor = Renderer.fogColor,
    shader = this.shader,
    tile, mMatrix,
    tileZoom = Math.round(map.zoom),
    ratio = 1 / Math.pow(2, tileZoom - map.zoom),
    mapCenter = map.center;

  shader.enable();

  gl.uniform1f(shader.uniforms.uFogRadius, Renderer.fogRadius);
  gl.uniform3fv(shader.uniforms.uFogColor, [fogColor.r, fogColor.g, fogColor.b]);

  for (var key in this.tiles) {
    tile = this.tiles[key];

    if (!tile.isReady) {
      continue;
    }

    modelMatrix = new glx.Matrix();
    modelMatrix.scale(ratio * 1.005, ratio * 1.005, 1);
    modelMatrix.translate(tile.x * GLMap.TILE_SIZE * ratio - mapCenter.x, tile.y * GLMap.TILE_SIZE * ratio - mapCenter.y, 0);

    gl.uniformMatrix4fv(shader.uniforms.uMMatrix, false, modelMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, Renderer.vpMatrix));

    tile.vertexBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aPosition, tile.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    tile.texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, tile.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    tile.texture.enable(0);
    gl.uniform1i(shader.uniforms.uTexIndex, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, tile.vertexBuffer.numItems);
  }

  shader.disable();
};
