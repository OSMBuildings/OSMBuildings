
View.Horizon = class {

  constructor () {
    this.HORIZON_HEIGHT = 2000;

    this.skyShader = new GLX.Shader({
      source: shaders.horizon,
      attributes: ['aPosition'],
      uniforms: ['uAbsoluteHeight', 'uMatrix', 'uFogColor']
    });

    this.v1 = this.v2 = this.v3 = this.v4 = [false, false, false];
    this.updateGeometry([[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]);

    this.floorShader = new GLX.Shader({
      source: shaders.flat_color,
      attributes: ['aPosition'],
      uniforms: ['uColor', 'uMatrix']
    });
  }

  updateGeometry (viewTrapezoid) {
    let
      v1 = [viewTrapezoid[3][0], viewTrapezoid[3][1], 0.0],
      v2 = [viewTrapezoid[2][0], viewTrapezoid[2][1], 0.0],
      v3 = [viewTrapezoid[2][0], viewTrapezoid[2][1], this.HORIZON_HEIGHT],
      v4 = [viewTrapezoid[3][0], viewTrapezoid[3][1], this.HORIZON_HEIGHT];

    if (
      equal3(v1, this.v1) &&
      equal3(v2, this.v2) &&
      equal3(v3, this.v3) &&
      equal3(v4, this.v4)) {
      return; //still up-to-date
    }

    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
    this.v4 = v4;

    if (this.skyVertexBuffer) {
      this.skyVertexBuffer.destroy();
    }

    const vertices = [...v1, ...v2, ...v3, ...v1, ...v3, ...v4];
    this.skyVertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

    v1 = [viewTrapezoid[0][0], viewTrapezoid[0][1], 1];
    v2 = [viewTrapezoid[1][0], viewTrapezoid[1][1], 1];
    v3 = [viewTrapezoid[2][0], viewTrapezoid[2][1], 1];
    v4 = [viewTrapezoid[3][0], viewTrapezoid[3][1], 1];

    if (this.floorVertexBuffer) {
      this.floorVertexBuffer.destroy();
    }

    this.floorVertexBuffer = new GLX.Buffer(3, new Float32Array([...v1, ...v2, ...v3, ...v4]));
  }

  render () {
    const
      skyShader = this.skyShader,
      floorShader = this.floorShader,
      fogColor = APP.view.fogColor;

    skyShader.enable();

    skyShader.setParam('uFogColor', '3fv', fogColor);
    skyShader.setParam('uAbsoluteHeight', '1f', this.HORIZON_HEIGHT * 10.0);
    skyShader.setMatrix('uMatrix', '4fv', APP.view.viewProjMatrix.data);
    skyShader.setBuffer('aPosition', this.skyVertexBuffer);

    GL.drawArrays(GL.TRIANGLES, 0, this.skyVertexBuffer.numItems);
    
    skyShader.disable();

    
    floorShader.enable();

    floorShader.setParam('uColor', '4fv', [...fogColor, 1.0]);
    floorShader.setMatrix('uMatrix', '4fv', APP.view.viewProjMatrix.data);
    floorShader.setBuffer('aPosition', this.floorVertexBuffer);

    GL.drawArrays(GL.TRIANGLE_FAN, 0, this.floorVertexBuffer.numItems);

    floorShader.disable();
  }

  destroy () {
    this.skyVertexBuffer.destroy();
    this.skyShader.destroy();

    this.floorVertexBuffer.destroy();
    this.floorShader.destroy();
  }
};