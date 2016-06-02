
render.AmbientMap = {

  init: function() {
    this.shader = new GLX.Shader({
      vertexShader:   Shaders.ambientFromDepth.vertex,
      fragmentShader: Shaders.ambientFromDepth.fragment,
      shaderName: 'SSAO shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uInverseTexSize', 'uNearPlane', 'uFarPlane', 'uDepthTexIndex', 'uFogTexIndex', 'uEffectStrength']
    });

    this.framebuffer = new GLX.Framebuffer(128, 128); //dummy value, size will be set dynamically
    
    this.vertexBuffer = new GLX.Buffer(3, new Float32Array([
      -1, -1, 1E-5,
       1, -1, 1E-5,
       1,  1, 1E-5,
      -1, -1, 1E-5,
       1,  1, 1E-5,
      -1,  1, 1E-5
    ]));
       
    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array([
      0,0,
      1,0,
      1,1,
      0,0,
      1,1,
      0,1
    ]));
  },

  render: function(depthTexture, fogTexture, framebufferSize, effectStrength) {

    var
      shader = this.shader,
      framebuffer = this.framebuffer;

    if (effectStrength === undefined) {
      effectStrength = 1.0;
    }

    framebuffer.setSize( framebufferSize[0], framebufferSize[1] );

    GL.viewport(0, 0, framebufferSize[0], framebufferSize[1]);
    shader.enable();
    framebuffer.enable();

    GL.clearColor(1.0, 0.0, 0.0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    shader.setUniforms([
      ['uInverseTexSize', '2fv', [1/framebufferSize[0], 1/framebufferSize[1]]],
      ['uEffectStrength', '1f',  effectStrength],
      ['uNearPlane',      '1f',  1.0], //FIXME: use actual near and far planes of the projection matrix
      ['uFarPlane',       '1f',  7500.0]
    ]);

    shader.bindBuffer(this.vertexBuffer,   'aPosition');
    shader.bindBuffer(this.texCoordBuffer, 'aTexCoord');

    shader.bindTexture('uDepthTexIndex', 0, depthTexture);
    shader.bindTexture('uFogTexIndex',   1, fogTexture);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
    framebuffer.disable();

    GL.viewport(0, 0, APP.width, APP.height);

  },

  destroy: function() {}
};
