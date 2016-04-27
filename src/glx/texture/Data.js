
GLX.texture.Data = function(width, height, data, options) {
  //options = options || {};

  this.id = GL.createTexture();
  GL.bindTexture(GL.TEXTURE_2D, this.id);

  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);

  var bytes = null;

  if (data) {
    var length = width*height*4;
    bytes = new Uint8Array(length);
    bytes.set(data.subarray(0, length));
  }

  GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, bytes);
  GL.bindTexture(GL.TEXTURE_2D, null);
};

GLX.texture.Data.prototype = {

  enable: function(index) {
    GL.activeTexture(GL.TEXTURE0 + (index || 0));
    GL.bindTexture(GL.TEXTURE_2D, this.id);
    return this;
  },

  destroy: function() {
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.deleteTexture(this.id);
    this.id = null;
  }
};
