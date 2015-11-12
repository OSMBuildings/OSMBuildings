
// TODO: perhaps render only clicked area

render.Interaction = {

  idMapping: [null],
  viewportSize: 512,

  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.interaction.vertex,
      fragmentShader: Shaders.interaction.fragment,
      attributes: ['aPosition', 'aID', 'aFilter'],
      uniforms: [
        'uModelMatrix',
        'uViewMatrix',
        'uProjMatrix',
        'uMatrix',
        'uFogRadius',
        'uBendRadius',
        'uBendDistance',
        'uTime'
      ]
    });

    this.framebuffer = new glx.Framebuffer(this.viewportSize, this.viewportSize);
  },

  // TODO: throttle calls
  getTarget: function(x, y) {
    var
      shader = this.shader,
      framebuffer = this.framebuffer;

    gl.viewport(0, 0, this.viewportSize, this.viewportSize);
    shader.enable();
    framebuffer.enable();

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f(shader.uniforms.uFogRadius, render.fogRadius);

    gl.uniform1f(shader.uniforms.uBendRadius, render.bendRadius);
    gl.uniform1f(shader.uniforms.uBendDistance, render.bendDistance);

    gl.uniform1f(shader.uniforms.uTime, Filter.time());

    gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
    gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);

    var
      dataItems = data.Index.items,
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

      gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.idBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aID, item.idBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.filterBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aFilter, item.filterBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    x = x/MAP.width*this.viewportSize <<0;
    y = y/MAP.height*this.viewportSize <<0;
    var imageData = framebuffer.getPixel(x, this.viewportSize - y);
    var color = imageData[0] | (imageData[1]<<8) | (imageData[2]<<16);

    shader.disable();
    framebuffer.disable();
    gl.viewport(0, 0, MAP.width, MAP.height);

    return this.idMapping[color];
  },

  idToColor: function(id) {
    var index = this.idMapping.indexOf(id);
    if (index === -1) {
      this.idMapping.push(id);
      index = this.idMapping.length-1;
    }
    return [
      ( index        & 0xff) / 255,
      ((index >>  8) & 0xff) / 255,
      ((index >> 16) & 0xff) / 255
    ];
  },

  destroy: function() {}
};
