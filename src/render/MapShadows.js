
/**
 * This renders shadow for the map layer. It only renders the shadow,
 * not the map itself. Result is used as a blended overlay
 * so that the map can be rendered independently from the shadows cast on it.
 */

class MapShadows {

  constructor () {
    this.shader = new GLX.Shader({
      vertexShader: Shaders['basemap.shadows'].vertex,
      fragmentShader: Shaders['basemap.shadows'].fragment,
      shaderName: 'map shadows shader',
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

  render (Sun, depthFramebuffer, shadowStrength) {
    const item = this.mapPlane;
    if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
      return;
    }

    const shader = this.shader;

    shader.enable();

    GL.disable(GL.CULL_FACE);

    shader.setAllUniforms([
      ['uDirToSun', '3fv', Sun.direction],
      ['uViewDirOnMap', '2fv',   render.viewDirOnMap],
      ['uLowerEdgePoint', '2fv', render.lowerLeftOnMap],
      ['uFogDistance', '1f', render.fogDistance],
      ['uFogBlurDistance', '1f', render.fogBlurDistance],
      ['uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height] ],
      ['uShadowStrength', '1f', shadowStrength]
    ]);

    shader.bindTexture('uShadowTexIndex', 0, depthFramebuffer.depthTexture);

    let modelMatrix;
    if (!(modelMatrix = item.getMatrix())) {
      return;
    }

    shader.setAllUniformMatrices([
      ['uModelMatrix', '4fv', modelMatrix.data],
      ['uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix)],
      ['uSunMatrix',   '4fv', GLX.Matrix.multiply(modelMatrix, Sun.viewProjMatrix)]
    ]);

    shader.bindBuffer('aPosition', item.vertexBuffer);
    shader.bindBuffer('aNormal', item.normalBuffer);

    GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);

    shader.disable();
  }

  destroy () {
    this.mapPlane.destroy();
  }
}
