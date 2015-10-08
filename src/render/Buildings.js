
render.Buildings = {

  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.buildings.vertex,
      fragmentShader: Shaders.buildings.fragment,
      attributes: ['aPosition', 'aColor', 'aNormal', 'aIDColor'],
      uniforms: ['uModelMatrix', 'uViewMatrix', 'uProjMatrix', 'uMatrix', 'uNormalTransform', 'uAlpha', 'uLightColor', 'uLightDirection', 'uFogRadius', 'uFogColor', 'uBendRadius', 'uBendDistance', 'uHighlightColor', 'uHighlightID']
    });
  },

  render: function(radius, distance) {
//  gl.enable(gl.BLEND);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//  gl.disable(gl.DEPTH_TEST);

    var shader = this.shader;
    shader.enable();

    if (this.showBackfaces) {
      gl.disable(gl.CULL_FACE);
    }

    // TODO: suncalc
    gl.uniform3fv(shader.uniforms.uLightColor, [0.5, 0.5, 0.5]);
    gl.uniform3fv(shader.uniforms.uLightDirection, unit(1, 1, 1));

    var normalMatrix = glx.Matrix.invert3(new glx.Matrix().data);
    gl.uniformMatrix3fv(shader.uniforms.uNormalTransform, false, glx.Matrix.transpose(normalMatrix));

    gl.uniform1f(shader.uniforms.uFogRadius, render.fogRadius);
    gl.uniform3fv(shader.uniforms.uFogColor, [render.fogColor.r, render.fogColor.g, render.fogColor.b]);

    gl.uniform1f(shader.uniforms.uBendRadius, render.bendRadius);
    gl.uniform1f(shader.uniforms.uBendDistance, render.bendDistance);

    if (!this.highlightColor) {
      this.highlightColor = DEFAULT_HIGHLIGHT_COLOR;
    }
    gl.uniform3fv(shader.uniforms.uHighlightColor, [this.highlightColor.r, this.highlightColor.g, this.highlightColor.b]);

    if (!this.highlightID) {
      this.highlightID = { r:0, g:0, b:0 };
    }
    gl.uniform3fv(shader.uniforms.uHighlightID, [this.highlightID.r, this.highlightID.g, this.highlightID.b]);

    var
      dataItems = data.Index.items,
      item,
      modelMatrix;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(modelMatrix = item.getMatrix())) {
        continue;
      }

      gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.normalBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aNormal, item.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.colorBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aColor, item.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.idColorBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aIDColor, item.idColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

//    item.visibilityBuffer.enable();
//    gl.vertexAttribPointer(shader.attributes.aHidden, item.visibilityBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    if (this.showBackfaces) {
      gl.enable(gl.CULL_FACE);
    }

    shader.disable();
  },

  destroy: function() {}
};
