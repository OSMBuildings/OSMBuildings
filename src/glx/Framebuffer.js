
GLX.Framebuffer = class {

  constructor(width, height, useDepthTexture) {
    if (useDepthTexture && !GL.depthTextureExtension) {
      throw new Error('GL: Depth textures are not supported');
    }

    this.useDepthTexture = !!useDepthTexture;
    this.setSize(width, height);
  }

  setSize(width, height) {
    if (!this.frameBuffer) {
      this.frameBuffer = GL.createFramebuffer();
    } else if (width === this.width && height === this.height) { // already has the right size
      return;
    }

    GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);

    this.width  = width;
    this.height = height;
    
    if (this.depthRenderBuffer) {
      GL.deleteRenderbuffer(this.depthRenderBuffer);
      this.depthRenderBuffer = null;
    } 
    
    if (this.depthTexture) {
      this.depthTexture.destroy();
      this.depthTexture = null;
    }
    
    if (this.useDepthTexture) {
      this.depthTexture = new GLX.texture.Image(); // GL.createTexture();
      this.depthTexture.enable(0);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
      // CLAMP_TO_EDGE is required for NPOT textures
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      GL.texImage2D(GL.TEXTURE_2D, 0, GL.DEPTH_STENCIL, width, height, 0, GL.DEPTH_STENCIL, GL.depthTextureExtension.UNSIGNED_INT_24_8_WEBGL, null);
      GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.TEXTURE_2D, this.depthTexture.id, 0);
    } else {
      this.depthRenderBuffer = GL.createRenderbuffer();
      GL.bindRenderbuffer(GL.RENDERBUFFER, this.depthRenderBuffer);
      GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, width, height);
      GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.depthRenderBuffer);
    }

    if (this.renderTexture) {
      this.renderTexture.destroy();
    }

    this.renderTexture = new GLX.texture.Data(GL, width, height);
    GL.bindTexture(GL.TEXTURE_2D, this.renderTexture.id);

    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE); //necessary for NPOT textures
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.renderTexture.id, 0);

    if (GL.checkFramebufferStatus(GL.FRAMEBUFFER) !== GL.FRAMEBUFFER_COMPLETE) {
      throw new Error('Combination of framebuffer attachments doesn\'t work');
    }

    GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
  }

  enable() {
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);

    if (!this.useDepthTexture) {
      GL.bindRenderbuffer(GL.RENDERBUFFER, this.depthRenderBuffer);
    }
  }

  disable() {
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    if (!this.useDepthTexture) {
      GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    }
  }

  getPixel(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return;
    }
    const imageData = new Uint8Array(4);
    GL.readPixels(x, y, 1, 1, GL.RGBA, GL.UNSIGNED_BYTE, imageData);
    return imageData;
  }

  getData() {
    const imageData = new Uint8Array(this.width*this.height*4);
    GL.readPixels(0, 0, this.width, this.height, GL.RGBA, GL.UNSIGNED_BYTE, imageData);
    return imageData;
  }

  destroy() {
    if (this.renderTexture) {
      this.renderTexture.destroy();
    }
    
    if (this.depthTexture) {
      this.depthTexture.destroy();
    }
  }
};
