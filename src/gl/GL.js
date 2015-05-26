
var GL = {};

GL.Buffer = function(itemSize, data) {
  this.id = gl.createBuffer();
  this.itemSize = itemSize;
  this.numItems = data.length/itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, this.id);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  data = null;
};

GL.Buffer.prototype.enable = function() {
  gl.bindBuffer(gl.ARRAY_BUFFER, this.id);
};

GL.Buffer.prototype.destroy = function() {
  gl.deleteBuffer(this.id);
};
