
basemap.Tile = function(x, y, zoom) {
  this.x = x;
  this.y = y;
  this.zoom = zoom;
  this.key = [x, y, zoom].join(',');

  var numSegments = 4;

  var meshStep = 256/numSegments;
  var textureStep = 1/numSegments;

  var vertices = [];
  var texCoords = [];

  // TODO: can probably be 1x1 again when better fog is in place
  for (var cols = 0; cols < numSegments; cols++) {
    for (var rows = 0; rows < numSegments; rows++) {
      vertices.push(
        (cols+1)*meshStep, (rows+1)*meshStep, 0,
        (cols+1)*meshStep, (rows+0)*meshStep, 0,
        (cols+0)*meshStep, (rows+1)*meshStep, 0,
        (cols+0)*meshStep, (rows+0)*meshStep, 0
      );

      texCoords.push(
        (cols+1)*textureStep, (rows+1)*textureStep,
        (cols+1)*textureStep, (rows+0)*textureStep,
        (cols+0)*textureStep, (rows+1)*textureStep,
        (cols+0)*textureStep, (rows+0)*textureStep
      );
    }
  }

  this.vertexBuffer = new glx.Buffer(3, new Float32Array(vertices));
  this.texCoordBuffer = new glx.Buffer(2, new Float32Array(texCoords));
};

basemap.Tile.prototype = {
  load: function(url) {
    Activity.setBusy();
    this.texture = new glx.texture.Image().load(url, function(image) {
      Activity.setIdle();
      if (image) {
        this.isReady = true;
        /* The whole texture will be mapped to fit the whole tile exactly. So
         * don't attempt to wrap around the texture coordinates. */
        gl.bindTexture(gl.TEXTURE_2D, this.texture.id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      }
    }.bind(this));
  },

  destroy: function() {
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();
    if (this.texture) {
      this.texture.destroy();
    }
  }
};
