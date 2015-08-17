
var Buildings = {};

(function() {

  var shader;

  Buildings.initShader = function(options) {
    shader = new glx.Shader({
      vertexShader: SHADERS.buildings.vertex,
      fragmentShader: SHADERS.buildings.fragment,
      attributes: ["aPosition", "aColor", "aNormal"],
      uniforms: ["uMatrix", "uNormalTransform", "uAlpha", "uLightColor", "uLightDirection", "uFogMatrix", "uFogNear", "uFogFar", "uFogColor"]
    });

    this.showBackfaces = options.showBackfaces;
    return this;
  };

  Buildings.render = function(vpMatrix) {
    if (Map.zoom < MIN_ZOOM) {
      return;
    }

//  GL.enable(GL.BLEND);
//  GL.blendFunc(GL.SRC_ALPHA, GL.ONE);
//  GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
//  GL.disable(GL.DEPTH_TEST);

    shader.enable();

    if (this.showBackfaces) {
      GL.disable(GL.CULL_FACE);
    }

    // TODO: suncalc
    GL.uniform3fv(shader.uniforms.uLightColor, [0.5, 0.5, 0.5]);
    GL.uniform3fv(shader.uniforms.uLightDirection, unit(1, 1, 1));

    var normalMatrix = glx.Matrix.invert3(new glx.Matrix().data);
    GL.uniformMatrix3fv(shader.uniforms.uNormalTransform, false, glx.Matrix.transpose(normalMatrix));

    var mFogMatrix = new glx.Matrix();
    // TODO: move inMeters this to Map
    var inMeters = TILE_SIZE / (Math.cos(Map.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);
    var fogScale = Math.pow(2, 16) * inMeters;
    mFogMatrix.scale(fogScale, fogScale, fogScale);

    var mvpFog = glx.Matrix.multiply(mFogMatrix, vpMatrix);
    GL.uniformMatrix4fv(shader.uniforms.uFogMatrix, false, mvpFog);
    GL.uniform1f(shader.uniforms.uFogNear, Renderer.fogRadius-1000);
    GL.uniform1f(shader.uniforms.uFogFar, Renderer.fogRadius);
    GL.uniform3fv(shader.uniforms.uFogColor, [Renderer.backgroundColor.r, Renderer.backgroundColor.g, Renderer.backgroundColor.b]);

    var
      dataItems = Data.items,
      item,
      mMatrix, mvp;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(mMatrix = item.getMatrix())) {
        continue;
      }

      mvp = glx.Matrix.multiply(mMatrix, vpMatrix);
      GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, mvp);

      item.vertexBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, GL.FLOAT, false, 0, 0);

      item.normalBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aNormal, item.normalBuffer.itemSize, GL.FLOAT, false, 0, 0);

      item.colorBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aColor, item.colorBuffer.itemSize, GL.FLOAT, false, 0, 0);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    if (this.showBackfaces) {
      GL.enable(GL.CULL_FACE);
    }

    shader.disable();
  };

}());
