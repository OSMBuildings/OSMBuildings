
// TODO: render only clicked area

var Interaction = {

  idMapping: [null],
  viewportSize: 1024,

  initShader: function() {
    this.shader = new glx.Shader(SHADERS.interaction);
    this.framebuffer = new glx.Framebuffer(this.viewportSize, this.viewportSize);
    return this;
  },

  // TODO: maybe throttle calls
  getTargetID: function(x, y, callback) {
    if (Map.zoom < MIN_ZOOM) {
      return;
    }

    var vpMatrix = new glx.Matrix(glx.Matrix.multiply(Map.transform, Renderer.perspective));

    var
      shader = this.shader,
      framebuffer = this.framebuffer;

    GL.viewport(0, 0, this.viewportSize, this.viewportSize);
    shader.enable();
    framebuffer.enable();

    GL.clearColor(0, 0, 0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    var
      dataItems = Data.items,
      item,
      mMatrix, mvp;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(mMatrix = item.getMatrix())) {
        continue;
      }

      mvp = glx.Matrix.multiply(mMatrix, vpMatrix);
      GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, mvp);

      item.vertexBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, GL.FLOAT, false, 0, 0);

      item.idColorBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aColor, item.idColorBuffer.itemSize, GL.UNSIGNED_BYTE, true, 0, 0);

      item.visibilityBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aHidden, item.visibilityBuffer.itemSize, GL.FLOAT, false, 0, 0);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    var imageData = framebuffer.getData();

    // DEBUG
    // // disable framebuffer
    // var imageData = new Uint8Array(WIDTH*HEIGHT*4);
    // GL.readPixels(0, 0, WIDTH, HEIGHT, GL.RGBA, GL.UNSIGNED_BYTE, imageData);

    shader.disable();
    framebuffer.disable();
    GL.viewport(0, 0, WIDTH, HEIGHT);

    //var index = ((HEIGHT-y/)*WIDTH + x) * 4;
    x = x/WIDTH*this.viewportSize <<0;
    y = y/HEIGHT*this.viewportSize <<0;
    var index = ((this.viewportSize-y)*this.viewportSize + x) * 4;
    var color = imageData[index] | (imageData[index + 1]<<8) | (imageData[index + 2]<<16);

    callback(this.idMapping[color]);
  },

  idToColor: function(id) {
    var index = this.idMapping.indexOf(id);
    if (index === -1) {
      this.idMapping.push(id);
      index = this.idMapping.length-1;
    }
//  return { r:255, g:128, b:0 }
    return {
      r:  index        & 0xff,
      g: (index >>  8) & 0xff,
      b: (index >> 16) & 0xff
    };
  }
};
