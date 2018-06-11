
module.exports = class Image {

  constructor (GL) {
    this.GL = GL;
    this.id = this.GL.createTexture();
    this.GL.bindTexture(this.GL.TEXTURE_2D, this.id);

//this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_S, this.GL.CLAMP_TO_EDGE);
//this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_T, this.GL.CLAMP_TO_EDGE);

    this.GL.bindTexture(this.GL.TEXTURE_2D, null);
  }

  clamp (image, maxSize) {
    if (image.width <= maxSize && image.height <= maxSize) {
      return image;
    }

    let w = maxSize, h = maxSize;
    const ratio = image.width/image.height;
    // TODO: if other dimension doesn't fit to POT after resize, there is still trouble
    if (ratio < 1) {
      w = Math.round(h*ratio);
    } else {
      h = Math.round(w/ratio);
    }

    const canvas = document.createElement('CANVAS');
    canvas.width  = w;
    canvas.height = h;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  load (url, callback) {
    const image = new Image();
    image.crossOrigin = '*';
    image.onload = img => {
      this.set(image);
      if (callback) {
        callback(image);
      }
    };
    image.onerror = img => {
      if (callback) {
        callback();
      }
    };
    image.src = url;
    return this;
  }

  color (color) {
    this.GL.bindTexture(this.GL.TEXTURE_2D, this.id);
    this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MIN_FILTER, this.GL.LINEAR);
    this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MAG_FILTER, this.GL.LINEAR);
    this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, 1, 1, 0, this.GL.RGBA, this.GL.UNSIGNED_BYTE, new Uint8Array([color[0]*255, color[1]*255, color[2]*255, (color[3] === undefined ? 1 : color[3])*255]));
    this.GL.bindTexture(this.GL.TEXTURE_2D, null);
    return this;
  }

  set (image) {
    if (!this.id) {
      // texture had been destroyed
      return;
    }

    image = this.clamp(image, this.GL.getParameter(this.GL.MAX_TEXTURE_SIZE));

    this.GL.bindTexture(this.GL.TEXTURE_2D, this.id);
    this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MIN_FILTER, this.GL.LINEAR_MIPMAP_NEAREST);
    this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MAG_FILTER, this.GL.LINEAR);

    this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, this.GL.RGBA, this.GL.UNSIGNED_BYTE, image);
    this.GL.generateMipmap(this.GL.TEXTURE_2D);

    if (this.GL.anisotropyExtension) { // TODO OSMB4 use this dynamically
      this.GL.texParameterf(this.GL.TEXTURE_2D, this.GL.anisotropyExtension.TEXTURE_MAX_ANISOTROPY_EXT, this.GL.anisotropyExtension.maxAnisotropyLevel);
    }

    this.GL.bindTexture(this.GL.TEXTURE_2D, null);
    return this;
  }

  enable (index) {
    if (!this.id) {
      return;
    }
    this.GL.activeTexture(this.GL.TEXTURE0 + (index || 0));
    this.GL.bindTexture(this.GL.TEXTURE_2D, this.id);
    return this;
  }

  destroy () {
    this.GL.bindTexture(this.GL.TEXTURE_2D, null);
    this.GL.deleteTexture(this.id);
    this.id = null;
  }
};
