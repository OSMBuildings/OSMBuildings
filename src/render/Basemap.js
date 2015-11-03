
render.Basemap = {

  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.basemap.vertex,
      fragmentShader: Shaders.basemap.fragment,
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uModelMatrix', 'uViewMatrix', 'uProjMatrix', 'uMatrix', 'uTexIndex', 'uFogRadius', 'uFogColor', 'uBendRadius', 'uBendDistance']
    });
  },

  render: function() {
    var layer = APP._basemapGrid;

    if (!layer) {
      return;
    }

    if (MAP.zoom < layer.minZoom || MAP.zoom > layer.maxZoom) {
      return;
    }

    var
      shader = this.shader,
      tile,
      zoom = Math.round(MAP.zoom);

    shader.enable();

    gl.uniform1f(shader.uniforms.uFogRadius, render.fogRadius);
    gl.uniform3fv(shader.uniforms.uFogColor, render.fogColor);

    gl.uniform1f(shader.uniforms.uBendRadius, render.bendRadius);
    gl.uniform1f(shader.uniforms.uBendDistance, render.bendDistance);

    for (var key in layer.visibleTiles) {
      tile = layer.tiles[key];

      if (tile && tile.isReady) {
        this.renderTile(tile, shader);
        continue;
      }

      var parent = [tile.x/2<<0, tile.y/2<<0, zoom-1].join(',');
      if (layer.tiles[parent] && layer.tiles[parent].isReady) {
        // TODO: there will be overlap with adjacent tiles or parents of adjacent tiles!
        this.renderTile(layer.tiles[ parent ], shader);
        continue;
      }

      var children = [
        [tile.x*2,   tile.y*2,   tile.zoom+1].join(','),
        [tile.x*2+1, tile.y*2,   tile.zoom+1].join(','),
        [tile.x*2,   tile.y*2+1, tile.zoom+1].join(','),
        [tile.x*2+1, tile.y*2+1, tile.zoom+1].join(',')
      ];

      for (var i = 0; i < 4; i++) {
        if (layer.tiles[ children[i] ] && layer.tiles[ children[i] ].isReady) {
          this.renderTile(layer.tiles[ children[i] ], shader);
        }
      }
    }

    shader.disable();
  },

  renderTile: function(tile, shader) {
    var mapCenter = MAP.center;
    var ratio = 1/Math.pow(2, tile.zoom - MAP.zoom);

    var modelMatrix = new glx.Matrix();
    modelMatrix.scale(ratio, ratio, 1);
    modelMatrix.translate(tile.x*TILE_SIZE*ratio - mapCenter.x, tile.y*TILE_SIZE*ratio - mapCenter.y, 0);

    gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, render.viewMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, render.projMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

    tile.vertexBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aPosition, tile.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    tile.texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, tile.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.uniform1i(shader.uniforms.uTexIndex, 0);

    tile.texture.enable(0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, tile.vertexBuffer.numItems);
  },

  destroy: function() {}
};
