// TODO: handle multiple markers
// A: cluster them into 'tiles' that give close reference point and allow simpler visibility tests or
// B: handle them as individual objects

class MarkerRender {

  constructor () {

    this.shader = new GLX.Shader({
      vertexShader: Shaders.marker.vertex,
      fragmentShader: Shaders.marker.fragment,
      shaderName: 'marker shader',
      attributes: ['aPosition', 'aTexCoord'], //
      uniforms: [
        'uProjMatrix',
        'uViewMatrix',
        'uModelMatrix',
        'uTexIndex'
      ]
    });
  }

  render () {
    const shader = this.shader;

    shader.enable();

    const metersPerDegreeLongitude = render.metersPerDegreeLongitude;

    GL.disable(GL.DEPTH_TEST);
    GL.enable(GL.BLEND);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

    APP.markers.forEach(item => {
      if (!item.isReady) {
        return;
      }

      const modelMatrix = new GLX.Matrix();
      modelMatrix.translate(
        (item.position.longitude - APP.position.longitude) * metersPerDegreeLongitude,
        -(item.position.latitude - APP.position.latitude) * METERS_PER_DEGREE_LATITUDE,
        item.elevation
      );

      shader.setMatrix('uProjMatrix', '4fv', render.projMatrix.data);
      shader.setMatrix('uViewMatrix', '4fv', render.viewMatrix.data);
      shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
      shader.setBuffer('aPosition', item.vertexBuffer);

      shader.setBuffer('aTexCoord', item.texCoordBuffer);
      shader.setTexture('uTexIndex', 0, item.texture);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    });

    GL.disable(GL.BLEND);
    GL.enable(GL.DEPTH_TEST);

    shader.disable();
  }

  destroy () {
    this.shader.destroy();
  }
}
