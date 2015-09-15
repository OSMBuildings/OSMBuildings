
var Buildings = {};

(function() {

  var shader;

  Buildings.initShader = function(options) {
    shader = new glx.Shader({
      vertexShader: SHADERS.buildings.vertex,
      fragmentShader: SHADERS.buildings.fragment,
      attributes: ["aPosition", "aColor", "aNormal", "aIDColor"],
      uniforms: ["uMMatrix", "uMatrix", "uNormalTransform", "uAlpha", "uLightColor", "uLightDirection", "uFogRadius", "uFogColor", "uHighlightColor", "uHighlightID"]
    });

    this.showBackfaces = options.showBackfaces;
    return this;
  };

  Buildings.render = function(vpMatrix) {
    if (MAP.zoom < MIN_ZOOM) {
      return;
    }

    var gl = MAP.getContext();

//  gl.enable(gl.BLEND);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//  gl.disable(gl.DEPTH_TEST);

    shader.enable();

    if (this.showBackfaces) {
      gl.disable(gl.CULL_FACE);
    }

    // TODO: suncalc
    gl.uniform3fv(shader.uniforms.uLightColor, [0.5, 0.5, 0.5]);
    gl.uniform3fv(shader.uniforms.uLightDirection, unit(1, 1, 1));

    var normalMatrix = glx.Matrix.invert3(new glx.Matrix().data);
    gl.uniformMatrix3fv(shader.uniforms.uNormalTransform, false, glx.Matrix.transpose(normalMatrix));

    gl.uniform1f(shader.uniforms.uFogRadius, SkyDome.radius);
    gl.uniform3fv(shader.uniforms.uFogColor, [Renderer.fogColor.r, Renderer.fogColor.g, Renderer.fogColor.b]);

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
      mMatrix, mvp;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(mMatrix = item.getMatrix())) {
        continue;
      }

      gl.uniformMatrix4fv(shader.uniforms.uMMatrix, false, mMatrix.data);

      mvp = glx.Matrix.multiply(mMatrix, vpMatrix);
      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, mvp);

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.normalBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aNormal, item.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.colorBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aColor, item.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.idColorBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aIDColor, item.idColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

//      item.visibilityBuffer.enable();
//      gl.vertexAttribPointer(shader.attributes.aHidden, item.visibilityBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    if (this.showBackfaces) {
      gl.enable(gl.CULL_FACE);
    }

    shader.disable();
  };

}());
