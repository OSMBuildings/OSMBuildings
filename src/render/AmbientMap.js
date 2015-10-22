
render.AmbientMap = {

  init: function() {
    this.shader = new glx.Shader({
      vertexShader:   Shaders.ambientFromDepth.vertex,
      fragmentShader: Shaders.ambientFromDepth.fragment,
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uMatrix', 'uInverseTexWidth', 'uInverseTexHeight', 
                 'uTexIndex', 'uEffectStrength']
    });

    this.framebuffer = new glx.Framebuffer(128, 128); //dummy value, size will be set dynamically
    
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

  render: function(depthTexture, framebufferConfig, effectStrength) {

    var
      shader = this.shader,
      framebuffer = this.framebuffer;

    if (effectStrength === undefined)
      effectStrength = 1.0;


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


    var identity = new glx.Matrix();
    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, identity.data);

    gl.uniform1f(shader.uniforms.uInverseTexWidth,  1/framebufferConfig.width);
    gl.uniform1f(shader.uniforms.uInverseTexHeight, 1/framebufferConfig.height);
    gl.uniform1f(shader.uniforms.uEffectStrength,  effectStrength);

    this.vertexBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    this.texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shader.uniforms.uTexIndex, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
    framebuffer.disable();

    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
    //gl.generateMipmap(gl.TEXTURE_2D); //no interpolation --> don't need a mipmap
    
    gl.viewport(0, 0, MAP.width, MAP.height);

  },

  destroy: function() {}
};
