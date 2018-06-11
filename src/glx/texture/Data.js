
module.exports = class Data {

  constructor(GL, width, height, data) {
    this.GL = GL;
    this.id = this.GL.createTexture();
    this.GL.bindTexture(this.GL.TEXTURE_2D, this.id);

    this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MIN_FILTER, this.GL.NEAREST);
    this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MAG_FILTER, this.GL.NEAREST);

    let bytes = null;
    if (data) {
      const length = width*height*4;
      bytes = new Uint8Array(length);
      bytes.set(data.subarray(0, length));
    }

    this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, width, height, 0, this.GL.RGBA, this.GL.UNSIGNED_BYTE, bytes);
    this.GL.bindTexture(this.GL.TEXTURE_2D, null);
  }

  enable(index) {
    this.GL.activeTexture(this.GL.TEXTURE0 + (index || 0));
    this.GL.bindTexture(this.GL.TEXTURE_2D, this.id);
    return this;
  }

  destroy() {
    this.GL.bindTexture(this.GL.TEXTURE_2D, null);
    this.GL.deleteTexture(this.id);
    this.id = null;
  }
};
