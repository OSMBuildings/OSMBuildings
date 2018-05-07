class Marker {

  constructor(options = {}) {

    this.offsetX = options.offsetX || 0;
    this.offsetY = options.offsetY || 0;
    this.position = options.position ||{ latitude: 0, longitude: 0 };
    this.elevation = options.elevation || 30;
    this.size = options.size || 150;
    this.source = options.source || "http://localhost/git/OSMBuildings/test/OSMBuildings/marker-icon2.png";
    this.isReady = false;

    Markers.add(this);
    this.load();
  }

  load(){

    const texCoords = [
      1,1,
      0,1,
      1,0,
      0,1,
      0,0,
      1,0
    ];

    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(texCoords));

    const
      w2 = this.size / 2,
      h2 = this.size / 2;

    const vertices = [
      -w2, -h2, 0,
      w2, -h2, 0,
      -w2 ,  h2, 0,
      w2 , -h2, 0,
      w2 ,  h2, 0,
      -w2 ,  h2, 0
    ];

    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

    this.texture = new GLX.texture.Image().load(this.source, image => {
      if (image) {
        /* Whole texture will be mapped to fit the tile exactly. So
         * don't attempt to wrap around the texture coordinates. */

        GL.bindTexture(GL.TEXTURE_2D, this.texture.id);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

        this.isReady = true;

      }
    });
  }

  destroy(){
    Markers.remove(this);

    this.texCoordBuffer.destroy();
    this.vertexBuffer.destroy();
    this.texture.destroy();
  }
}