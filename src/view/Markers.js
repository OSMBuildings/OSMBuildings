
View.Markers = class {

  constructor () {

    this.shader = new GLX.Shader({
      source: shaders.markers,
      attributes: ['aPosition'],
      uniforms: [
        'uFogDistance',
        'uFogBlurDistance',
        'uLightColor',
        'uLightDirection',
        'uLowerEdgePoint',
        'uModelMatrix',
        'uSunMatrix',
        'uShadowTexIndex',
        'uShadowTexDimensions',
        'uViewDirOnMap',
        'uProjMatrix',
        'uViewMatrix',
        'uColor'
      ]
    });
  }

  render (depthFramebuffer) {
    const shader = this.shader;

    shader.enable();

    shader.setParam('uFogDistance',     '1f',  APP.view.fogDistance);
    shader.setParam('uFogBlurDistance', '1f',  APP.view.fogBlurDistance);
    shader.setParam('uLightColor',      '3fv', [0.5, 0.5, 0.5]);
    shader.setParam('uLightDirection',  '3fv', View.Sun.direction);
    shader.setParam('uLowerEdgePoint',  '2fv', APP.view.lowerLeftOnMap);
    shader.setParam('uViewDirOnMap',    '2fv', APP.view.viewDirOnMap);
    shader.setParam('uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height]);

    shader.setTexture('uShadowTexIndex', 1, depthFramebuffer.depthTexture);

    shader.setMatrix('uViewMatrix', '4fv', APP.view.viewMatrix.data);
    shader.setMatrix('uProjMatrix', '4fv', APP.view.projMatrix.data);

    APP.markers.forEach(item => {
      const modelMatrix = item.getMatrix();

      shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
      shader.setMatrix('uSunMatrix',   '4fv', GLX.Matrix.multiply(modelMatrix, View.Sun.viewProjMatrix));

      shader.setBuffer('aPosition', item.icon.vertexBuffer);

      shader.setParam('uColor', '3fv', item.color);

      GL.drawArrays(GL.TRIANGLES, 0, item.icon.vertexBuffer.numItems);
    });

    shader.disable();
  }

  destroy () {
    this.shader.destroy();
  }
};
