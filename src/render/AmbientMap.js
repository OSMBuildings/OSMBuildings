
render.AmbientMap = {

  viewportSize: 512,

  init: function() {
    this.shader = new glx.Shader({
      vertexShader:   Shaders.ambientFromDepth.vertex,
      fragmentShader: Shaders.ambientFromDepth.fragment,
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uMatrix', 'uInverseTexWidth', 'uInverseTexHeight', 'uTexIndex']
    });

    this.framebuffer = new glx.Framebuffer(this.viewportSize, this.viewportSize);
    
    // enable texture filtering for framebuffer texture
    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    this.vertexBuffer   = new glx.Buffer(3, new Float32Array(
      [-1, -1, 1E-5,
        1, -1, 1E-5,
        1,  1, 1E-5, 
       -1, -1, 1E-5,
        1,  1, 1E-5,
       -1,  1, 1E-5]));
       
    this.texCoordBuffer = new glx.Buffer(2, new Float32Array(
      [0,0,
       1,0,
       1,1,
       0,0,
       1,1,
       0,1
      ]));
  },

  render: function(depthTexture) {

    var
      shader = this.shader,
      framebuffer = this.framebuffer;

    gl.viewport(0, 0, this.viewportSize, this.viewportSize);
    shader.enable();
    framebuffer.enable();

    gl.clearColor(1.0, 0.0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    var identity = new glx.Matrix();
    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, identity.data);

    gl.uniform1f(shader.uniforms.uInverseTexWidth,  1/this.viewportSize);
    gl.uniform1f(shader.uniforms.uInverseTexHeight, 1/this.viewportSize);


    this.vertexBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    this.texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shader.uniforms.uTexIndex, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

    //render.Basemap.render();
    shader.disable();
    framebuffer.disable();

    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
    gl.generateMipmap(gl.TEXTURE_2D);
    
    gl.viewport(0, 0, MAP.width, MAP.height);

  },

  destroy: function() {}
};
