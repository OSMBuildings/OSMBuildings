
View.AmbientMap = class {

  constructor () {
    this.shader = new GLX.Shader({
      source: shaders.ambient_from_depth,
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uInverseTexSize', 'uNearPlane', 'uFarPlane', 'uDepthTexIndex', 'uFogTexIndex', 'uEffectStrength']
    });

    this.framebuffer = new GLX.Framebuffer(128, 128); // size will be set dynamically
    
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
  }

  render (depthTexture, fogTexture, framebufferSize, effectStrength) {
    const
      shader = this.shader,
      framebuffer = this.framebuffer;

    if (effectStrength === undefined) {
      effectStrength = 1.0;
    }

    framebuffer.setSize(framebufferSize[0], framebufferSize[1]);

    GL.viewport(0, 0, framebufferSize[0], framebufferSize[1]);

    shader.enable();
    framebuffer.enable();

    GL.clearColor(1.0, 0.0, 0.0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    shader.setParam('uInverseTexSize', '2fv', [1/framebufferSize[0], 1/framebufferSize[1]]);
    shader.setParam('uEffectStrength', '1f',  effectStrength);
    shader.setParam('uNearPlane',      '1f',  APP.view.nearPlane);
    shader.setParam('uFarPlane',       '1f',  APP.view.farPlane);

    shader.setBuffer('aPosition', this.vertexBuffer);
    shader.setBuffer('aTexCoord', this.texCoordBuffer);

    shader.setTexture('uDepthTexIndex', 0, depthTexture);
    shader.setTexture('uFogTexIndex',   1, fogTexture);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
    framebuffer.disable();

    GL.viewport(0, 0, APP.width, APP.height);
  }

  destroy () {
    this.shader.destroy();
    this.framebuffer.destroy();
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();
  }
};