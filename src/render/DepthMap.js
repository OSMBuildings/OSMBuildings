
/* 'DepthMap' renders depth buffer of the current view into a texture. To be compatible with as
   many devices as possible, this code does not use the WEBGL_depth_texture extension, but
   instead color-codes the depth value into an ordinary RGB8 texture.

   This depth texture can then be used for effects such as outline rendering, screen-space
   ambient occlusion (SSAO) and shadow mapping.
*/

render.DepthMap = function() {
  this.shader = new glx.Shader({
    vertexShader: Shaders.depth.vertex,
    fragmentShader: Shaders.depth.fragment,
    shaderName: 'depth shader',
    attributes: ['aPosition', 'aFilter', 'aNormal'],
    uniforms: ['uMatrix', 'uModelMatrix', 'uNormalMatrix', 'uTime', 'uFogDistance', 'uFogBlurDistance', 'uViewDirOnMap', 'uLowerEdgePoint']
  });
  
  this.framebuffer = new glx.Framebuffer(128, 128, /*depthTexture=*/true); //dummy sizes, will be resized dynamically

  this.mapPlane = new mesh.MapPlane();
};

render.DepthMap.prototype.getDepthTexture = function() {
  return this.framebuffer.depthTexture;
};

render.DepthMap.prototype.getFogNormalTexture = function() {
  return this.framebuffer.renderTexture;
};


render.DepthMap.prototype.render = function(viewMatrix, projMatrix, framebufferConfig, isPerspective) {

  var
    shader = this.shader,
    framebuffer = this.framebuffer,
    viewProjMatrix = new glx.Matrix(glx.Matrix.multiply(viewMatrix,projMatrix));


  if (!framebufferConfig && this.framebufferConfig)
    framebufferConfig = this.framebufferConfig;


  if (framebuffer.width != framebufferConfig.width || 
      framebuffer.height!= framebufferConfig.height) {
    framebuffer.setSize( framebufferConfig.width, framebufferConfig.height );

    /* We will be sampling neighboring pixels of the depth texture to create an ambient
     * occlusion map. With the default texture wrap mode 'gl.REPEAT', sampling the neighbors
     * of edge texels would return texels on the opposite edge of the texture, which is not
     * what we want. Setting the wrap mode to 'gl.CLAMP_TO_EDGE' instead returns 
     * the texels themselves, which is far more useful for ambient occlusion maps */
    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
    
  shader.enable();
  framebuffer.enable();
  gl.viewport(0, 0, framebufferConfig.usedWidth, framebufferConfig.usedHeight);

  gl.clearColor(0.0, 0.0, 0.0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var item, modelMatrix;

  shader.setUniform('uTime', '1f', Filter.getTime());

  // render all actual data items, but also a dummy map plane
  // Note: SSAO on the map plane has been disabled temporarily
  var dataItems = data.Index.items.concat([this.mapPlane]);

  for (var i = 0; i < dataItems.length; i++) {
    item = dataItems[i];

    if (MAP.zoom < item.minZoom || MAP.zoom > item.maxZoom) {
      continue;
    }

    if (!(modelMatrix = item.getMatrix())) {
      continue;
    }

    shader.setUniforms([
      ['uViewDirOnMap',    '2fv', render.viewDirOnMap],
      ['uLowerEdgePoint',  '2fv', render.lowerLeftOnMap],
      ['uFogDistance',     '1f',  render.fogDistance],
      ['uFogBlurDistance', '1f',  render.fogBlurDistance]
    ]);

    shader.setUniformMatrices([
      ['uMatrix',       '4fv', glx.Matrix.multiply(modelMatrix, viewProjMatrix)],
      ['uModelMatrix',  '4fv', modelMatrix.data],
      ['uNormalMatrix', '3fv', glx.Matrix.transpose3(glx.Matrix.invert3(glx.Matrix.multiply(modelMatrix, viewMatrix)))]
    ]);
    
    shader.bindBuffer(item.vertexBuffer, 'aPosition');
    shader.bindBuffer(item.normalBuffer, 'aNormal');
    shader.bindBuffer(item.filterBuffer, 'aFilter');

    gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
  }

  shader.disable();
  framebuffer.disable();

  gl.viewport(0, 0, MAP.width, MAP.height);
};

render.DepthMap.prototype.destroy = function() {};

