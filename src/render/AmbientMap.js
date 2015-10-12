
render.AmbientMap = {

  init: function() {
    this.shader = new glx.Shader({
      vertexShader:   Shaders.ambientFromDepth.vertex,
      fragmentShader: Shaders.ambientFromDepth.fragment,
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uMatrix', 'uInverseTexWidth', 'uInverseTexHeight', 'uTexIndex']
    });

    this.framebuffer = new glx.Framebuffer(128, 128); //dummy value, size will be set dynamically
    
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

    var maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    var targetWidth = MAP.width  >> 1;
    var targetHeight= MAP.height >> 1;
    this.textureWidth = Math.min(glx.util.nextPowerOf2(targetWidth), maxTexSize);
    this.textureHeight= Math.min(glx.util.nextPowerOf2(targetHeight), maxTexSize);
    //work-around: the framebuffer class currently forces dimensions to be square
    //TODO: remove these two lines once no longer necessary
    this.textureWidth  = Math.max(this.textureWidth, this.textureHeight);
    this.textureHeight = Math.max(this.textureWidth, this.textureHeight);
    
    this.usedTextureWidth = Math.min(targetWidth, this.textureWidth);
    this.usedTextureHeight= Math.min(targetHeight,this.textureHeight);

    if (framebuffer.width  != this.textureWidth || 
        framebuffer.height != this.textureHeight  )
    {
      /*
      console.log("[INFO] resizing framebuffer to %sx%s",// (%s, %s)", 
        this.textureWidth, this.textureHeight
        usedTextureWidth/requiredTextureWidth, usedTextureHeight/requiredTextureHeight);
      */
      framebuffer.setSize( this.textureWidth, this.textureHeight );
      gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      
    }

    var tcLeft  = 0.5 / framebuffer.width;
    var tcTop   = 0.5 / framebuffer.height;
    var tcRight = (this.usedTextureWidth  - 0.5) / framebuffer.width;
    var tcBottom= (this.usedTextureHeight - 0.5)/ framebuffer.height;
//    console.log(tcRight, tcBottom);

    if (tcRight != this.tcRight || tcBottom != this.tcBottom || 
        tcLeft != this.tcLeft   || tcBottom != this.tcBottom )
    {
      this.texCoordBuffer.destroy();
      this.texCoordBuffer = new glx.Buffer(2, new Float32Array(
        [tcLeft,  tcTop,
         tcRight, tcTop,
         tcRight, tcBottom,
         tcLeft,  tcTop,
         tcRight, tcBottom,
         tcLeft,  tcBottom
        ]));      
    
      this.tcRight = tcRight;
      this.tcBottom= tcBottom;
      this.tcLeft =  tcLeft;
      this.tcTop =   tcTop;
    }
    gl.viewport(0, 0, this.usedTextureWidth, this.usedTextureHeight);
    shader.enable();
    framebuffer.enable();

    gl.clearColor(1.0, 0.0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    var identity = new glx.Matrix();
    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, identity.data);

    gl.uniform1f(shader.uniforms.uInverseTexWidth,  1/this.textureWidth);
    gl.uniform1f(shader.uniforms.uInverseTexHeight, 1/this.textureHeight);

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
    gl.generateMipmap(gl.TEXTURE_2D);
    
    gl.viewport(0, 0, MAP.width, MAP.height);

  },

  destroy: function() {}
};
