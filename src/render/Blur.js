
render.Blur = {

  init: function() {
    this.shader = new glx.Shader({
      vertexShader:   Shaders.blur.vertex,
      fragmentShader: Shaders.blur.fragment,
      shaderName: 'blur shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uMatrix', 'uInverseTexWidth', 'uInverseTexHeight', 'uTexIndex']
    });

    this.framebuffer = new glx.Framebuffer(128, 128); //dummy value, size will be set dynamically
    
    this.vertexBuffer = new glx.Buffer(3, new Float32Array([
      -1, -1, 1E-5,
       1, -1, 1E-5,
       1,  1, 1E-5,
      -1, -1, 1E-5,
       1,  1, 1E-5,
      -1,  1, 1E-5
    ]));
       
    this.texCoordBuffer = new glx.Buffer(2, new Float32Array([
      0,0,
      1,0,
      1,1,
      0,0,
      1,1,
      0,1
    ]));
  },

  render: function(inputTexture, framebufferConfig) {

    var
      shader = this.shader,
      framebuffer = this.framebuffer;


    if (framebuffer.width != framebufferConfig.width || 
        framebuffer.height!= framebufferConfig.height)
    {
      framebuffer.setSize( framebufferConfig.width, framebufferConfig.height );
      gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
      // we'll render the blurred image 1:1 to the screen pixels,
      // so no interpolation is necessary
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }


    if (framebufferConfig.tcRight  != this.tcRight || 
        framebufferConfig.tcTop    != this.tcTop   || 
        framebufferConfig.tcLeft   != this.tcLeft  ||
        framebufferConfig.tcBottom != this.tcBottom )
    {
      this.texCoordBuffer.destroy();
      this.texCoordBuffer = new glx.Buffer(2, new Float32Array(
        [framebufferConfig.tcLeft,  framebufferConfig.tcTop,
         framebufferConfig.tcRight, framebufferConfig.tcTop,
         framebufferConfig.tcRight, framebufferConfig.tcBottom,
         framebufferConfig.tcLeft,  framebufferConfig.tcTop,
         framebufferConfig.tcRight, framebufferConfig.tcBottom,
         framebufferConfig.tcLeft,  framebufferConfig.tcBottom
        ]));      
    
      this.tcRight = framebufferConfig.tcRight;
      this.tcBottom= framebufferConfig.tcBottom;
      this.tcLeft =  framebufferConfig.tcLeft;
      this.tcTop =   framebufferConfig.tcTop;
    }

    gl.viewport(0, 0, framebufferConfig.usedWidth, framebufferConfig.usedHeight);
    shader.enable();
    framebuffer.enable();

    gl.clearColor(1.0, 0.0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.identity().data);

    shader.setUniforms([
      ['uInverseTexWidth', '1f', 1/framebuffer.width],
      ['uInverseTexHeight', '1f', 1/framebuffer.height],
    ]);
    shader.bindBuffer(this.vertexBuffer,  'aPosition');
    shader.bindBuffer(this.texCoordBuffer,'aTexCoord');
    shader.bindTexture('uTexIndex', 0, inputTexture);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
    framebuffer.disable();

    gl.viewport(0, 0, MAP.width, MAP.height);

  },

  destroy: function() {}
};
