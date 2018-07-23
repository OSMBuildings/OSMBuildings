
GLX.texture.Data = class {

  constructor(GL, width, height, data) {
    this.id = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, this.id);

    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);

    let bytes = null;
    if (data) {
      const length = width*height*4;
      bytes = new Uint8Array(length);
      bytes.set(data.subarray(0, length));
    }

    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, bytes);
    GL.bindTexture(GL.TEXTURE_2D, null);

    this.GL = GL;
  }

  enable(index) {
    this.GL.activeTexture(this.GL.TEXTURE0 + (index || 0));
    this.GL.bindTexture(this.GL.TEXTURE_2D, this.id);
  }

  destroy() {
    this.GL.bindTexture(this.GL.TEXTURE_2D, null);
    this.GL.deleteTexture(this.id);
    this.id = null;
  }
};
