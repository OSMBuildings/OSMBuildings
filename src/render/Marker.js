
class MarkerRender {

  constructor () {

    this.shader = new GLX.Shader({
      source: markerShader,
      attributes: ['aPosition'],
      uniforms: [
        'uProjMatrix',
        'uViewMatrix',
        'uModelMatrix'
      ]
    });
  }

  render () {
    const shader = this.shader;

    shader.enable();
    shader.setMatrix('uProjMatrix', '4fv', render.projMatrix.data);
    shader.setMatrix('uViewMatrix', '4fv', render.viewMatrix.data);

    APP.markers.forEach(item => {
      shader.setMatrix('uModelMatrix', '4fv', item.getMatrix().data);
      shader.setBuffer('aPosition', item.icon.vertexBuffer);
      GL.drawArrays(GL.TRIANGLES, 0, item.icon.vertexBuffer.numItems);
    });

    shader.disable();
  }

  destroy () {
    this.shader.destroy();
  }
}
