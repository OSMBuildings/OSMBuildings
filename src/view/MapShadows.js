
/**
 * This renders shadow for the map layer. It only renders the shadow,
 * not the map itself. Result is used as a blended overlay
 * so that the map can be rendered independently from the shadows cast on it.
 */
// TODO: independence is not required anymore. could be combined with Basemap?

View.MapShadows = class {

  constructor () {
    this.shader = new GLX.Shader({
      source: shaders.basemap_with_shadows,
      attributes: ['aPosition', 'aNormal'],
      uniforms: [
        'uModelMatrix',
        'uViewDirOnMap',
        'uMatrix',
        'uDirToSun',
        'uLowerEdgePoint',
        'uFogDistance',
        'uFogBlurDistance',
        'uShadowTexDimensions', 
        'uShadowStrength',
        'uShadowTexIndex',
        'uSunMatrix',
      ]
    });
    
    this.mapPlane = new MapPlane();
  }

  render (depthFramebuffer, shadowStrength) {
    const item = this.mapPlane;
    if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
      return;
    }

    const shader = this.shader;

    shader.enable();

    GL.disable(GL.CULL_FACE);

    shader.setParam('uDirToSun', '3fv', View.Sun.direction);
    shader.setParam('uViewDirOnMap', '2fv',   APP.view.viewDirOnMap);
    shader.setParam('uLowerEdgePoint', '2fv', APP.view.lowerLeftOnMap);
    shader.setParam('uFogDistance', '1f', APP.view.fogDistance);
    shader.setParam('uFogBlurDistance', '1f', APP.view.fogBlurDistance);
    shader.setParam('uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height] );
    shader.setParam('uShadowStrength', '1f', shadowStrength);

    shader.setTexture('uShadowTexIndex', 0, depthFramebuffer.depthTexture);

    let modelMatrix;
    if (!(modelMatrix = item.getMatrix())) {
      return;
    }

    shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
    shader.setMatrix('uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, APP.view.viewProjMatrix));
    shader.setMatrix('uSunMatrix',   '4fv', GLX.Matrix.multiply(modelMatrix, View.Sun.viewProjMatrix));

    shader.setBuffer('aPosition', item.vertexBuffer);
    shader.setBuffer('aNormal', item.normalBuffer);

    GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);

    shader.disable();
  }

  destroy () {
    this.mapPlane.destroy();
  }
};