
/* 'ShadowMap'    
*/
render.ShadowMap = function() {
  this.shader = new glx.Shader({
    vertexShader: Shaders.shadow.vertex,
    fragmentShader: Shaders.shadow.fragment,
    attributes: ['aPosition', 'aFilter', 'aNormal'],
    uniforms: ['uMatrix', 'uModelMatrix', 'uDirToSun', 'uSunMatrix', 'uTime', 'uEffectStrength', 'uFogDistance', 'uFogBlurDistance', 'uInverseTexWidth', 'uInverseTexHeight', 'uViewDirOnMap', 'uLowerEdgePoint']
  });

  this.framebuffer = new glx.Framebuffer(128, 128); //dummy values, will be resized dynamically

  this.mapPlane = new mesh.MapPlane();
};

render.ShadowMap.prototype.render = function(framebufferConfig, viewProjMatrix, sunConfiguration, depthFramebuffer, effectStrength) {

  var
    shader = this.shader,
    framebuffer = this.framebuffer;

  if (framebuffer.width != framebufferConfig.width || 
      framebuffer.height!= framebufferConfig.height) {
    framebuffer.setSize( framebufferConfig.width, framebufferConfig.height );

    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    /* This texture will be mapped pixel-to-pixel to screen pixels later on.
     * So linear interpolation or mip-mapping of texels is neither necessary nor desirable.
     */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }
    
  shader.enable();
  framebuffer.enable();
  gl.viewport(0, 0, framebufferConfig.usedWidth, framebufferConfig.usedHeight);

  gl.clearColor(1.0, 1.0, 1.0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var item, modelMatrix;

  depthFramebuffer.renderTexture.enable(0);
  gl.uniform1i(shader.uniforms.uShadowTexIndex, 0);

  gl.uniform1f(shader.uniforms.uTime, Filter.time());
  gl.uniform1f(shader.uniforms.uFogDistance, render.fogDistance);
  gl.uniform1f(shader.uniforms.uFogBlurDistance, render.fogBlurDistance);
  gl.uniform1f(shader.uniforms.uInverseTexWidth,  depthFramebuffer.width);
  gl.uniform1f(shader.uniforms.uInverseTexHeight, depthFramebuffer.height);
  gl.uniform1f(shader.uniforms.uEffectStrength,  effectStrength);

  gl.uniform2fv(shader.uniforms.uViewDirOnMap, render.viewDirOnMap);
  gl.uniform2fv(shader.uniforms.uLowerEdgePoint, render.lowerLeftOnMap);
  gl.uniform3fv(shader.uniforms.uDirToSun, sunConfiguration.direction);

  var dataItems = data.Index.items.concat([this.mapPlane]);

  for (var i = 0; i < dataItems.length; i++) {
    item = dataItems[i];

    if (MAP.zoom < item.minZoom || MAP.zoom > item.maxZoom) {
      continue;
    }

    if (!(modelMatrix = item.getMatrix())) {
      continue;
    }

    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, viewProjMatrix));
    gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);

    gl.uniformMatrix4fv(shader.uniforms.uSunMatrix, false, glx.Matrix.multiply(modelMatrix, sunConfiguration.viewProjMatrix));
    
    item.vertexBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    item.normalBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aNormal, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    item.filterBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aFilter, item.filterBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
  }

  shader.disable();
  framebuffer.disable();
  gl.viewport(0, 0, MAP.width, MAP.height);
};

render.ShadowMap.prototype.destroy = function() {};

