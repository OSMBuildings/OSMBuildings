class BitmapTile extends Tile {

  constructor (x, y, zoom) {
    super(x, y, zoom);

    this.latitude = tile2lat(y, zoom);
    this.longitude = tile2lon(x, zoom);

    // note: due to Mercator projection the tile width in meters is equal to tile height in meters.
    const size = getTileSizeInMeters(this.latitude, zoom);

    const vertices = [
      size, size, 0,
      size, 0, 0,
      0, size, 0,
      0, 0, 0
    ];

    const texCoords = [
      1, 0,
      1, 1,
      0, 0,
      0, 1
    ];

    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));
    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(texCoords));
  }

  load (url, callback) {
    this.texture = new GLX.texture.Image();
    this.texture.load(url, image => {
      if (image) {

        /* Whole texture will be mapped to fit the tile exactly. So
         * don't attempt to wrap around the texture coordinates. */
        GL.bindTexture(GL.TEXTURE_2D, this.texture.id);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

        this.isReady = true;
      }

      if (callback) {
        callback();
      }
    });
  }

  destroy () {
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();

    if (this.texture) {
      this.texture.destroy();
    }
  }
}
