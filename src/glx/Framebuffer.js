
glx.Framebuffer = function(width, height) {
  this.setSize(width, height);
};

glx.Framebuffer.prototype = {

  setSize: function(width, height) {
    this.frameBuffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);

    width = glx.util.nextPowerOf2(width);
    height= glx.util.nextPowerOf2(height);
    
    // already has the right size
    if (width === this.width && height === this.height) {
      return;
    }

    this.width  = width;
    this.height = height;

    this.renderBuffer = GL.createRenderbuffer();
    GL.bindRenderbuffer(GL.RENDERBUFFER, this.renderBuffer);
    GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, width, height);

    if (this.renderTexture) {
      this.renderTexture.destroy();
    }

    this.renderTexture = new glx.texture.Data(width, height);

    GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.renderTexture.id, 0);

    if (GL.checkFramebufferStatus(GL.FRAMEBUFFER) !== GL.FRAMEBUFFER_COMPLETE) {
      throw new Error('This combination of framebuffer attachments does not work');
    }

    GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
  },

  enable: function() {
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);
    GL.bindRenderbuffer(GL.RENDERBUFFER, this.renderBuffer);
  },

  disable: function() {
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    GL.bindRenderbuffer(GL.RENDERBUFFER, null);
  },

  getPixel: function(x, y) {
    var imageData = new Uint8Array(4);
    GL.readPixels(x,y,1,1,GL.RGBA, GL.UNSIGNED_BYTE, imageData);
    return imageData;
  },

  getData: function() {
    var imageData = new Uint8Array(this.width*this.height*4);
    GL.readPixels(0, 0, this.width, this.height, GL.RGBA, GL.UNSIGNED_BYTE, imageData);
    return imageData;
  },

  destroy: function() {
    if (this.renderTexture) {
      this.renderTexture.destroy();
    }
  }
};
