// TODO: perhaps render only clicked area
// TODO: no picking if too far, too small (zoom levels)

View.Picking = class {

  constructor () {
    this.featuresShader = new GLX.Shader({
      source: shaders.picking,
      attributes: ['aPosition', 'aPickingColor', 'aZScale'],
      uniforms: [
        'uModelMatrix',
        'uMatrix',
        'uFogDistance',
        'uFade',
        'uIndex'
      ]
    });

    this.markersShader = new GLX.Shader({
      source: shaders.markers_picking,
      attributes: ['aPosition'],
      uniforms: [
        'uPickingColor',
        'uModelMatrix',
        'uProjMatrix',
        'uViewMatrix',
        'uFogDistance',
        'uIndex'
      ]
    });

    this.size = [512, 512];
    this.framebuffer = new GLX.Framebuffer(this.size[0], this.size[1]);
  }

  renderFeatures () {
    const shader = this.featuresShader;

    shader.enable();

    shader.setParam('uFogDistance', '1f', APP.view.fogDistance);

    const renderedFeatures = [];
    APP.features.forEach(item => {
      if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
        return;
      }

      let modelMatrix = item.getMatrix();
      if (!modelMatrix) {
        return;
      }

      renderedFeatures.push(item.items);

      shader.setParam('uFade', '1f', item.getFade());
      shader.setParam('uIndex', '1f', renderedFeatures.length / 256);

      shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
      shader.setMatrix('uMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, APP.view.viewProjMatrix));

      shader.setBuffer('aPosition', item.vertexBuffer);
      shader.setBuffer('aPickingColor', item.pickingBuffer);
      shader.setBuffer('aZScale', item.zScaleBuffer);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    });

    shader.disable();

    return renderedFeatures;
  }

  renderMarkers (renderedFeaturesLength) {
    const shader = this.markersShader;

    shader.enable();

    shader.setParam('uFogDistance', '1f', APP.view.fogDistance);

    const renderedMarkers = [];
    APP.markers.forEach((item, i) => {
      let modelMatrix = item.getMatrix();

      renderedMarkers.push(item);

      shader.setParam('uIndex', '1f', (renderedFeaturesLength+1) / 256);

      shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
      shader.setMatrix('uViewMatrix', '4fv', APP.view.viewMatrix.data);
      shader.setMatrix('uProjMatrix', '4fv', APP.view.projMatrix.data);

      shader.setBuffer('aPosition', item.icon.vertexBuffer);

      // TODO: do this in Marker, early
      i++;
      const pickingColor = [0, (i & 0xff) / 255, ((i >> 8) & 0xff) / 255];

      shader.setParam('uPickingColor', '3fv', pickingColor);

      GL.drawArrays(GL.TRIANGLES, 0, item.icon.vertexBuffer.numItems);
    });

    shader.disable();

    return renderedMarkers;
  }

  findFeatures (renderedFeatures, i, f) {
    if (!renderedFeatures[i] || !renderedFeatures[i][f]) {
      return;
    }

    const feature = renderedFeatures[i][f];
    // callback({ id: feature.id, properties: feature.properties });

    // find related items (across tiles)
    const res = [];
    const id = feature.properties.building || feature.id;
    APP.features.forEach(item => { // all tiles...
      item.items.forEach(feature => { // ...and their features
        if ((feature.id === id || feature.properties.building === id) && !res.some(f => f.id === feature.id)) {
          res.push({id: feature.id, properties: feature.properties});
        }
      });
    });

    return res;
  }

  getTarget (x, y, callback) {
    requestAnimationFrame(() => {
      const res = {};

      GL.viewport(0, 0, this.size[0], this.size[1]);

      this.framebuffer.enable();

      GL.clearColor(0, 0, 0, 1);
      GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

      const renderedFeatures = this.renderFeatures();
      const renderedMarkers = this.renderMarkers(renderedFeatures.length);

      GL.viewport(0, 0, APP.width, APP.height);

      const
        X = x / APP.width * this.size[0] << 0,
        Y = y / APP.height * this.size[1] << 0;

      const imgData = this.framebuffer.getPixel(X, this.size[1] - 1 - Y);
      this.framebuffer.disable();

      if (imgData) {
        const
          i = imgData[0] - 1,
          f = (imgData[1] | (imgData[2] << 8)) - 1;

        res.features = this.findFeatures(renderedFeatures, i, f);
        res.marker = (renderedMarkers[f] && renderedMarkers[f].data);
      }

      callback(res);
    }); // end requestAnimationFrame()
  }

  destroy () {
    this.featuresShader.destroy();
    this.markersShader.destroy();
    this.framebuffer.destroy();
  }
};