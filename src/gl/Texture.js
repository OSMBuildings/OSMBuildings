
gl.Texture = function(options) {
  options = options || {};

  this.id = GL.createTexture();
  GL.bindTexture(GL.TEXTURE_2D, this.id);

  if (options.size) {
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, options.size, options.size, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
  } else {
    GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, options.filter || GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
//  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
//  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

    if (options.image) {
      this.setImage(options.image);
    }

    GL.bindTexture(GL.TEXTURE_2D, null);
  }
};

gl.Texture.prototype = {
  enable: function(index) {
    GL.bindTexture(GL.TEXTURE_2D, this.id);
    GL.activeTexture(GL.TEXTURE0 + (index || 0));
  },

  disable: function() {
    GL.bindTexture(GL.TEXTURE_2D, null);
  },

  load: function(url, callback) {
    var image = this.image = new Image();
    image.crossOrigin = '*';
    image.onload = function() {
      setIdle(url);

      // TODO: do this only once
      var maxTexSize = GL.getParameter(GL.MAX_TEXTURE_SIZE);
      if (image.width > maxTexSize || image.height > maxTexSize) {
        var w = maxTexSize, h = maxTexSize;
        var ratio = image.width/image.height;
        // TODO: if other dimension doesn't fit to POT after resize, there is still trouble
        if (ratio < 1) {
          w = Math.round(h*ratio);
        } else {
          h = Math.round(w/ratio);
        }

        var canvas = document.createElement('CANVAS');
        canvas.width  = w;
        canvas.height = h;

        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        image = canvas;
      }

      this.setImage(image);
      this.isLoaded = true;

      if (callback) {
        callback();
      }

    }.bind(this);

    image.onerror = function() {
      setIdle(url);
    };

    setBusy(url);
    image.src = url;
  },

  setImage: function(image) {
    GL.bindTexture(GL.TEXTURE_2D, this.id);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
    GL.generateMipmap(GL.TEXTURE_2D);
    image = null;
  },

  destroy: function() {
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.deleteTexture(this.id);
    if (this.image) {
      this.isLoaded = null;
      setIdle(this.image.src);
      this.image.src = '';
      this.image = null;
    }
  }
};
