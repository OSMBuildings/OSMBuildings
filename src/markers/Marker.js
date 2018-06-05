class Marker {

  constructor (options = {}) {
    this.offsetX = options.offsetX || 0;
    this.offsetY = options.offsetY || 0;
    this.position = options.position || { latitude: 0, longitude: 0 };
    this.elevation = options.elevation || 1;
    this.source = options.source;
    this.isReady = false;
    this.anchor = options.anchor || 'bottom';
    this.scale = options.scale || 1;

    APP.markers.add(this);
    this.load();
  }

  load () {
    if (!this.source) {
      // console.log('no marker source');
      this.loadDefaultIcon();
      return;
    }

    this.texture = new GLX.texture.Image().load(this.source, image => {
      if (!image) {
        console.log(`can't read marker icon ${this.source}`);
        this.loadDefaultIcon();
        return;
      }

      this.setTexture(image);
      this.setBuffers();
      this.isReady = true;
    });
  }

  setTexture (image) {
    // Whole texture will be mapped to fit the tile exactly.
    // So don't attempt to wrap around the texture coordinates.

    GL.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    GL.bindTexture(GL.TEXTURE_2D, this.texture.id);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR); // fit texture to vertex

    this.size = image.width / 20 * this.scale;
    // this.size = image.width / 100 * this.scale; // for default icon?
  }

  setBuffers () {
    const texCoords = [
      0, 0,
      1, 0,
      0, 1,
      1, 1,
      0, 1,
      1, 0
    ];

    const halfSize = this.size / 2;
    const anchorsCoordPool = {
      center: [halfSize, halfSize, halfSize, halfSize],
      top: [0, halfSize, this.size, halfSize],
      bottom: [this.size, halfSize, 0, halfSize],
      left: [halfSize, 0, halfSize, this.size],
      right: [halfSize, this.size, halfSize, 0],
      top_left: [0, 0, this.size, this.size],
      top_right: [0, this.size, this.size, 0],
      bottom_left: [this.size, -this.size, 0, 0],
      bottom_right: [this.size, this.size, 0, 0]
    };

    const anchorCoord = anchorsCoordPool[this.anchor] || anchorsCoordPool.center;

    const vertices = [
      this.offsetX - anchorCoord[1], this.offsetY - anchorCoord[0], 0,  // upper left
      this.offsetX + anchorCoord[3], this.offsetY - anchorCoord[0], 0, // upper right
      this.offsetX - anchorCoord[1], this.offsetY + anchorCoord[2], 0,  // bottom left
      this.offsetX + anchorCoord[3], this.offsetY + anchorCoord[2], 0, // bottom right
      this.offsetX - anchorCoord[1], this.offsetY + anchorCoord[2], 0,  // bottom left
      this.offsetX + anchorCoord[3], this.offsetY - anchorCoord[0], 0  // upper right
    ];

    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(texCoords));
    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));
  }

  loadDefaultIcon () {
    this.texture = new GLX.texture.Image().load(MARKER_TEXTURE, image => {
      if (!image) {
        return;
      }

      this.setTexture(image);
      this.setBuffers();
      this.isReady = true;
    });
  }

  destroy () {
    this.isReady = false;

    APP.markers.remove(this);

    this.texCoordBuffer && this.texCoordBuffer.destroy();
    this.texCoordBuffer && this.vertexBuffer.destroy();
    this.texture && this.texture.destroy();
  }
}
