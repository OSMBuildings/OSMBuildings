
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

    shader.setParam('uFogDistance',     '1f',  render.fogDistance);
    shader.setParam('uFogBlurDistance', '1f',  render.fogBlurDistance);
    shader.setParam('uHighlightColor',  '3fv', this.highlightColor || [0, 0, 0]);
    shader.setParam('uHighlightId',     '3fv', this.highlightId || [0, 0, 0]);
    shader.setParam('uLightColor',      '3fv', [0.5, 0.5, 0.5]);
    shader.setParam('uLightDirection',  '3fv', Sun.direction);
    shader.setParam('uLowerEdgePoint',  '2fv', render.lowerLeftOnMap);
    shader.setParam('uViewDirOnMap',    '2fv', render.viewDirOnMap);

    if (!render.effects.shadows) {
      shader.setMatrix('uNormalTransform', '3fv', GLX.Matrix.identity3().data);
    }

    shader.setTexture('uWallTexIndex', 0, this.wallTexture);
    
    if (depthFramebuffer) {
      shader.setParam('uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height]);
      shader.setTexture('uShadowTexIndex', 1, depthFramebuffer.depthTexture);
    }

    var
      dataItems = DataIndex.items,
      modelMatrix;

    dataItems.forEach(item => {
      // no visibility check needed, Grid.purge() is taking care

      if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom || !(modelMatrix = item.getMatrix())) {
        return;
      }

      shader.setParam('uFade', '1f', item.getFade());

      shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
      shader.setMatrix('uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix));
      
      if (render.effects.shadows) {
        shader.setMatrix('uSunMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, Sun.viewProjMatrix));
      }

      shader.setBuffer('aPosition', item.vertexBuffer);
      shader.setBuffer('aTexCoord', item.texCoordBuffer);
      shader.setBuffer('aNormal', item.normalBuffer);
      shader.setBuffer('aColor', item.colorBuffer);
      shader.setBuffer('aId', item.pickingBuffer);
      shader.setBuffer('aHeight', item.heightBuffer);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    });

    // if (this.showBackfaces) {
    //   GL.enable(GL.CULL_FACE);
    // }

    shader.disable();
  },

  destroy: function() {}
};
