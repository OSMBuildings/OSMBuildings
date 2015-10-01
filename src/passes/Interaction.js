
// TODO: perhaps render only clicked area

var Interaction = {

  idMapping: [null],
  viewportSize: 512,

  initShader: function(options) {
    this.shader = new glx.Shader({
      vertexShader: Shaders.interaction.vertex,
      fragmentShader: Shaders.interaction.fragment,
      attributes: ["aPosition", "aColor"],
      uniforms: ["uMMatrix", "uMatrix", "uFogRadius"]
    });

    this.framebuffer = new glx.Framebuffer(this.viewportSize, this.viewportSize);
    return this;
  },

  // TODO: throttle calls
  getTarget: function(x, y) {
    if (MAP.zoom < MIN_ZOOM) {
      return;
    }

    var
      gl = glx.context,
      vpMatrix = MAP.getMatrix(),
      shader = this.shader,
      framebuffer = this.framebuffer;

    gl.viewport(0, 0, this.viewportSize, this.viewportSize);
    shader.enable();
    framebuffer.enable();

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //gl.uniform1f(shader.uniforms.uFogRadius, MAP.getFogRadius());
    GL.uniform1f(shader.uniforms.uFogRadius, 9999);

    var
      dataItems = data.Index.items,
      item,
      mMatrix, mvp;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(mMatrix = item.getMatrix())) {
        continue;
      }

      gl.uniformMatrix4fv(shader.uniforms.uMMatrix, false, mMatrix.data);

      mvp = glx.Matrix.multiply(mMatrix, vpMatrix);
      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, mvp);

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
  }
};
