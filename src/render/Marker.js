class Marker {

  constructor () {

    this.shader = new GLX.Shader({
      vertexShader: Shaders.marker.vertex,
      fragmentShader: Shaders.marker.fragment,
      shaderName: 'marker shader',
      attributes: ['aPosition'],
      uniforms: ['uViewMatrix']
    });

    // http://localhost/git/OSMBuildings/test/?lat=55.750472&lon=37.641382&zoom=16.8&tilt=49.9&rotation=225.8

    this.poly = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  37.634793519973755,
                  55.75022514787899
                ],
                [
                  37.64390230178832,
                  55.75022514787899
                ],
                [
                  37.64390230178832,
                  55.75396865656196
                ],
                [
                  37.634793519973755,
                  55.75396865656196
                ],
                [
                  37.634793519973755,
                  55.75022514787899
                ]
              ]
            ]
          }
        }
      ]
    };

    this.vertexBuffer = [];
    this.texCoordBuffer = [];

    this.handleGeometry(this.poly);
  }

  render () {

    const shader = this.shader;

    shader.enable();
    GL.disable(GL.DEPTH_TEST);
    GL.viewport(0, 0, APP.width, APP.height);

    //clear canvas
    // GL.clearColor(0.1, 0, 0, 1);
    // GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // shader.setParam('uFogDistance',     '1f',  render.fogDistance);
    // shader.setParam('uFogBlurDistance', '1f',  render.fogBlurDistance);
    // shader.setParam('uViewDirOnMap',    '2fv', render.viewDirOnMap);
    // shader.setParam('uLowerEdgePoint',  '2fv', render.lowerLeftOnMap);

    let metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);
    let modelMatrix = new GLX.Matrix();

    // modelMatrix.translate( (tile.longitude- APP.position.longitude)* metersPerDegreeLongitude,
    //   -(tile.latitude - APP.position.latitude) * METERS_PER_DEGREE_LATITUDE, 0);

    // hard coded position of data
    modelMatrix.translate((37.638721 - APP.position.longitude) * metersPerDegreeLongitude,
      -(55.751914 - APP.position.latitude) * METERS_PER_DEGREE_LATITUDE, 0);

    // GL.enable(GL.POLYGON_OFFSET_FILL);

    // GL.polygonOffset(MAX_USED_ZOOM_LEVEL - tile.zoom, MAX_USED_ZOOM_LEVEL - tile.zoom);
    // GL.polygonOffset(MAX_USED_ZOOM_LEVEL - 18, MAX_USED_ZOOM_LEVEL - 18);

    // this.shader.setParam('uViewDirOnMap',   '2fv', render.viewDirOnMap);
    // this.shader.setParam('uLowerEdgePoint', '2fv', render.lowerLeftOnMap);

    // this.shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
    this.shader.setMatrix('uViewMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, render.viewProjMatrix));

    this.shader.setBuffer('aPosition', this.vertexBuffer);

    // GL.drawArrays(GL.TRIANGLE_STRIP, 0, tile.vertexBuffer.numItems);
    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);
    // GL.disable(GL.POLYGON_OFFSET_FILL);

    GL.enable(GL.DEPTH_TEST);
    shader.disable();
  }

  handleGeometry (geojson) {

    const tri = {
      vertices: [],
      normals: [],
      colors: [],
      texCoords: [],
      heights: [],
      pickingColors: []
    };

    const
      items = [],
      origin = this.getOrigin(geojson.features[0].geometry),
      position = { latitude: origin[1], longitude: origin[0] };

    geojson.features.forEach(feature => {

      var options = { id: 1 };

      const
        properties = feature.properties,
        id = options.id || properties.relationId || feature.id || properties.id;
      //pickingColor = this.getPickingColor(i);

      let vertexCount = tri.vertices.length;
      triangulate(tri, feature, origin);
      vertexCount = (tri.vertices.length - vertexCount) / 3;

      for (let i = 0; i < vertexCount; i++) {
        tri.heights.push(properties.height);
        // tri.pickingColors.push(...pickingColor);
      }

      items.push({ id: id, properties: properties, vertexCount: vertexCount });
    });

    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(tri.vertices));
    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(tri.texCoords));
  }

  getOrigin (geometry) {
    const coordinates = geometry.coordinates;
    switch (geometry.type) {
      case 'Point':
        return coordinates;

      case 'MultiPoint':
      case 'LineString':
        return coordinates[0];

      case 'MultiLineString':
      case 'Polygon':
        return coordinates[0][0];

      case 'MultiPolygon':
        return coordinates[0][0][0];
    }
  }

  // getPickingColor (i) {
  //   i++;
  //   return [0, (i & 0xff) / 255, ((i >> 8) & 0xff) / 255];
  // }

  destroy () {
  }
}
