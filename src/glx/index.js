
class GLX {

  constructor(canvas, fastMode) {
    let GL;

    const canvasOptions = {
      antialias: !fastMode,
      depth: true,
      premultipliedAlpha: false
    };

    try {
      GL = canvas.getContext('webgl', canvasOptions);
    } catch (ex) {}

    if (!GL) {
      try {
        GL = canvas.getContext('experimental-webgl', canvasOptions);
      } catch (ex) {}
    }

    if (!GL) {
      throw new Error('GL not supported');
    }

    canvas.addEventListener('webglcontextlost', e => {
      console.warn('context lost');
    });

    canvas.addEventListener('webglcontextrestored', e => {
      console.warn('context restored');
    });

    GL.viewport(0, 0, canvas.width, canvas.height);
    GL.cullFace(GL.BACK);
    GL.enable(GL.CULL_FACE);
    GL.enable(GL.DEPTH_TEST);
    GL.clearColor(0.5, 0.5, 0.5, 1);

    if (!fastMode) { // TODO OSMB4 always activate but use dynamically
      GL.anisotropyExtension = GL.getExtension('EXT_texture_filter_anisotropic');
      if (GL.anisotropyExtension) {
        GL.anisotropyExtension.maxAnisotropyLevel = GL.getParameter(GL.anisotropyExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      }
      GL.depthTextureExtension = GL.getExtension('WEBGL_depth_texture');
    }

    this.GL = GL;
  }

  destroy () {
    const ext = this.GL.getExtension('WEBGL_lose_context');
    ext.loseContext();
    this.GL = null;
  }
}
