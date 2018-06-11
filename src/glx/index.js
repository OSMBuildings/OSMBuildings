
module.exports = class GLX {

  constructor(canvas, quickRender) {
    this.GL = null;

    const canvasOptions = {
      antialias: !quickRender,
      depth: true,
      premultipliedAlpha: false
    };

    try {
      this.GL = canvas.getContext('webgl', canvasOptions);
    } catch (ex) {}

    if (!this.GL) {
      try {
        this.GL = canvas.getContext('experimental-webgl', canvasOptions);
      } catch (ex) {}
    }

    if (!this.GL) {
      throw new Error('GL not supported');
    }

    canvas.addEventListener('webglcontextlost', e => {
      console.warn('context lost');
    });

    canvas.addEventListener('webglcontextrestored', e => {
      console.warn('context restored');
    });

    this.GL.viewport(0, 0, canvas.width, canvas.height);
    this.GL.cullFace(this.GL.BACK);
    this.GL.enable(this.GL.CULL_FACE);
    this.GL.enable(this.GL.DEPTH_TEST);
    this.GL.clearColor(0.5, 0.5, 0.5, 1);

    if (!quickRender) { // TODO always active but use dynamically
      this.GL.anisotropyExtension = this.GL.getExtension('EXT_texture_filter_anisotropic');
      if (this.GL.anisotropyExtension) {
        this.GL.anisotropyExtension.maxAnisotropyLevel = this.GL.getParameter(this.GL.anisotropyExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      }
      this.GL.depthTextureExtension = this.GL.getExtension('WEBGL_depth_texture');
    }
  }

  destroy () {
    const ext = this.GL.getExtension('WEBGL_lose_context');
    ext.loseContext();
    this.GL = null;
  }
};

GLX.Texture = require('./texture');
GLX.Buffer = require('./Buffer.js');
GLX.Framebuffer = require('./Framebuffer.js');
GLX.Matrix = require('./Matrix.js');
GLX.Shader = require('./Shader.js');
