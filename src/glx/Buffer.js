
module.exports = class Buffer {

  constructor (GL, itemSize, data) {
    this.GL = GL;
    this.id = this.GL.createBuffer();
    this.itemSize = itemSize;
    this.numItems = data.length / itemSize;
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.id);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, data, GL.STATIC_DRAW);
  }

  // should be deprecated in favor to use()
  enable () {
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.id);
  }

  use () {
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.id);
  }

  destroy () {
    this.GL.deleteBuffer(this.id);
    this.id = null;
  }
};
