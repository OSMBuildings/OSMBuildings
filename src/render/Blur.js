
render.Blur = function() {
  this.shader = new glx.Shader({
    vertexShader:   Shaders.blur.vertex,
    fragmentShader: Shaders.blur.fragment,
    shaderName: 'blur shader',
    attributes: ['aPosition', 'aTexCoord'],
    uniforms: ['uInverseTexSize', 'uTexIndex']
  });

  this.framebuffer = new glx.Framebuffer(128, 128); //dummy value, size will be set dynamically
  
  this.vertexBuffer = new glx.Buffer(3, new Float32Array([
    -1, -1, 1E-5,
     1, -1, 1E-5,
     1,  1, 1E-5,
    -1, -1, 1E-5,
     1,  1, 1E-5,
    -1,  1, 1E-5
  ]));
     
  this.texCoordBuffer = new glx.Buffer(2, new Float32Array([
    0,0,
    1,0,
    1,1,
    0,0,
    1,1,
    0,1
  ]));
};

render.Blur.prototype.render = function(inputTexture, framebufferSize) {
  var
    shader = this.shader,
    framebuffer = this.framebuffer;

  framebuffer.setSize( framebufferSize[0], framebufferSize[1] );

  gl.viewport(0, 0, framebufferSize[0], framebufferSize[1]);
  shader.enable();
  framebuffer.enable();

  gl.clearColor(1.0, 0.0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  shader.setUniform('uInverseTexSize', '2fv', [1/framebuffer.width, 1/framebuffer.height]);
  shader.bindBuffer(this.vertexBuffer,  'aPosition');
  shader.bindBuffer(this.texCoordBuffer,'aTexCoord');
  shader.bindTexture('uTexIndex', 0, inputTexture);

  gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

  shader.disable();
  framebuffer.disable();

  gl.viewport(0, 0, MAP.width, MAP.height);
};

render.Blur.prototype.destroy = function() 
{
  if (this.framebuffer) {
    this.framebuffer.destroy();
  }
};
