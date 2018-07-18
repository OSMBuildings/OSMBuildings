
View.Buildings = class {

  constructor () {
    this.shader = !APP.view.shadowsEnabled ?
      new GLX.Shader({
        source: shaders.buildings,
        attributes: ['aPosition', 'aTexCoord', 'aColor', 'aNormal', 'aHeight', 'aTintColor', 'aZScale'],
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
          'uFade',
          'uWallTexIndex'
        ]
      }) : new GLX.Shader({
      source: shaders.buildings_with_shadows,
      attributes: ['aPosition', 'aTexCoord', 'aColor', 'aNormal', 'aHeight', 'aTintColor', 'aZScale'],
      uniforms: [
        'uFogDistance',
        'uFogBlurDistance',
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
    this.wallTexture.color([1,1,1]);
    this.wallTexture.load(BUILDING_TEXTURE);
  }

  render (depthFramebuffer) {
    const shader = this.shader;
    shader.enable();

    // if (this.showBackfaces) {
    //   GL.disable(GL.CULL_FACE);
    // }

    shader.setParam('uFogDistance',     '1f',  APP.view.fogDistance);
    shader.setParam('uFogBlurDistance', '1f',  APP.view.fogBlurDistance);
    shader.setParam('uLightColor',      '3fv', [0.5, 0.5, 0.5]);
    shader.setParam('uLightDirection',  '3fv', View.Sun.direction);
    shader.setParam('uLowerEdgePoint',  '2fv', APP.view.lowerLeftOnMap);
    shader.setParam('uViewDirOnMap',    '2fv', APP.view.viewDirOnMap);

    if (!APP.view.shadowsEnabled) {
      const matrix3 = new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]);

      shader.setMatrix('uNormalTransform', '3fv', matrix3);
    }

    shader.setTexture('uWallTexIndex', 0, this.wallTexture);

    if (depthFramebuffer) {
      shader.setParam('uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height]);
      shader.setTexture('uShadowTexIndex', 1, depthFramebuffer.depthTexture);
    }

    APP.features.forEach(item => {
      // no visibility check needed, Grid.purge() is taking care
      // TODO: but not for individual features

      if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
        return;
      }

      const modelMatrix = item.getMatrix();

      if (!modelMatrix) {
        return;
      }

      shader.setParam('uFade', '1f', item.getFade());

      shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
      shader.setMatrix('uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, APP.view.viewProjMatrix));

      if (APP.view.shadowsEnabled) {
        shader.setMatrix('uSunMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, View.Sun.viewProjMatrix));
      }

      shader.setBuffer('aPosition', item.vertexBuffer);
      shader.setBuffer('aTexCoord', item.texCoordBuffer);
      shader.setBuffer('aNormal', item.normalBuffer);
      shader.setBuffer('aColor', item.colorBuffer);
      shader.setBuffer('aHeight', item.heightBuffer);
      shader.setBuffer('aTintColor', item.tintBuffer);
      shader.setBuffer('aZScale', item.zScaleBuffer);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    });


    // if (this.showBackfaces) {
    //   GL.enable(GL.CULL_FACE);
    // }

    shader.disable();
  }

  destroy () {}
};