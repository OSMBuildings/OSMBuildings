
/* 'Overlay' renders part of a texture over the whole viewport.
   The intended use is for compositing of screen-space effects.
 */
render.Overlay = {

  init: function() {
  
    var geometry = this.createGeometry();
    this.vertexBuffer   = new glx.Buffer(3, new Float32Array(geometry.vertices));
    this.texCoordBuffer = new glx.Buffer(2, new Float32Array(geometry.texCoords));

    this.shader = new glx.Shader({
      vertexShader: Shaders.texture.vertex,
      fragmentShader: Shaders.texture.fragment,
      attributes: ["aPosition", "aTexCoord"],
      uniforms: [ "uMatrix", "uTexIndex", "uColor"]
    });
  },

  createGeometry: function() {
    var vertices = [],
        texCoords= [];
    vertices.push(-1,-1, 1E-5,
                   1,-1, 1E-5,
                   1, 1, 1E-5);
    
    vertices.push(-1,-1, 1E-5,
                   1, 1, 1E-5,
                  -1, 1, 1E-5);

    texCoords.push(0.0,0.0,
                   1.0,0.0,
                   1.0,1.0);

    texCoords.push(0.0,0.0,
                   1.0,1.0,
                   0.0,1.0);

    return { vertices: vertices , texCoords: texCoords };
  },

  render: function(texture, framebufferConfig) {
    var tcHorizMin, tcVertMin, tcHorizMax, tcVertMax;
    
    if (framebufferConfig !== undefined)
    {
      tcHorizMin = 0.5                                  / framebufferConfig.width;
      tcHorizMax = (framebufferConfig.usedWidth  - 0.5) / framebufferConfig.width;
      tcVertMin  = 0.5                                  / framebufferConfig.height;
      tcVertMax  = (framebufferConfig.usedHeight - 0.5) / framebufferConfig.height;
    } else
    {
      tcHorizMin = tcVertMin = 0.0;
      tcHorizMax = tcVertMax = 1.0;
    }

    if (tcHorizMin != this.tcHorizMin ||
        tcHorizMax != this.tcHorizMax ||
        tcVertMin != this.tcVertMin ||
        tcVertMax != this.tcVertMax)
    {
      //console.log("resetting texCoord buffer to", tcHorizMin, tcHorizMax, tcVertMin, tcVertMax);
      this.texCoordBuffer.destroy();
      this.texCoordBuffer = new glx.Buffer(2, new Float32Array([
        tcHorizMin, tcVertMin,
        tcHorizMax, tcVertMin,
        tcHorizMax, tcVertMax,

        tcHorizMin, tcVertMin,
        tcHorizMax, tcVertMax,
        tcHorizMin, tcVertMax]));
      
      this.tcHorizMin = tcHorizMin;
      this.tcHorizMax = tcHorizMax;
      this.tcVertMin  = tcVertMin;
      this.tcVertMax  = tcVertMax;
    }

    var shader = this.shader;

    shader.enable();
    
    var identity = new glx.Matrix();
    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, identity.data);
    this.vertexBuffer.enable();

    gl.vertexAttribPointer(shader.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    this.texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shader.uniforms.uTexIndex, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
  },

  destroy: function() {
    this.texture.destroy();
  }
};
