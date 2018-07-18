View.Blur = class {

  constructor () {
    this.shader = new GLX.Shader({
      source: shaders.blur,
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uInverseTexSize', 'uTexIndex']
    });

    this.framebuffer = new GLX.Framebuffer(128, 128); // dummy value, size will be set dynamically

    this.vertexBuffer = new GLX.Buffer(3, new Float32Array([
      -1, -1, 1E-5,
      1, -1, 1E-5,
      1, 1, 1E-5,
      -1, -1, 1E-5,
      1, 1, 1E-5,
      -1, 1, 1E-5
    ]));

    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1
    ]));
  }

  render (texture, size) {
    this.framebuffer.setSize(size[0], size[1]);
    GL.viewport(0, 0, size[0], size[1]);

    this.shader.enable();
    this.framebuffer.enable();

    GL.clearColor(1, 0, 0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    this.shader.setParam('uInverseTexSize', '2fv', [1 / this.framebuffer.width, 1 / this.framebuffer.height]);

    this.shader.setBuffer('aPosition', this.vertexBuffer);
    this.shader.setBuffer('aTexCoord', this.texCoordBuffer);

    this.shader.setTexture('uTexIndex', 0, texture);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    this.shader.disable();
    this.framebuffer.disable();

    GL.viewport(0, 0, APP.width, APP.height);
  }

  destroy () {
    this.shader.destroy();
    this.framebuffer.destroy();
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();
  }
};