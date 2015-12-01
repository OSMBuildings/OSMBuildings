
render.Buildings = {

  init: function() {
  
    this.shader = (render.optimize !== 'quality') ?
      new glx.Shader({
        vertexShader: Shaders.buildings.vertex,
        fragmentShader: Shaders.buildings.fragment,
        attributes: ['aPosition', 'aTexCoord', 'aColor', 'aFilter', 'aNormal', 'aID'],
        uniforms: [
          'uModelMatrix',
          'uViewMatrix',
          'uProjMatrix',
          'uViewDirOnMap',
          'uMatrix',
          'uNormalTransform',
          'uAlpha',
          'uLightColor',
          'uLightDirection',
          'uLowerEdgePoint',
          'uFogDistance',
          'uFogBlurDistance',
          'uFogColor',
          'uBendRadius',
          'uBendDistance',
          'uHighlightColor',
          'uHighlightID',
          'uTime',
          'uDirToSun', 
          'uWallTexIndex'
        ]
    }) :
    
      new glx.Shader({
        vertexShader: Shaders.buildingsQuality.vertex,
        fragmentShader: Shaders.buildingsQuality.fragment,
        attributes: ['aPosition', 'aTexCoord', 'aColor', 'aFilter', 'aNormal', 'aID'],
        uniforms: [
          'uModelMatrix',
          'uViewMatrix',
          'uProjMatrix',
          'uViewDirOnMap',
          'uMatrix',
          'uNormalTransform',
          'uAlpha',
          'uLightColor',
          'uLightDirection',
          'uLowerEdgePoint',
          'uFogDistance',
          'uFogBlurDistance',
          'uFogColor',
          'uBendRadius',
          'uBendDistance',
          'uHighlightColor',
          'uHighlightID',
          'uTime',
          'uDirToSun', 
          'uSunMatrix', 
          'uShadowTexIndex',
          'uShadowTexDimensions',
          'uShadowEffectStrength',
          'uWallTexIndex',
        ]
    });
    
    this.wallTexture = new glx.texture.Image();
    this.wallTexture.color( [1,1,1]);
    this.wallTexture.load( BUILDING_TEXTURE);
  },

  render: function(sunConfiguration, depthFramebuffer, shadowStrength) {

    var shader = this.shader;
    shader.enable();

    if (this.showBackfaces) {
      gl.disable(gl.CULL_FACE);
    }

    gl.uniform3fv(shader.uniforms.uLightColor, [0.5, 0.5, 0.5]);
    gl.uniform3fv(shader.uniforms.uLightDirection, sunConfiguration.direction);

    var normalMatrix = glx.Matrix.invert3(new glx.Matrix().data);
    gl.uniformMatrix3fv(shader.uniforms.uNormalTransform, false, glx.Matrix.transpose(normalMatrix));

    gl.uniform2fv(shader.uniforms.uViewDirOnMap,   render.viewDirOnMap);
    gl.uniform2fv(shader.uniforms.uLowerEdgePoint, render.lowerLeftOnMap);

    gl.uniform1f(shader.uniforms.uFogDistance, render.fogDistance);
    gl.uniform1f(shader.uniforms.uFogBlurDistance, render.fogBlurDistance);
    gl.uniform3fv(shader.uniforms.uFogColor, render.fogColor);

    gl.uniform1f(shader.uniforms.uBendRadius, render.bendRadius);
    gl.uniform1f(shader.uniforms.uBendDistance, render.bendDistance);

    gl.uniform3fv(shader.uniforms.uHighlightColor, render.highlightColor);

    gl.uniform1f(shader.uniforms.uTime, Filter.getTime());

    if (!this.highlightID) {
      this.highlightID = [0, 0, 0];
    }
    gl.uniform3fv(shader.uniforms.uHighlightID, this.highlightID);

    gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);

    gl.uniform1f(shader.uniforms.uShadowStrength,  shadowStrength);
    
    if (depthFramebuffer) {
      gl.uniform2f(shader.uniforms.uShadowTexDimensions, depthFramebuffer.width, depthFramebuffer.height);
      depthFramebuffer.renderTexture.enable(1);
      gl.uniform1i(shader.uniforms.uShadowTexIndex, 1);
    }
    
    this.wallTexture.enable(0);
      gl.uniform1i(shader.uniforms.uWallTexIndex, 0);
    

    var
      dataItems = data.Index.items,
      item,
      modelMatrix;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      // no visibility check needed, Grid.purge() is taking care

      item = dataItems[i];

      if (MAP.zoom < item.minZoom || MAP.zoom > item.maxZoom) {
        continue;
      }

      if (!(modelMatrix = item.getMatrix())) {
        continue;
      }

      gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));
      gl.uniformMatrix4fv(shader.uniforms.uSunMatrix, false, glx.Matrix.multiply(modelMatrix, sunConfiguration.viewProjMatrix));

      shader.bindBuffer(item.vertexBuffer,   "aPosition");
      shader.bindBuffer(item.texCoordBuffer, "aTexCoord");
      shader.bindBuffer(item.normalBuffer,   "aNormal");
      shader.bindBuffer(item.colorBuffer,    "aColor");
      shader.bindBuffer(item.filterBuffer,   "aFilter");
      shader.bindBuffer(item.idBuffer,       "aID");

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    if (this.showBackfaces) {
      gl.enable(gl.CULL_FACE);
    }

    shader.disable();
  },

  destroy: function() {}
};
