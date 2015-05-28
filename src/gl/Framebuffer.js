
GL.Framebuffer = function(width, height) {

  this.frameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

  this.renderBuffer = gl.createRenderbuffer();
  this.setSize(width, height);

  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.renderTexture.id, 0); ////////

  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error('This combination of framebuffer attachments does not work');
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
};

GL.Framebuffer.prototype = {

  setSize: function(width, height) {
    this.width  = width  || Scene.width;
    this.height = height || Scene.height;
    var size = nextPowerOf2(Math.max(this.width, this.height));

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size);

    if (this.renderTexture) {
      this.renderTexture.destroy();
    }

    this.renderTexture = new GL.Texture({ size:size });
  },

  enable: function() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
  },

  disable: function() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  },

  getData: function() {
    var imageData = new Uint8Array(this.width*this.height*4);
    gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    return imageData;
  },

  destroy: function() {}
};
