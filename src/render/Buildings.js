
class Buildings {

  constructor () {
    this.shader = !render.effects.shadows ?
      new GLX.Shader({
        vertexShader: Shaders.buildings.vertex,
        fragmentShader: Shaders.buildings.fragment,
        shaderName: 'building shader',
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
      vertexShader: Shaders['buildings_with_shadows'].vertex,
      fragmentShader: Shaders['buildings_with_shadows'].fragment,
      shaderName: 'quality building shader',
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

    shader.setParam('uFogDistance',     '1f',  render.fogDistance);
    shader.setParam('uFogBlurDistance', '1f',  render.fogBlurDistance);
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

    APP.features.forEach(item => {
      // no visibility check needed, Grid.purge() is taking care
      // TODO: but not for individual objects (and markers)!

      if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
        return;
      }

      const modelMatrix = item.getMatrix();

      if (!modelMatrix) {
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
      shader.setBuffer('aHeight', item.heightBuffer);
      shader.setBuffer('aTintColor',  item.tintBuffer);
      shader.setBuffer('aZScale',  item.zScaleBuffer);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    });

    // if (this.showBackfaces) {
    //   GL.enable(GL.CULL_FACE);
    // }

    shader.disable();
  }

  destroy () {}
}
