
// TODO: perhaps render only clicked area

render.Interaction = {

  idMapping: [null],
  viewportSize: 512,

  init: function() {
    this.shader = new glx.Shader({
      vertexShader: Shaders.interaction.vertex,
      fragmentShader: Shaders.interaction.fragment,
      attributes: ['aPosition', 'aColor'],
      uniforms: ['uModelMatrix', 'uViewMatrix', 'uProjMatrix', 'uMatrix', 'uFogRadius', 'uBendRadius', 'uBendDistance']
    });

    this.framebuffer = new glx.Framebuffer(this.viewportSize, this.viewportSize);
  },

  // TODO: throttle calls
  getTarget: function(x, y) {
    if (MAP.zoom < MIN_ZOOM) {
      return;
    }

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

    var
      dataItems = data.Index.items,
      item,
      modelMatrix, mvp;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(modelMatrix = item.getMatrix())) {
        continue;
      }

      //gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
      //gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

      gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);
      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.idColorBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aColor, item.idColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

      //item.visibilityBuffer.enable();
      //gl.vertexAttribPointer(shader.attributes.aHidden, item.visibilityBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    var imageData = framebuffer.getData();

    // DEBUG
    // // disable framebuffer
    // var imageData = new Uint8Array(MAP.width*MAP.height*4);
    shader.disable();
    framebuffer.disable();

    gl.viewport(0, 0, MAP.width, MAP.height);

    //var index = ((MAP.height-y/)*MAP.width + x) * 4;
    x = x/MAP.width*this.viewportSize <<0;
    y = y/MAP.height*this.viewportSize <<0;
    var index = ((this.viewportSize-y)*this.viewportSize + x) * 4;
    var color = imageData[index] | (imageData[index + 1]<<8) | (imageData[index + 2]<<16);

    return this.idMapping[color];
  },

  idToColor: function(id) {
    var index = this.idMapping.indexOf(id);
    if (index === -1) {
      this.idMapping.push(id);
      index = this.idMapping.length-1;
    }
    return {
      r: ( index        & 0xff) / 255,
      g: ((index >>  8) & 0xff) / 255,
      b: ((index >> 16) & 0xff) / 255
    };
  },

  destroy: function() {}
};
