
class Marker {

  constructor () {

    this.shader = new GLX.Shader({
      vertexShader: Shaders.marker.vertex,
      fragmentShader: Shaders.marker.fragment,
      shaderName: 'marker shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: ['uViewMatrix', 'uModelMatrix', 'uTexIndex', 'uFogDistance', 'uFogBlurDistance', 'uLowerEdgePoint', 'uViewDirOnMap']
    });

    var geometry = this.createGeometry();
    this.vertexBuffer   = new GLX.Buffer(3, new Float32Array(geometry.vertices));
    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(geometry.texCoords));

  }

  render () {
    const layer = APP.basemapGrid;

    if (!layer) {
      return;
    }

    if (APP.zoom < layer.minZoom || APP.zoom > layer.maxZoom) {
      return;
    }

    const shader = this.shader;

    shader.enable();
    // GL.disable(GL.DEPTH_TEST);

    shader.setAllUniforms([
      ['uFogDistance',     '1f',  render.fogDistance],
      ['uFogBlurDistance', '1f',  render.fogBlurDistance],
      ['uViewDirOnMap',    '2fv', render.viewDirOnMap],
      ['uLowerEdgePoint',  '2fv', render.lowerLeftOnMap]
    ]);

    const zoom = Math.round(APP.zoom);

    let metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);
    let modelMatrix = new GLX.Matrix();

    // modelMatrix.translate( (tile.longitude- APP.position.longitude)* metersPerDegreeLongitude,
    //   -(tile.latitude - APP.position.latitude) * METERS_PER_DEGREE_LATITUDE, 0);
    modelMatrix.translate( (APP.position.longitude- APP.position.longitude)* metersPerDegreeLongitude,
      -(APP.position.latitude - APP.position.latitude) * METERS_PER_DEGREE_LATITUDE, 0);

    GL.enable(GL.POLYGON_OFFSET_FILL);

    //GL.polygonOffset(MAX_USED_ZOOM_LEVEL - tile.zoom, MAX_USED_ZOOM_LEVEL - tile.zoom);
    GL.polygonOffset(MAX_USED_ZOOM_LEVEL - 18, MAX_USED_ZOOM_LEVEL - 18);

    this.shader.setAllUniforms([
      ['uViewDirOnMap',   '2fv', render.viewDirOnMap],
      ['uLowerEdgePoint', '2fv', render.lowerLeftOnMap]
    ]);

    this.shader.setAllUniformMatrices([
      ['uModelMatrix', '4fv', modelMatrix.data],
      ['uViewMatrix',  '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix)]
    ]);

    // this.shader.bindBuffer('aPosition', tile.vertexBuffer);
    // this.shader.bindBuffer('aTexCoord', tile.texCoordBuffer);
    this.shader.bindBuffer('aPosition', this.vertexBuffer);
    this.shader.bindBuffer('aTexCoord', this.texCoordBuffer);
    //this.shader.bindTexture('uTexIndex', 0, tile.texture);

    //GL.drawArrays(GL.TRIANGLE_STRIP, 0, tile.vertexBuffer.numItems);
    GL.drawArrays(GL.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems);
    GL.disable(GL.POLYGON_OFFSET_FILL);
    console.log("rendi")

    shader.disable();
  }

  createGeometry  () {
    // var vertices = [],
    //   texCoords= [];
    // vertices.push(-1,-1, 1E-5,
    //   1,-1, 1E-5,
    //   1, 1, 1E-5);
    //
    // vertices.push(-1,-1, 1E-5,
    //   1, 1, 1E-5,
    //   -1, 1, 1E-5);

    var vertices = [
        0.5,  0.5,
        -0.5,  0.5,
        0.5, -0.5,
        -0.5, -0.5,
      ],
      texCoords= [];



    texCoords.push(0.0,0.0,
      1.0,0.0,
      1.0,1.0);

    texCoords.push(0.0,0.0,
      1.0,1.0,
      0.0,1.0);

    return { vertices: vertices , texCoords: texCoords };
  }

  destroy () {}
}
