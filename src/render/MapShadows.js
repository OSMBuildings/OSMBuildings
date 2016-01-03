
/* This object renders the shadow for the map layer. It only renders the shadow,
 * not the map itself. The intended use for this class is as a blended overlay
 * so that the map can be rendered independently from the shadows cast on it.
 */

render.MapShadows = {

  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.mapShadows.vertex,
      fragmentShader: Shaders.mapShadows.fragment,
      attributes: ['aPosition', 'aNormal'],
      uniforms: [
        'uModelMatrix',
        'uViewMatrix',
        'uProjMatrix',
        'uViewDirOnMap',
        'uMatrix',
        'uDirToSun',
        'uNormalTransform',
        'uLightColor',
        'uLowerEdgePoint',
        'uFogDistance',
        'uFogBlurDistance',
        'uShadowTexDimensions', 
        'uShadowStrength',
        'uSunMatrix',
      ]
    });
    
    this.mapPlane = new mesh.MapPlane();
  },

  render: function(depthFramebuffer, shadowStrength) {
    var shader = this.shader;
    shader.enable();

    if (this.showBackfaces) {
      gl.disable(gl.CULL_FACE);
    }

    gl.uniform3fv(shader.uniforms.uLightColor, [0.5, 0.5, 0.5]);
    gl.uniform3fv(shader.uniforms.uDirToSun, Sun.direction);

    gl.uniform2fv(shader.uniforms.uViewDirOnMap,   render.viewDirOnMap);
    gl.uniform2fv(shader.uniforms.uLowerEdgePoint, render.lowerLeftOnMap);

    gl.uniform1f(shader.uniforms.uFogDistance, render.fogDistance);
    gl.uniform1f(shader.uniforms.uFogBlurDistance, render.fogBlurDistance);
    gl.uniform3fv(shader.uniforms.uFogColor, render.fogColor);

    gl.uniform2f(shader.uniforms.uShadowTexDimensions, depthFramebuffer.width, depthFramebuffer.height);
    gl.uniform1f(shader.uniforms.uShadowStrength, shadowStrength);
    depthFramebuffer.renderTexture.enable(0);
    gl.uniform1i(shader.uniforms.uShadowTexIndex, 0);

    var item = this.mapPlane;
    if (MAP.zoom < item.minZoom || MAP.zoom > item.maxZoom) {
      return;
    }

    var modelMatrix;
    if (!(modelMatrix = item.getMatrix())) {
      return;
    }

    gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));
    gl.uniformMatrix4fv(shader.uniforms.uSunMatrix, false, glx.Matrix.multiply(modelMatrix, Sun.viewProjMatrix));

    shader.bindBuffer(item.vertexBuffer, 'aPosition');
    shader.bindBuffer(item.normalBuffer, 'aNormal');

    gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);

    if (this.showBackfaces) {
      gl.enable(gl.CULL_FACE);
    }

    shader.disable();
  },

  destroy: function() {}
};
