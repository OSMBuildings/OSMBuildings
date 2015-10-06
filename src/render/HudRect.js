
/* 'HudRect' renders a textured rectangle to the top-right quarter of the viewport.
   The intended use is visualize render-to-texture effects during development.
 */
render.HudRect = {

  init: function() {
  
    var geometry = this.createGeometry(this.baseRadius);
    this.vertexBuffer   = new glx.Buffer(3, new Float32Array(geometry.vertices));
    this.texCoordBuffer = new glx.Buffer(2, new Float32Array(geometry.texCoords));

    this.shader = new glx.Shader({
      vertexShader: Shaders.texture.vertex,
      fragmentShader: Shaders.texture.fragment,
      attributes: ["aPosition", "aTexCoord"],
      uniforms: [ /*"uModelMatrix", "uViewMatrix", "uProjMatrix",*/ "uMatrix", "uTexIndex", "uColor"]
    });

/*    Activity.setBusy();

    this.texture = new glx.texture.Image(url, function(image) {
      Activity.setIdle();
      if (image) {
        this.isReady = true;
      }
    }.bind(this));*/
    this.isReady = true;
  },

  createGeometry: function(radius) {
    var vertices = [],
        texCoords= [];
    vertices.push(0, 0, 1E-5,
                  1, 0, 1E-5,
                  1, 1, 1E-5);
    
    vertices.push(0, 0, 1E-5,
                  1, 1, 1E-5,
                  0, 1, 1E-5);

    texCoords.push(0,0,
                   1,0,
                   1,1);

    texCoords.push(0,0,
                   1,1,
                   0,1);

    return { vertices: vertices , texCoords: texCoords };
  },

  render: function(texture) {
    if (!this.isReady) {
      return;
    }

    var
      shader = this.shader;

    shader.enable();
    //console.log(texture);
    gl.uniform3fv(shader.uniforms.uColor, [0.5, 0.1, 0.3]);

    /*var modelMatrix = new glx.Matrix();
    var scale = render.fogRadius/this.baseRadius;
    modelMatrix.scale(scale, scale, scale);

    gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);*/
    
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
