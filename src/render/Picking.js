// TODO: perhaps render only clicked area

class DrawPicking {

  constructor () {

    this.idMapping = [null]; // first item is void

    this.size = [512, 512];

    this.shader = new GLX.Shader({
      vertexShader: Shaders.picking.vertex,
      fragmentShader: Shaders.picking.fragment,
      shaderName: 'picking shader',
      attributes: ['aPosition', 'aIdColor'],
      uniforms: [
        'uModelMatrix',
        'uMatrix',
        'uFogRadius',
        'uFade'
      ]
    });

    this.framebuffer = new GLX.Framebuffer(this.size[0], this.size[1]);
  }

  render (x, y, callback) {
    requestAnimationFrame(() => {
      this.shader.enable();
      this.framebuffer.enable();
      GL.viewport(0, 0, this.size[0], this.size[1]);

      GL.clearColor(0, 0, 0, 1);
      GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

      this.shader.setUniform('uFogRadius', '1f', render.fogDistance);

      DataIndex.items.forEach(item => {
        if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
          return;
        }

        let modelMatrix;
        if (!(modelMatrix = item.getMatrix())) {
          return;
        }

        this.shader.setUniform('uFade', '1f', item.getFade());

        this.shader.setAllUniformMatrices([
          ['uModelMatrix', '4fv', modelMatrix.data],
          ['uMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix)]
        ]);

        this.shader.bindBuffer('aPosition', item.vertexBuffer);
        this.shader.bindBuffer('aIdColor', item.idBuffer);

        GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
      });

      this.shader.disable();

      x = x / APP.width * this.size[0] << 0;
      y = y / APP.height * this.size[1] << 0;

      this.framebuffer.enable();
      const imageData = this.framebuffer.getPixel(x, this.size[1] - 1 - y);
      this.framebuffer.disable();

      GL.viewport(0, 0, APP.width, APP.height);

      if (imageData === undefined) {
        callback();
      } else {
        const color = imageData[0] | (imageData[1] << 8) | (imageData[2] << 16);
        callback(this.idMapping[color]);
      }
    }); // end requestAnimationFrame()
  }

  idToColor (id) {
    let index = this.idMapping.indexOf(id);
    if (index === -1) {
      this.idMapping.push(id);
      index = this.idMapping.length - 1;
    }
    return [
      (index & 0xff) / 255,
      ((index >> 8) & 0xff) / 255,
      ((index >> 16) & 0xff) / 255
    ];
  }

  destroy () {
    this.shader.destroy();
    this.framebuffer.destroy();
  }
}