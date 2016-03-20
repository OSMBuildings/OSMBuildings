
render.Buildings = {

  init: function() {
  
    this.shader = !render.effects.shadows ?
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
          'uWallTexIndex'
        ]
      }) : new glx.Shader({
        vertexShader: Shaders['buildings.shadows'].vertex,
        fragmentShader: Shaders['buildings.shadows'].fragment,
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
          'uShadowStrength',
          'uLowerEdgePoint',
          'uFogDistance',
          'uFogBlurDistance',
          'uFogColor',
          'uBendRadius',
          'uBendDistance',
          'uHighlightColor',
          'uHighlightID',
          'uTime',
          'uSunMatrix',
          'uShadowTexIndex',
          'uShadowTexDimensions',
          'uWallTexIndex'
        ]
    });
    
    this.wallTexture = new glx.texture.Image();
    this.wallTexture.color( [1,1,1]);
    this.wallTexture.load( BUILDING_TEXTURE);
  },

  render: function(depthFramebuffer, shadowStrength) {

    var shader = this.shader;
    shader.enable();

    if (this.showBackfaces) {
      gl.disable(gl.CULL_FACE);
    }

    if (!this.highlightID) {
      this.highlightID = [0, 0, 0];
    }

    shader.setUniforms([
      ["uBendRadius",      "1f",  render.bendRadius],
      ["uBendDistance",    "1f",  render.bendDistance],
      ["uFogDistance",     "1f",  render.fogDistance],
      ["uFogBlurDistance", "1f",  render.fogBlurDistance],
      ["uFogColor",        "3fv", render.fogColor],
      ["uHighlightColor",  "3fv", render.highlightColor],
      ["uHighlightID",     "3fv", this.highlightID],
      ["uLightColor",      "3fv", [0.5, 0.5, 0.5]],
      ["uLightDirection",  "3fv", Sun.direction],
      ["uLowerEdgePoint",  "2fv", render.lowerLeftOnMap],
      ["uShadowStrength",  "1f",  shadowStrength],
      ["uTime",            "1f",  Filter.getTime()],
      ["uViewDirOnMap",    "2fv", render.viewDirOnMap]
    ]);

    var normalMatrix = glx.Matrix.invert3(new glx.Matrix().data);

    shader.setUniformMatrices([
      ["uProjMatrix",      "4fv", render.projMatrix.data],
      ["uViewMatrix",      "4fv", render.viewMatrix.data],
      ["uNormalTransform", "3fv", glx.Matrix.transpose3(normalMatrix)]
    ]);

    shader.bindTexture("uWallTexIndex", 0, this.wallTexture);
    
    if (depthFramebuffer) {
      shader.setUniform("uShadowTexDimensions", "2fv", [depthFramebuffer.width, depthFramebuffer.height]);
      shader.bindTexture("uShadowTexIndex", 1, depthFramebuffer.depthTexture);
    }
    

    var
      dataItems = data.Index.items,
      item,
      modelMatrix;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      // no visibility check needed, Grid.purge() is taking care

      item = dataItems[i];

      if (MAP.zoom < item.minZoom || MAP.zoom > item.maxZoom || !(modelMatrix = item.getMatrix())) {
        continue;
      }

      shader.setUniformMatrices([
        ["uModelMatrix", "4fv", modelMatrix.data],
        ["uMatrix",      "4fv", glx.Matrix.multiply(modelMatrix, render.viewProjMatrix)],
        ["uSunMatrix",   "4fv", glx.Matrix.multiply(modelMatrix, Sun.viewProjMatrix)]
      ]);

      shader.bindBuffer(item.vertexBuffer,   'aPosition');
      shader.bindBuffer(item.texCoordBuffer, 'aTexCoord');
      shader.bindBuffer(item.normalBuffer,   'aNormal');
      shader.bindBuffer(item.colorBuffer,    'aColor');
      shader.bindBuffer(item.filterBuffer,   'aFilter');
      shader.bindBuffer(item.idBuffer,       'aID');

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    if (this.showBackfaces) {
      gl.enable(gl.CULL_FACE);
    }

    shader.disable();
  },

  destroy: function() {}
};
