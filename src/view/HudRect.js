
// HudRect renders a textured rectangle to the top-right quarter of the viewport.
// The intended use is visualize render-to-texture effects during development.

View.HudRect = class {

  constructor () {
    this.shader = new GLX.Shader({
      source: shaders.texture,
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: [ 'uMatrix', 'uTexIndex']
    });

    const geometry = this.createGeometry();
    this.vertexBuffer   = new GLX.Buffer(3, new Float32Array(geometry.vertices));
    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(geometry.texCoords));
  }

  createGeometry () {
    const
      vertices = [],
      texCoords= [];

    vertices.push(0, 0, 1E-5,
                  1, 0, 1E-5,
                  1, 1, 1E-5);
    
    vertices.push(0, 0, 1E-5,
                  1, 1, 1E-5,
                  0, 1, 1E-5);

    texCoords.push(0.5,0.5,
                   1.0,0.5,
                   1.0,1.0);

    texCoords.push(0.5,0.5,
                   1.0,1.0,
                   0.5,1.0);

    return { vertices: vertices , texCoords: texCoords };
  }

  render (texture) {
    const shader = this.shader;

    shader.enable();
    
    GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, GLX.Matrix.identity().data);
    this.vertexBuffer.enable();

    GL.vertexAttribPointer(shader.attributes.aPosition, this.vertexBuffer.itemSize, GL.FLOAT, false, 0, 0);

    this.texCoordBuffer.enable();
    GL.vertexAttribPointer(shader.attributes.aTexCoord, this.texCoordBuffer.itemSize, GL.FLOAT, false, 0, 0);

    texture.enable(0);
    GL.uniform1i(shader.uniforms.uTexIndex, 0);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
  }

  destroy () {
    this.shader.destroy();
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();
  }
};