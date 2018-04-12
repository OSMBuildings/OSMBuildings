
render.Basemap = {

  init: function() {
    this.shader = new GLX.Shader({
      vertexShader: Shaders.basemap.vertex,
      fragmentShader: Shaders.basemap.fragment,
      shaderName: 'basemap shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uModelMatrix', 'uMatrix', 'uTexIndex', 'uFogDistance', 'uFogBlurDistance', 'uLowerEdgePoint', 'uViewDirOnMap']
    });
  },

  render: function() {
    const layer = APP.basemapGrid;

    if (!layer) {
      return;
    }

    if (APP.zoom < layer.minZoom || APP.zoom > layer.maxZoom) {
      return;
    }

    const shader = this.shader;

    shader.enable();

    shader.setAllUniforms([
      ['uFogDistance',     '1f',  render.fogDistance],
      ['uFogBlurDistance', '1f',  render.fogBlurDistance],
      ['uViewDirOnMap',    '2fv', render.viewDirOnMap],
      ['uLowerEdgePoint',  '2fv', render.lowerLeftOnMap]
    ]);

    const zoom = Math.round(APP.zoom);

    let tile;
    for (let key in layer.visibleTiles) {
      tile = layer.tiles[key];

      if (tile && tile.isReady) {
        this.renderTile(tile, shader);
        continue;
      }

      const parentKey = [tile.x/2<<0, tile.y/2<<0, zoom-1].join(',');
      if (layer.tiles[parentKey] && layer.tiles[parentKey].isReady) {
        // TODO: there will be overlap with adjacent tiles or parents of adjacent tiles!
        this.renderTile(layer.tiles[parentKey], shader);
        continue;
      }

      const children = [
        [tile.x*2,   tile.y*2,   tile.zoom+1].join(','),
        [tile.x*2+1, tile.y*2,   tile.zoom+1].join(','),
        [tile.x*2,   tile.y*2+1, tile.zoom+1].join(','),
        [tile.x*2+1, tile.y*2+1, tile.zoom+1].join(',')
      ];

      for (let i = 0; i < 4; i++) {
        if (layer.tiles[ children[i] ] && layer.tiles[ children[i] ].isReady) {
          this.renderTile(layer.tiles[ children[i] ], shader);
        }
      }
    }

    shader.disable();
  },

  renderTile: function(tile, shader) {
    var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);

    var modelMatrix = new GLX.Matrix();
    modelMatrix.translate( (tile.longitude- APP.position.longitude)* metersPerDegreeLongitude,
                          -(tile.latitude - APP.position.latitude) * METERS_PER_DEGREE_LATITUDE, 0);

    GL.enable(GL.POLYGON_OFFSET_FILL);
    GL.polygonOffset(MAX_USED_ZOOM_LEVEL - tile.zoom,
                     MAX_USED_ZOOM_LEVEL - tile.zoom);
                     
    shader.setAllUniforms([
      ['uViewDirOnMap', '2fv',   render.viewDirOnMap],
      ['uLowerEdgePoint', '2fv', render.lowerLeftOnMap]
    ]);

    shader.setAllUniformMatrices([
      ['uModelMatrix', '4fv', modelMatrix.data],
      ['uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix)]
    ]);

    shader.bindBuffer('aPosition', tile.vertexBuffer);
    shader.bindBuffer('aTexCoord', tile.texCoordBuffer);
    shader.bindTexture('uTexIndex', 0, tile.texture);

    GL.drawArrays(GL.TRIANGLE_STRIP, 0, tile.vertexBuffer.numItems);
    GL.disable(GL.POLYGON_OFFSET_FILL);
  },

  destroy: function() {}
};
