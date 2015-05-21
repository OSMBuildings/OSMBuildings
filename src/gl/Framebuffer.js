
GL.Framebuffer = function(width, height) {
  this.originalWidth  = width;
  this.originalHeight = height;
  this.size = nextPowerOf2(Math.max(width, height));

  this.frameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

  this.renderBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.size, this.size);

  var renderTexture = new GL.Texture({ size:this.size });
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture.id, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);

  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error('This combination of framebuffer attachments does not work');
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
};

GL.Framebuffer.prototype = {

  enable: function() {
    gl.viewport(0, 0, this.size, this.size);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
  },

  disable: function() {
    gl.viewport(0, 0, this.originalWidth, this.originalHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  },

  getData: function() {
    var imageData = new Uint8Array(this.originalWidth*this.originalHeight*4);
    gl.readPixels(0, 0, this.originalWidth, this.originalHeight, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    return imageData;
  },

  destroy: function() {}
};
