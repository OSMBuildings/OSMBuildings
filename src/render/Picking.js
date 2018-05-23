// TODO: perhaps render only clicked area
// TODO: no picking if too far, too small (zoom levels)

class Picking {

  constructor () {

    this.size = [512, 512];

    this.shader = new GLX.Shader({
      vertexShader: Shaders.picking.vertex,
      fragmentShader: Shaders.picking.fragment,
      shaderName: 'picking shader',
      attributes: ['aPosition', 'aPickingColor', 'aZScale'],
      uniforms: [
        'uModelMatrix',
        'uMatrix',
        'uFogDistance',
        'uFade',
        'uIndex'
      ]
    });

    this.framebuffer = new GLX.Framebuffer(this.size[0], this.size[1]);
  }

  getTargets (x, y, callback) {
    requestAnimationFrame(() => {
      const shader = this.shader;

      shader.enable();
      this.framebuffer.enable();

      GL.viewport(0, 0, this.size[0], this.size[1]);

      GL.clearColor(0, 0, 0, 1);
      GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

      shader.setParam('uFogDistance', '1f', render.fogDistance);

      const renderedItems = [];
      APP.features.forEach(item => {
        if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
          return;
        }

        let modelMatrix = item.getMatrix();
        if (!modelMatrix) {
          return;
        }

        renderedItems.push(item.items);

        shader.setParam('uFade', '1f', item.getFade());
        shader.setParam('uIndex', '1f', renderedItems.length / 256);

        shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
        shader.setMatrix('uMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix));

        shader.setBuffer('aPosition', item.vertexBuffer);
        shader.setBuffer('aPickingColor', item.pickingBuffer);
        shader.setBuffer('aZScale', item.zScaleBuffer);

        GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
      });

      shader.disable();
      GL.viewport(0, 0, APP.width, APP.height);

      //***************************************************

      const
        X = x / APP.width * this.size[0] << 0,
        Y = y / APP.height * this.size[1] << 0;

      const imgData = this.framebuffer.getPixel(X, this.size[1] - 1 - Y);
      this.framebuffer.disable();

      if (!imgData) {
        callback();
        return;
      }

      const
        i = imgData[0] - 1,
        f = (imgData[1] | (imgData[2] << 8)) - 1;

      if (!renderedItems[i] || !renderedItems[i][f]) {
        callback();
        return;
      }

      const feature = renderedItems[i][f];
      // callback({ id: feature.id, properties: feature.properties });

      // find related items - across tiles
      const res = { id: feature.id, properties: feature.properties, parts: [] };
      const id = feature.properties.building || feature.id;
      APP.features.forEach(item => {
        item.items.forEach(feature => {
          if (feature.id === id || feature.properties.building === id) {
            res.parts.push({ id: feature.id, properties: feature.properties });
          }
        });
      });

      callback(res);

    }); // end requestAnimationFrame()
  }

  destroy () {
    this.shader.destroy();
    this.framebuffer.destroy();
  }
}