
class Horizon {

  constructor () {
    this.shader = new GLX.Shader({
      vertexShader: Shaders.horizon.vertex,
      fragmentShader: Shaders.horizon.fragment,
      shaderName: 'sky wall shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uAbsoluteHeight', 'uMatrix', 'uTexIndex', 'uFogColor']
    });

    this.v1 = this.v2 = this.v3 = this.v4 = [false, false, false];
    this.updateGeometry([[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]);

    this.floorShader = new GLX.Shader({
      vertexShader: Shaders.flat_color.vertex,
      fragmentShader: Shaders.flat_color.fragment,
      attributes: ['aPosition'],
      uniforms: ['uColor', 'uMatrix']
    });

    const url = '../src/skydome2.jpg';
    this.texture = new GLX.texture.Image().load(url, image => {
      if (image) {
        this.isReady = true;
      }
    });
  }

  updateGeometry (viewTrapezoid) {
    let
      v1 = [viewTrapezoid[3][0], viewTrapezoid[3][1], 0.0],
      v2 = [viewTrapezoid[2][0], viewTrapezoid[2][1], 0.0],
      v3 = [viewTrapezoid[2][0], viewTrapezoid[2][1], HORIZON_HEIGHT],
      v4 = [viewTrapezoid[3][0], viewTrapezoid[3][1], HORIZON_HEIGHT];

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

    if (this.vertexBuffer) {
      this.vertexBuffer.destroy();
    }

    const vertices = [...v1, ...v2, ...v3, ...v1, ...v3, ...v4];
    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

    if (this.texCoordBuffer) {
      this.texCoordBuffer.destroy();
    }

    const
      inverse = GLX.Matrix.invert(render.viewProjMatrix.data),
      vBottomCenter = getIntersectionWithXYPlane(0, -1, inverse),
      vLeftDir = norm2(sub2(v1, vBottomCenter)),
      vRightDir = norm2(sub2(v2, vBottomCenter));

    let
      vLeftArc = Math.atan2(vLeftDir[1], vLeftDir[0]) / (2 * Math.PI),
      vRightArc = Math.atan2(vRightDir[1], vRightDir[0]) / (2 * Math.PI);

    if (vLeftArc > vRightArc) {
      vRightArc += 1;
      //console.log(vLeftArc, vRightArc);
    }

    // var visibleSkyDiameterFraction = Math.asin(dot2( vLeftDir, vRightDir))/ (2*Math.PI);
    const
      tcLeft = vLeftArc, // APP.rotation/360.0;
      tcRight = vRightArc; // APP.rotation/360.0 + visibleSkyDiameterFraction*3;

    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array([tcLeft, 1, tcRight, 1, tcRight, 0, tcLeft, 1, tcRight, 0, tcLeft, 0]));

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
    if (!this.isReady) {
      return;
    }

    const
      shader = this.shader,
      fogColor = render.fogColor;

    shader.enable();

    shader.setParam('uFogColor', '3fv', fogColor);
    shader.setParam('uAbsoluteHeight', '1f', HORIZON_HEIGHT * 10.0);

    shader.setMatrix('uMatrix', '4fv', render.viewProjMatrix.data);

    shader.setBuffer('aPosition', this.vertexBuffer);
    shader.setBuffer('aTexCoord', this.texCoordBuffer);

    shader.setTexture('uTexIndex', 0, this.texture);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);
    shader.disable();

    this.floorShader.enable();

    this.floorShader.setParam('uColor', '4fv', [...fogColor, 1.0]);
    this.floorShader.setMatrix('uMatrix', '4fv', render.viewProjMatrix.data);
    this.floorShader.setBuffer('aPosition', this.floorVertexBuffer);

    GL.drawArrays(GL.TRIANGLE_FAN, 0, this.floorVertexBuffer.numItems);

    this.floorShader.disable();
  }

  destroy () {
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();
    this.floorVertexBuffer.destroy();
    this.vertexBuffer.destroy();

    this.shader.destroy();
    this.floorShader.destroy();
    this.texture.destroy();
  }
}
