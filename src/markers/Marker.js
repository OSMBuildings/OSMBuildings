class Marker {

  constructor (options = {}) {

    this.offsetX = options.offsetX || 0;
    this.offsetY = options.offsetY || 0;
    this.position = options.position || { latitude: 0, longitude: 0 };
    this.elevation = options.elevation || 30;
    this.source = options.source;
    this.isReady = false;
    this.size = options.size || 1;

    Markers.add(this);
    this.load();
  }

  load () {

    const texCoords = [
      0, 0,
      1, 0,
      0, 1,
      1, 1,
      0, 1,
      1, 0
    ];

    const
      w2 = this.size / 2,
      h2 = this.size / 2;

    const vertices = [
      -w2, -h2, 0,
      w2, -h2, 0,
      -w2, h2, 0,
      w2, h2, 0,
      -w2, h2, 0,
      w2, -h2, 0
    ];

    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(texCoords));
    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

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
        }
        else {
          console.log("can not read marker source")
          this.loadStandardIcon();
        }
      });
    } else {
      console.log("no marker source")
      this.loadStandardIcon();
    }

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
      }
    });

  }


  destroy () {
    Markers.remove(this);

    this.texCoordBuffer.destroy();
    this.vertexBuffer.destroy();

    if (this.isReady) {
      this.texture.destroy();
    }
  }
}