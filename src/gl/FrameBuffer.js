
var FrameBuffer = function(width, height, options) {
  options = options || {};

  this.width   = width;
  this.height  = height;
  this.texture = new Texture(width, height, options.texture);

  this.id = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.id, 0);

  this.renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
  this.renderbuffer.width = this.width;
  this.renderbuffer.height = this.height;
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);

  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
   throw new Error('This combination of framebuffer attachments does not work');
  }

  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  this.texture.end();
};

FrameBuffer.prototype = {
  use: function() {
    this.viewport = gl.getParameter(gl.VIEWPORT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.viewport(0, 0, this.width, this.height);
    return this;
  },

  end: function() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.viewport(this.viewport[0], this.viewport[1], this.viewport[2], this.viewport[3]);
  }
};
