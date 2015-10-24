
/* 'NormalMap' renders the surface normals of the current view into a texture.
   This normal texture can then be used for screen-space effects such as outline rendering
   and screen-space ambient occlusion (SSAO).
   
   TODO: convert normals from world-space to screen-space?

*/
render.NormalMap = {

  viewportSize: 512,

  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.normalmap.vertex,
      fragmentShader: Shaders.normalmap.fragment,
      attributes: ['aPosition', 'aNormal', 'aFilter'],
      uniforms: ['uMatrix', 'uTime']
    });

    this.framebuffer = new glx.Framebuffer(this.viewportSize, this.viewportSize);
    // enable texture filtering for framebuffer texture
    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.mapPlane = new mesh.MapPlane();
  },

  render: function() {

    var
      shader = this.shader,
      framebuffer = this.framebuffer;

    gl.viewport(0, 0, this.viewportSize, this.viewportSize);
    shader.enable();
    framebuffer.enable();

    //the color (0.5, 0.5, 1) corresponds to the normal (0, 0, 1), i.e. 'up'.
    gl.clearColor(0.5, 0.5, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f(shader.uniforms.uTime, render.time);

    var
      dataItems = data.Index.items.concat([this.mapPlane]),
      item,
      modelMatrix;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (MAP.zoom < item.minZoom || MAP.zoom > item.maxZoom) {
        continue;
      }

      if (!(modelMatrix = item.getMatrix())) {
        continue;
      }

      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.normalBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aNormal, item.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.filterBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aFilter, item.filterBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    shader.disable();
    framebuffer.disable();

    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.renderTexture.id);
    gl.generateMipmap(gl.TEXTURE_2D);
    
    gl.viewport(0, 0, MAP.width, MAP.height);

  },

  destroy: function() {}
};
