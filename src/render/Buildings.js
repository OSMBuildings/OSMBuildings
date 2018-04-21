
render.Buildings = {

  init: function() {
  
    this.shader = !render.effects.shadows ?
      new GLX.Shader({
        vertexShader: Shaders.buildings.vertex,
        fragmentShader: Shaders.buildings.fragment,
        shaderName: 'building shader',
        attributes: ['aPosition', 'aTexCoord', 'aColor', 'aNormal', 'aId', 'aHeight'],
        uniforms: [
          'uModelMatrix',
          'uViewDirOnMap',
          'uMatrix',
          'uNormalTransform',
          'uLightColor',
          'uLightDirection',
          'uLowerEdgePoint',
          'uFogDistance',
          'uFogBlurDistance',
          'uHighlightColor',
          'uHighlightId',
          'uFade',
          'uWallTexIndex'
        ]
      }) : new GLX.Shader({
      vertexShader: Shaders['buildings.shadows'].vertex,
      fragmentShader: Shaders['buildings.shadows'].fragment,
      shaderName: 'quality building shader',
      attributes: ['aPosition', 'aTexCoord', 'aColor', 'aNormal', 'aId', 'aHeight'],
      uniforms: [
        'uFogDistance',
        'uFogBlurDistance',
        'uHighlightColor',
        'uHighlightId',
        'uLightColor',
        'uLightDirection',
        'uLowerEdgePoint',
        'uMatrix',
        'uModelMatrix',
        'uSunMatrix',
        'uShadowTexIndex',
        'uShadowTexDimensions',
        'uFade',
        'uViewDirOnMap',
        'uWallTexIndex'
      ]
    });
    
    this.wallTexture = new GLX.texture.Image();
    this.wallTexture.color( [1,1,1]);
    this.wallTexture.load( BUILDING_TEXTURE);
  },

  render: function(depthFramebuffer) {

    var shader = this.shader;
    shader.enable();

    // if (this.showBackfaces) {
    //   GL.disable(GL.CULL_FACE);
    // }

    shader.setAllUniforms([
      ['uFogDistance',     '1f',  render.fogDistance],
      ['uFogBlurDistance', '1f',  render.fogBlurDistance],
      ['uHighlightColor',  '3fv', this.highlightColor || [0, 0, 0]],
      ['uHighlightId',     '3fv', this.highlightId || [0, 0, 0]],
      ['uLightColor',      '3fv', [0.5, 0.5, 0.5]],
      ['uLightDirection',  '3fv', Sun.direction],
      ['uLowerEdgePoint',  '2fv', render.lowerLeftOnMap],
      ['uViewDirOnMap',    '2fv', render.viewDirOnMap]
    ]);

    if (!render.effects.shadows) {
      shader.setUniformMatrix('uNormalTransform', '3fv', GLX.Matrix.identity3().data);
    }

    shader.bindTexture('uWallTexIndex', 0, this.wallTexture);
    
    if (depthFramebuffer) {
      shader.setUniform('uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height]);
      shader.bindTexture('uShadowTexIndex', 1, depthFramebuffer.depthTexture);
    }

    var
      dataItems = DataIndex.items,
      modelMatrix;

    dataItems.forEach(item => {
      // no visibility check needed, Grid.purge() is taking care

      if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom || !(modelMatrix = item.getMatrix())) {
        return;
      }

      shader.setUniform('uFade', '1f', item.getFade());

      shader.setAllUniformMatrices([
        ['uModelMatrix', '4fv', modelMatrix.data],
        ['uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix)]
      ]);
      
      if (render.effects.shadows) {
        shader.setUniformMatrix('uSunMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, Sun.viewProjMatrix));
      }

      shader.bindBuffer('aPosition', item.vertexBuffer);
      shader.bindBuffer('aTexCoord', item.texCoordBuffer);
      shader.bindBuffer('aNormal', item.normalBuffer);
      shader.bindBuffer('aColor', item.colorBuffer);
      shader.bindBuffer('aId', item.pickingBuffer);
      shader.bindBuffer('aHeight', item.heightBuffer);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    });

    // if (this.showBackfaces) {
    //   GL.enable(GL.CULL_FACE);
    // }

    shader.disable();
  },

  destroy: function() {}
};
