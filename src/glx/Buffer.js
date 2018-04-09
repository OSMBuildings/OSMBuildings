GLX.Buffer = class {

  constructor (itemSize, data) {
    this.id = GL.createBuffer();
    this.itemSize = itemSize;
    this.numItems = data.length / itemSize;
    GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
    GL.bufferData(GL.ARRAY_BUFFER, data, GL.STATIC_DRAW);
    data = null; // gc
  }

  // DEPRECATED
  enable () {
    GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
  }

  use () {
    GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
  }

  destroy () {
    GL.deleteBuffer(this.id);
    this.id = null;
  }
};
