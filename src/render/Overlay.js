
/* 'Overlay' renders part of a texture over the whole viewport.
   The intended use is for compositing of screen-space effects.
 */
render.Overlay = {

  init: function() {
  
    var geometry = this.createGeometry();
    this.vertexBuffer   = new GLX.Buffer(3, new Float32Array(geometry.vertices));
    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(geometry.texCoords));

    this.shader = new GLX.Shader({
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

  render: function(texture, framebufferSize) {

    var shader = this.shader;

    shader.enable();
    /* we are rendering an *overlay*, which is supposed to be rendered on top of the
     * scene no matter what its actual depth is. */
    GL.disable(GL.DEPTH_TEST);
    
    shader.setUniformMatrix('uMatrix', '4fv', GLX.Matrix.identity().data);

    shader.bindBuffer(this.vertexBuffer,  'aPosition');
    shader.bindBuffer(this.texCoordBuffer,'aTexCoord');
    shader.bindTexture('uTexIndex', 0, texture);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    GL.enable(GL.DEPTH_TEST);
    shader.disable();
  },

  destroy: function() {}
};
