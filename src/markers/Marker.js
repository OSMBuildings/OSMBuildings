
const GLX = require('../glx');

class Marker {

  constructor (options = {}) {
    this.position = { altitude: 0, ...options.position };
    this.source = options.source;
    this.anchor = options.anchor || 'bottom';
    this.scale = options.scale || 1; // TODO -> size

    this.load();
  }

  load () {
    if (!this.source) {
      console.log('no marker icon, loading default');
      this.loadDefaultIcon();
      return;
    }

    this.texture = new GLX.texture.Image(GL).load(this.source, image => {
      if (!image) {
        console.log(`can't read marker icon ${this.source}`);
        this.loadDefaultIcon();
        return;
      }

      this.setTexture(image);
      this.setBuffers();
      APP.markers.add(this);
    });
  }

  loadDefaultIcon () {
    this.texture = new GLX.texture.Image(GL).load(MARKER_TEXTURE, image => {
      if (!image) {
        return;
      }

      this.setTexture(image);
      this.setBuffers();
      APP.markers.add(this);
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
      -anchorCoord[1], -anchorCoord[0], 0, // upper left
       anchorCoord[3], -anchorCoord[0], 0, // upper right
      -anchorCoord[1],  anchorCoord[2], 0, // bottom left
       anchorCoord[3],  anchorCoord[2], 0, // bottom right
      -anchorCoord[1],  anchorCoord[2], 0, // bottom left
       anchorCoord[3], -anchorCoord[0], 0  // upper right
    ];

    this.texCoordBuffer = new GLX.Buffer(GL, 2, new Float32Array(texCoords));
    this.vertexBuffer = new GLX.Buffer(GL, 3, new Float32Array(vertices));
  }

  destroy () {
    APP.markers.remove(this);
    this.texCoordBuffer && this.texCoordBuffer.destroy();
    this.texCoordBuffer && this.vertexBuffer.destroy();
    this.texture && this.texture.destroy();
  }
}
