
render.Anaglyph = {

  init: function() {
    this.shader = new GLX.Shader({
      vertexShader:   Shaders.anaglyph.vertex,
      fragmentShader: Shaders.anaglyph.fragment,
      shaderName: "Anaglyph output shader",
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uMatrix', 'uTexLeftIndex', 'uTexRightIndex']
    });

//    this.framebuffer = new glx.Framebuffer(128, 128); //dummy value, size will be set dynamically
    
    this.vertexBuffer = new GLX.Buffer(3, new Float32Array([
      -1, -1, 1E-5,
       1, -1, 1E-5,
       1,  1, 1E-5,
      -1, -1, 1E-5,
       1,  1, 1E-5,
      -1,  1, 1E-5
    ]));
       
    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array([
     0,0,
     1,0,
     1,1,
     0,0,
     1,1,
     0,1
    ]));
  },

  render: function(leftTexture, rightTexture) {

    var
      shader = this.shader;

    shader.enable();
    GL.disable(GL.DEPTH_TEST);

    shader.setUniformMatrix('uMatrix', '4fv', GLX.Matrix.identity().data);

    shader.bindBuffer(this.vertexBuffer,  'aPosition');
    shader.bindBuffer(this.texCoordBuffer,'aTexCoord');

    shader.bindTexture('uTexLeftIndex',  0, leftTexture);
    shader.bindTexture('uTexRightIndex', 1, rightTexture);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    GL.enable(GL.DEPTH_TEST);
    shader.disable();
  },

  destroy: function() {}
};
