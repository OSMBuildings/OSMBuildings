class Marker {

  constructor () {

    this.shader = new GLX.Shader({
      vertexShader: Shaders.marker.vertex,
      fragmentShader: Shaders.marker.fragment,
      shaderName: 'marker shader',
      attributes: ['aPosition'],
      uniforms: ['uMatrix']
    });

    // http://localhost/git/OSMBuildings/test/?lat=55.750472&lon=37.641382&zoom=16.8&tilt=49.9&rotation=225.8

    this.points = [
      [
        37.634793519973755,
        55.75022514787899,
        30
      ],
      [
        37.64390230178832,
        55.75022514787899,
        30
      ],
      [
        37.64390230178832,
        55.75396865656196,
        30
      ],
      [
        37.634793519973755,
        55.75396865656196,
        30
      ]
    ];

    this.vertexBuffer = [];
    this.texCoordBuffer = [];

    this.origin = [ APP.position.longitude, APP.position.latitude ];
    this.size = 50;

    this.handleGeometry(this.points);
  }

  render () {

    const shader = this.shader;

    shader.enable();

    // shader.setParam('uFogDistance',     '1f',  render.fogDistance);
    // shader.setParam('uFogBlurDistance', '1f',  render.fogBlurDistance);
    // shader.setParam('uViewDirOnMap',    '2fv', render.viewDirOnMap);
    // shader.setParam('uLowerEdgePoint',  '2fv', render.lowerLeftOnMap);

    const metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);

    const modelMatrix = new GLX.Matrix();
    modelMatrix.translate(
      (this.origin[0] - APP.position.longitude) * metersPerDegreeLongitude,
      -(this.origin[1] - APP.position.latitude) * METERS_PER_DEGREE_LATITUDE,
      0
    );

    // this.shader.setParam('uViewDirOnMap',   '2fv', render.viewDirOnMap);
    // this.shader.setParam('uLowerEdgePoint', '2fv', render.lowerLeftOnMap);
    // this.shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);

    this.shader.setMatrix('uMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix));
    this.shader.setBuffer('aPosition', this.vertexBuffer);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
  }

  handleGeometry (points) {
    const vertices = [];
    points.forEach(p => {
      const P = this.project(p);
      vertices.push(
        P[0]-25, P[1]-25, p[2],
        P[0]+25, P[1]-25, p[2],
        P[0]-25, P[1]+25, p[2],
        P[0]+25, P[1]-25, p[2],
        P[0]+25, P[1]+25, p[2],
        P[0]-25, P[1]+25, p[2]
      )
    });

    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));
  }

  project (point) {
    let METERS_PER_DEGREE_LATITUDE = 6378137 * Math.PI / 180;
    let scale = [METERS_PER_DEGREE_LATITUDE*Math.cos(point[1]/180*Math.PI), METERS_PER_DEGREE_LATITUDE];
    return [
      (point[0]-this.origin[0])*scale[0],
      -(point[1]-this.origin[1])*scale[1]
    ];
  }

  destroy () {
    this.vertexBuffer.destroy();
  }
}
