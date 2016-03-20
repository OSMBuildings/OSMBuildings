
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
      shaderName: 'overlay texture shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uMatrix', 'uTexIndex']
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
      tcHorizMin = 0                            / framebufferConfig.width;
      tcHorizMax = framebufferConfig.usedWidth  / framebufferConfig.width;
      tcVertMin  = 0                            / framebufferConfig.height;
      tcVertMax  = framebufferConfig.usedHeight / framebufferConfig.height;
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
    /* we are rendering an *overlay*, which is supposed to be rendered on top of the
     * scene no matter what its actual depth is. */
    gl.disable(gl.DEPTH_TEST);    
    
    shader.setUniformMatrix('uMatrix', '4fv', glx.Matrix.identity().data);

    shader.bindBuffer(this.vertexBuffer,  'aPosition');
    shader.bindBuffer(this.texCoordBuffer,'aTexCoord');
    shader.bindTexture('uTexIndex', 0, texture);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

    gl.enable(gl.DEPTH_TEST);
    shader.disable();
  },

  destroy: function() {}
};
