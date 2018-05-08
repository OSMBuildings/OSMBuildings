class Marker {

  constructor(options = {}) {

    this.offsetX = options.offsetX || 0;
    this.offsetY = options.offsetY || 0;
    this.position = options.position ||{ latitude: 0, longitude: 0 };
    this.elevation = options.elevation || 30;
    this.size = options.size || 150;
    this.source = options.source;
    this.isReady = false;

    Markers.add(this);
    this.load();
  }

  load(){

    const texCoords = [
      0,0,
      1,0,
      0,1,
      1,1,
      0,1,
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
      w2 ,  h2, 0,
      -w2 ,  h2, 0,
      w2 , -h2, 0
    ];

    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

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
        // this.loadstandardMarker();
        // this.texture = new GLX.texture.Image().set(image);
        // marker-icon
        // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH4gUHDxACbf+ToAAABKBJREFUeNrt3YFtKjEURFGWBmiE/iuhka0AOgCxWpDte04DP/nxG88zkbJdWMLjdnv+89+77/vmf31+foiGXDgIAAy8QBAAGHiBIAAw9MJAAGDohYEAwNALAwGAwRcEAgCDLwgEAAZfEAgADL4gEAAGH0EgAAw+gkAAGHwEgQAw/AgBAWDwEQQCwPAjBASA4UcICACDjyAQAIYfISAADD9CQAAYfoSAADD4CAIBYPgRAgLA8CMEBIDhRwgIAMOPEBAAhh8hcIqrHzd0ZZLO7Y8WEA0Aw48QiAaA4UcIRAPA8CMEogFg+BECn/kUAMKWTDW3P1pANAAMP0LACgDUGoDbHy0gGgCGHyFgBQBqDcDtjxagAQC1BuD2RwvQAIBaA3D7owVoAECtAbj90QI0AKDWANz+aAEaAFBrAG5/tAANABAAQGYFUP+xBmgAgAAAMiuA+o81QAMABACQWQHUf6wBGgAgAAABAKz/BmD/xzuABgAIAEAAAOu/Adj/8Q6gAQACABAAgAAABAAgAIAjhv14wkeArGTUjwI1ALACAAIAEACAAAAEACAAAAEACABAAAACABAAgAAABAAgAAABAAgAQAAAAgAQAIAAAAQAIAAAAQD8zjbyF+ePg7CCUf8oiAYAVgBAAAACAOjYRv8CPQQys5EfADUAsAIAAgDwBuAdABr7vwYAVgDACmANgFT91wDACgAIAJUKBADQuawEAIRNV6t9GoDbXwMABACQWgGsAaj/GgBQDQC/EwAaALiUBABw1NRV2mMgbn8NACgGgMdA0ADAJSQAgG8tUaE9BuL21wCAYgPQAnD7awBAtQFoAbj9NQCgGgB+MQg0AHDJVANACwANAFwuAgB4Z9m67CNB3P4aAFBsAFoAbn8NAKg2AC0At78GAFQbgBaA218DAKoNQAvA7R8PACGA4bcCANUGoAXg9tcAgGoD0AJw+2sAQLUBaAG4/TUA0ADK37wWQPn21wBAA2jTAtz+5e9fA8DwCwCHAKwAVgEEvwYAaABaAG5/DQDQALQA3P4aABh+AeCQgBXAKoBg1wAADUALwO2vAYDhFwAOD1gBrAIIcA0A0AC0ANz+GgAYfgHgUIEAAEEtABwu+DMH+gAPggJaAwDDLwAcNrACWAUQyBoAGH4B4PCBAAAB7A3AWwCGXwNwGEEAgMAVAA4leAPwHoCg1QDA8AsAhxSsAFYBBKsGAIZfADi0IAAQpHgD8BZg+NEAHGIQAAhOrABWAcOPBuBQgwBAUGIFsAoYfjQAhxwEAIIRK4BVwPCjATj0IAAQhFYArAKGXwPAECAAQPBZAbAKGH4BgBAw/FYADAcCAAScFQCrgOHXADAsCAAQaFYArAKGXwPA8CAAQIBZAciuAoZfABANAcNvBcBQIQAQVFgBSKwChl8DwJAhABBMWAFIrAKGXwAQDQHDbwXA8CEAEEBYAUisAoZfA8BNjABA4GAFILEKGH4BQDQEDL8VAPUcAYBgwQpAYhUw/AKAaAgYfisAajsaALUmIEA0ALQHBACGGSsAiVVAYAgAoiFg+K0AWBUQABhyrAAkVgHBAMEQmPEPj3KeFy7fLVanpR7MAAAAAElFTkSuQmCC

      }
    });
  }


  destroy(){
    Markers.remove(this);

    this.texCoordBuffer.destroy();
    this.vertexBuffer.destroy();

    if(this.isReady){
      this.texture.destroy();
    }

  }
}