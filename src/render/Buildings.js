
render.Buildings = {

  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.buildings.vertex,
      fragmentShader: Shaders.buildings.fragment,
      attributes: ['aPosition', 'aColor', 'aFilter', 'aNormal', 'aID'],
      uniforms: [
        'uModelMatrix',
        'uViewMatrix',
        'uProjMatrix',
        'uMatrix',
        'uNormalTransform',
        'uAlpha',
        'uLightColor',
        'uLightDirection',
        'uFogRadius',
        'uFogColor',
        'uBendRadius',
        'uBendDistance',
        'uHighlightColor',
        'uHighlightID',
        'uTime'
      ]
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
    gl.uniform3fv(shader.uniforms.uFogColor, render.fogColor);

    gl.uniform1f(shader.uniforms.uBendRadius, render.bendRadius);
    gl.uniform1f(shader.uniforms.uBendDistance, render.bendDistance);

    gl.uniform3fv(shader.uniforms.uHighlightColor, render.highlightColor);

    gl.uniform1f(shader.uniforms.uTime, Filter.time());

    if (!this.highlightID) {
      this.highlightID = [0, 0, 0];
    }
    gl.uniform3fv(shader.uniforms.uHighlightID, this.highlightID);

    gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);

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

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.normalBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aNormal, item.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.colorBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aColor, item.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.filterBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aFilter, item.filterBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.idBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aID, item.idBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    if (this.showBackfaces) {
      gl.enable(gl.CULL_FACE);
    }

    shader.disable();
  },

  destroy: function() {}
};
