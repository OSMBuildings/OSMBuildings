
// TODO: perhaps render only clicked area

render.Picking = {

  idMapping: [null],
  viewportSize: 512,

  init: function() {
    this.shader = new GLX.Shader({
      vertexShader: Shaders.picking.vertex,
      fragmentShader: Shaders.picking.fragment,
      shaderName: 'picking shader',
      attributes: ['aPosition', 'aId'],
      uniforms: [
        'uModelMatrix',
        'uMatrix',
        'uFogRadius',
        'uTime'
      ]
    });

    this.framebuffer = new GLX.Framebuffer(this.viewportSize, this.viewportSize);
  },

  render: function(framebufferSize) {
    var
      shader = this.shader,
      framebuffer = this.framebuffer;

    framebuffer.setSize(framebufferSize[0], framebufferSize[1]);
    
    shader.enable();
    framebuffer.enable();
    GL.viewport(0, 0, framebufferSize[0], framebufferSize[1]);

    GL.clearColor(0, 0, 0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    shader.setUniform('uFogRadius', '1f', render.fogDistance);

    var
      dataItems = data.Index.items,
      modelMatrix;

    dataItems.forEach(item => {
      if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
        return;
      }

      if (!(modelMatrix = item.getMatrix())) {
        return;
      }

      shader.setUniform('uTime', '1f', item.getFade());

      shader.setUniformMatrices([
        ['uModelMatrix', '4fv', modelMatrix.data],
        ['uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix)]
      ]);

      shader.bindBuffer(item.vertexBuffer, 'aPosition');
      shader.bindBuffer(item.idBuffer, 'aId');

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    });

    this.shader.disable();
    this.framebuffer.disable();
    GL.viewport(0, 0, APP.width, APP.height);
  },
  
  // TODO: throttle calls
  getTarget: function(x, y, callback) {
    requestAnimationFrame(function() {
      this.render( [this.viewportSize, this.viewportSize] );

      x = x/APP.width *this.viewportSize <<0;
      y = y/APP.height*this.viewportSize <<0;

      this.framebuffer.enable();
      var imageData = this.framebuffer.getPixel(x, this.viewportSize - 1 - y);
      this.framebuffer.disable();

      if (imageData === undefined) {
        callback(undefined);
        return;
      }
      var color = imageData[0] | (imageData[1]<<8) | (imageData[2]<<16);

      callback(this.idMapping[color]);
    }.bind(this));
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
