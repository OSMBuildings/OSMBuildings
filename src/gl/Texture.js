
GL.Texture = function(options) {
  options = options || {};

  this.id = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.id);

  if (options.size) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, options.size, options.size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  } else {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.filter || gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    if (options.image) {
      this.setImage(options.image);
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
  }
};

GL.Texture.prototype = {
  enable: function(index) {
    gl.bindTexture(gl.TEXTURE_2D, this.id);
    gl.activeTexture(gl.TEXTURE0 + (index || 0));
  },

  disable: function() {
    gl.bindTexture(gl.TEXTURE_2D, null);
  },

  load: function(url, callback) {
    var image = this.image = new Image();
    image.crossOrigin = '*';
    image.onload = function() {
      // TODO: do this only once
      var maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
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

    image.src = url;
  },

  setImage: function(image) {
    gl.bindTexture(gl.TEXTURE_2D, this.id);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    image = null;
  },

  destroy: function() {
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.deleteTexture(this.id);
    if (this.image) {
      this.isLoaded = null;
      this.image.src = '';
      this.image = null;
    }
  }
};
