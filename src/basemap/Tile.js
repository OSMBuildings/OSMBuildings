
basemap.Tile = function(x, y, zoom) {
  this.x = x;
  this.y = y;
  this.latitude = tile2lat(y, zoom);
  this.longitude= tile2lon(x, zoom);
  this.zoom = zoom;
  this.key = [x, y, zoom].join(',');

  // note: due to the Mercator projection the tile width in meters is equal
  //       to the tile height in meters.
  var size = getTileSizeInMeters( this.latitude, zoom);
  
  var vertices = [
    size, size, 0,
    size,    0, 0,
       0, size, 0,
       0,    0, 0
  ];

  var texCoords = [
    1, 1,
    1, 0,
    0, 1,
    0, 0
  ];

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
