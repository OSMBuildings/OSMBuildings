
/* 'DepthFogNormalMap' renders the depth buffer and the scene's camera-space 
   normals and fog intensities into textures. Depth is stored as a 24bit depth 
   texture using the WEBGL_depth_texture extension, and normals and fog 
   intensities are stored as the 'rgb' and 'a' of a shared 32bit texture.
   Note that there is no dedicated shader to create the depth texture. Rather,
   the depth buffer used by the GPU in depth testing while rendering the normals
   and fog intensities is itself a texture.
*/

render.DepthFogNormalMap = function() {
  this.shader = new GLX.Shader({
    vertexShader: Shaders.fogNormal.vertex,
    fragmentShader: Shaders.fogNormal.fragment,
    shaderName: 'fog/normal shader',
    attributes: ['aPosition', 'aNormal'],
    uniforms: ['uMatrix', 'uModelMatrix', 'uNormalMatrix', 'uFade', 'uFogDistance', 'uFogBlurDistance', 'uViewDirOnMap', 'uLowerEdgePoint']
  });
  
  this.framebuffer = new GLX.Framebuffer(128, 128, /*depthTexture=*/true); //dummy sizes, will be resized dynamically

  this.mapPlane = new mesh.MapPlane();
};

render.DepthFogNormalMap.prototype.getDepthTexture = function() {
  return this.framebuffer.depthTexture;
};

render.DepthFogNormalMap.prototype.getFogNormalTexture = function() {
  return this.framebuffer.renderTexture;
};


render.DepthFogNormalMap.prototype.render = function(viewMatrix, projMatrix, framebufferSize, isPerspective) {

  var
    shader = this.shader,
    framebuffer = this.framebuffer,
    viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(viewMatrix,projMatrix));

  framebufferSize = framebufferSize || this.framebufferSize;
  framebuffer.setSize( framebufferSize[0], framebufferSize[1] );
    
  shader.enable();
  framebuffer.enable();
  GL.viewport(0, 0, framebufferSize[0], framebufferSize[1]);

  GL.clearColor(0.0, 0.0, 0.0, 1);
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

  var modelMatrix;

  // render all actual data items, but also a dummy map plane
  // Note: SSAO on the map plane has been disabled temporarily
  var dataItems = DataIndex.items.concat([this.mapPlane]);

  dataItems.forEach(item => {
    if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
      return;
    }

    if (!(modelMatrix = item.getMatrix())) {
      return;
    }

    shader.setAllUniforms([
      ['uViewDirOnMap',    '2fv', render.viewDirOnMap],
      ['uLowerEdgePoint',  '2fv', render.lowerLeftOnMap],
      ['uFogDistance',     '1f',  render.fogDistance],
      ['uFogBlurDistance', '1f',  render.fogBlurDistance],
      ['uFade',            '1f',  item.getFade()]
    ]);

    shader.setAllUniformMatrices([
      ['uMatrix',       '4fv', GLX.Matrix.multiply(modelMatrix, viewProjMatrix)],
      ['uModelMatrix',  '4fv', modelMatrix.data],
      ['uNormalMatrix', '3fv', GLX.Matrix.transpose3(GLX.Matrix.invert3(GLX.Matrix.multiply(modelMatrix, viewMatrix)))]
    ]);
    
    shader.bindBuffer('aPosition', item.vertexBuffer);
    shader.bindBuffer('aNormal', item.normalBuffer);

    GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
  });

  shader.disable();
  framebuffer.disable();

  GL.viewport(0, 0, APP.width, APP.height);
};

render.DepthFogNormalMap.prototype.destroy = function() {};
