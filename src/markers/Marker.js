class Marker {

  constructor (options = {}) {

    this.offsetX = options.offsetX || 0;
    this.offsetY = options.offsetY || 0;
    this.position = options.position || { latitude: 0, longitude: 0 };
    this.elevation = options.elevation || 1;
    this.source = options.source;
    this.isReady = false;
    this._size = 1;
    this.anchor = options.anchor || 'bottom';
    this._scale = options.scale || 1;

    APP.markers.add(this);
    this.load();
  }

  load () {

    if(this.source){
      this.texture = new GLX.texture.Image().load(this.source, image => {

        if (image) {

          /* Whole texture will be mapped to fit the tile exactly. So
           * don't attempt to wrap around the texture coordinates. */

          GL.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
          GL.bindTexture(GL.TEXTURE_2D, this.texture.id);
          GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
          GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
          // fits texture to vertex
          GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);

          this.isReady = true;
          this.size = image.width/20*this._scale;

          this.loadBuffer();

        }
        else {
          console.log("can not read marker source");
          this.loadStandardIcon();
        }
      });
    } else {
      console.log("no marker source");
      this.loadStandardIcon();

    }
  }

  loadBuffer(){

    const texCoords = [
      0, 0,
      1, 0,
      0, 1,
      1, 1,
      0, 1,
      1, 0
    ];

    const anchorsCoordPool = {
      center: [this.size/2, this.size/2, this.size/2, this.size/2],
      top: [0, this.size/2, this.size, this.size/2],
      bottom: [this.size, this.size/2, 0, this.size/2],
      left: [this.size/2, 0, this.size/2, this.size],
      right: [this.size/2, this.size, this.size/2, 0],
      top_left: [0, 0, this.size, this.size],
      top_right: [0, this.size, this.size, 0],
      bottom_left: [this.size, -this.size, 0, 0],
      bottom_right: [this.size, this.size, 0, 0]

    };

    let anchorCoord = [this.size/2, this.size/2, this.size/2, this.size/2];

    for (let prop in anchorsCoordPool) {
        if(this.anchor === prop){
          anchorCoord = anchorsCoordPool[prop];
        }
    }

    const vertices = [
      this.offsetX - anchorCoord[1], this.offsetY - anchorCoord[0], 0,  // upper left
      this.offsetX + anchorCoord[3], this.offsetY - anchorCoord[0], 0 , // upper right
      this.offsetX - anchorCoord[1], this.offsetY + anchorCoord[2], 0,  // bottom left
      this.offsetX + anchorCoord[3], this.offsetY + anchorCoord[2] , 0, // bottom right
      this.offsetX - anchorCoord[1], this.offsetY + anchorCoord[2], 0,  // bottom left
      this.offsetX + anchorCoord[3], this.offsetY - anchorCoord[0] , 0  // upper right
    ];

    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(texCoords));
    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

  }

  loadStandardIcon(){
    this.texture = new GLX.texture.Image().load(MARKER_TEXTURE, image => {

      if (image) {

        /* Whole texture will be mapped to fit the tile exactly. So
         * don't attempt to wrap around the texture coordinates. */

        GL.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        GL.bindTexture(GL.TEXTURE_2D, this.texture.id);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
        // fits texture to vertex
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);

        this.isReady = true;
        this.source = 'Standard Icon';
        this.size = image.width/100*this._scale;
        this.loadBuffer();

      }
    });

  }

  destroy () {
    APP.markers.remove(this);

    this.texCoordBuffer.destroy();
    this.vertexBuffer.destroy();

    if (this.isReady) {
      this.texture.destroy();
    }
  }
}