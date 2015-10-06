
/* 'HudRect' renders a textured rectangle to the top-right quarter of the viewport.
   The intended use is visualize render-to-texture effects during development.
 */
render.HudRect = {

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

    this.isReady = true;
  },

  createGeometry: function() {
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
