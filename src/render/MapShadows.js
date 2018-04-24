
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

    shader.setParam('uDirToSun', '3fv', Sun.direction);
    shader.setParam('uViewDirOnMap', '2fv',   render.viewDirOnMap);
    shader.setParam('uLowerEdgePoint', '2fv', render.lowerLeftOnMap);
    shader.setParam('uFogDistance', '1f', render.fogDistance);
    shader.setParam('uFogBlurDistance', '1f', render.fogBlurDistance);
    shader.setParam('uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height] );
    shader.setParam('uShadowStrength', '1f', shadowStrength);

    shader.setTexture('uShadowTexIndex', 0, depthFramebuffer.depthTexture);

    let modelMatrix;
    if (!(modelMatrix = item.getMatrix())) {
      return;
    }

    shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
    shader.setMatrix('uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix));
    shader.setMatrix('uSunMatrix',   '4fv', GLX.Matrix.multiply(modelMatrix, Sun.viewProjMatrix));

    shader.setBuffer('aPosition', item.vertexBuffer);
    shader.setBuffer('aNormal', item.normalBuffer);

    GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);

    shader.disable();
  }

  destroy () {
    this.mapPlane.destroy();
  }
}
