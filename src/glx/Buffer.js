
glx.Buffer = function(itemSize, data) {
  this.id = GL.createBuffer();
  this.itemSize = itemSize;
  this.numItems = data.length/itemSize;
  GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
  GL.bufferData(GL.ARRAY_BUFFER, data, GL.STATIC_DRAW);
  data = null;
};

glx.Buffer.prototype = {
  enable: function() {
    GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
  },

  destroy: function() {
    GL.deleteBuffer(this.id);
    this.id = null;
  }
};
