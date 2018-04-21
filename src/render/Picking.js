// TODO: perhaps render only clicked area
// TODO: no picking if too far, too small (zoom levels)

class Picking {

  constructor () {

    this.size = [512, 512];

    this.shader = new GLX.Shader({
      vertexShader: Shaders.picking.vertex,
      fragmentShader: Shaders.picking.fragment,
      shaderName: 'picking shader',
      attributes: ['aPosition', 'aPickingColor'],
      uniforms: [
        'uModelMatrix',
        'uMatrix',
        'uFogRadius',
        'uFade',
        'uIndex'
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

      const itemFeatureIndex = [];
      DataIndex.items.forEach(item => {
        if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
          return;
        }

        let modelMatrix = item.getMatrix();
        if (!modelMatrix) {
          return;
        }

        itemFeatureIndex.push(item.items);

        this.shader.setAllUniforms([
          ['uFade', '1f', item.getFade()],
          ['uIndex', '1f', itemFeatureIndex.length/256]
        ]);

        this.shader.setAllUniformMatrices([
          ['uModelMatrix', '4fv', modelMatrix.data],
          ['uMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix)]
        ]);

        this.shader.bindBuffer('aPosition', item.vertexBuffer);
        this.shader.bindBuffer('aPickingColor', item.pickingBuffer);

        GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
      });

      this.shader.disable();
      GL.viewport(0, 0, APP.width, APP.height);

      //***************************************************

      const
        X = x / APP.width * this.size[0] << 0,
        Y = y / APP.height * this.size[1] << 0;

      const imageData = this.framebuffer.getPixel(X, this.size[1] - 1 - Y);
      this.framebuffer.disable();

      if (!imageData) {
        callback();
        return;
      }

      const
        itemIndex = imageData[0]-1,
        featureIndex = (imageData[1] | (imageData[2] << 8))-1;

      if (!itemFeatureIndex[itemIndex] || !itemFeatureIndex[itemIndex][featureIndex]) {
        callback();
        return;
      }

      const feature = itemFeatureIndex[itemIndex][featureIndex];
      callback({ id: feature.id, properties: feature.properties });

    }); // end requestAnimationFrame()
  }

  destroy () {
    this.shader.destroy();
    this.framebuffer.destroy();
  }
}