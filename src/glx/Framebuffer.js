
const texture = require('./texture');

module.exports = class Framebuffer {

  constructor(GL, width, height, useDepthTexture) {
    this.GL = GL;
    if (useDepthTexture && !this.GL.depthTextureExtension) {
      throw new Error('Depth textures are not supported');
    }

    this.useDepthTexture = !!useDepthTexture;
    this.setSize(width, height);
  }

  setSize(width, height) {
    if (!this.frameBuffer) {
      this.frameBuffer = this.GL.createFramebuffer(GL);
    } else if (width === this.width && height === this.height) { // already has the right size
      return;
    }

    this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, this.frameBuffer);

    this.width  = width;
    this.height = height;
    
    if (this.depthRenderBuffer) {
      this.GL.deleteRenderbuffer(this.depthRenderBuffer);
      this.depthRenderBuffer = null;
    } 
    
    if (this.depthTexture) {
      this.depthTexture.destroy();
      this.depthTexture = null;
    }
    
    if (this.useDepthTexture) {
      this.depthTexture = new texture.Image(GL); // this.GL.createTexture();
      this.depthTexture.enable(0);
      this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MIN_FILTER, this.GL.NEAREST);
      this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MAG_FILTER, this.GL.NEAREST);
      // CLAMP_TO_EDGE is required for NPOT textures
      this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_S, this.GL.CLAMP_TO_EDGE);
      this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_T, this.GL.CLAMP_TO_EDGE);
      this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.DEPTH_STENCIL, width, height, 0, this.GL.DEPTH_STENCIL, this.GL.depthTextureExtension.UNSIGNED_INT_24_8_WEBGL, null);
      this.GL.framebufferTexture2D(this.GL.FRAMEBUFFER, this.GL.DEPTH_STENCIL_ATTACHMENT, this.GL.TEXTURE_2D, this.depthTexture.id, 0);
    } else {
      this.depthRenderBuffer = this.GL.createRenderbuffer();
      this.GL.bindRenderbuffer(this.GL.RENDERBUFFER, this.depthRenderBuffer);
      this.GL.renderbufferStorage(this.GL.RENDERBUFFER, this.GL.DEPTH_COMPONENT16, width, height);
      this.GL.framebufferRenderbuffer(this.GL.FRAMEBUFFER, this.GL.DEPTH_ATTACHMENT, this.GL.RENDERBUFFER, this.depthRenderBuffer);
    }

    if (this.renderTexture) {
      this.renderTexture.destroy();
    }

    this.renderTexture = new texture.Data(this.GL, width, height);
    this.GL.bindTexture(this.GL.TEXTURE_2D, this.renderTexture.id);

    this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_S, this.GL.CLAMP_TO_EDGE); //necessary for NPOT textures
    this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_T, this.GL.CLAMP_TO_EDGE);
    this.GL.framebufferTexture2D(this.GL.FRAMEBUFFER, this.GL.COLOR_ATTACHMENT0, this.GL.TEXTURE_2D, this.renderTexture.id, 0);

    if (this.GL.checkFramebufferStatus(this.GL.FRAMEBUFFER) !== this.GL.FRAMEBUFFER_COMPLETE) {
      throw new Error('Combination of framebuffer attachments doesn\'t work');
    }

    this.GL.bindRenderbuffer(this.GL.RENDERBUFFER, null);
    this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, null);
  }

  enable() {
    this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, this.frameBuffer);

    if (!this.useDepthTexture) {
      this.GL.bindRenderbuffer(this.GL.RENDERBUFFER, this.depthRenderBuffer);
    }
  }

  disable() {
    this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, null);
    if (!this.useDepthTexture) {
      this.GL.bindRenderbuffer(this.GL.RENDERBUFFER, null);
    }
  }

  getPixel(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return;
    }
    const imageData = new Uint8Array(4);
    this.GL.readPixels(x, y, 1, 1, this.GL.RGBA, this.GL.UNSIGNED_BYTE, imageData);
    return imageData;
  }

  getData() {
    const imageData = new Uint8Array(this.width*this.height*4);
    this.GL.readPixels(0, 0, this.width, this.height, this.GL.RGBA, this.GL.UNSIGNED_BYTE, imageData);
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
