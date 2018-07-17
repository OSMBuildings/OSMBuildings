
class MarkerRender {

  constructor () {

    this.shader = new GLX.Shader({
      source: markerShader,
      attributes: ['aPosition'],
      uniforms: [
        'uProjMatrix',
        'uViewMatrix',
        'uModelMatrix',
        'uColor'
      ]
    });
  }

  render () {
    const shader = this.shader;

    shader.enable();
    shader.setMatrix('uViewMatrix', '4fv', render.viewMatrix.data);
    shader.setMatrix('uProjMatrix', '4fv', render.projMatrix.data);

    APP.markers.forEach(item => {
      shader.setMatrix('uModelMatrix', '4fv', item.getMatrix().data);
      shader.setBuffer('aPosition', item.icon.vertexBuffer);
      shader.setParam('uColor', '3fv', item.color);

      GL.drawArrays(GL.TRIANGLES, 0, item.icon.vertexBuffer.numItems);
    });

    shader.disable();
  }

  destroy () {
    this.shader.destroy();
  }
}
