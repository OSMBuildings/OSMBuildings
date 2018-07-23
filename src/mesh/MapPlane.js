
/* A 'MapPlane' object is a rectangular mesh in the X/Y plane (Z=0) that is
 * guaranteed to cover all of the area of that plane that is inside the skydome.
 *
 * A 'MapPlane' is untextured and featureless. Its intended use is as a stand-in
 * for a 'BaseMap' in situations where either using the actual BaseMap would be
 * inefficient (e.g. when the BaseMap would be rendered without a texture) or
 * no BaseMap is present (e.g. if OSMBuildings is used as an overlay to Leaflet
 * or MapBoxGL). This mostly applies to creating depth and normal textures of the
 * scene, not to the actual shaded scene rendering.
 */

class MapPlane {

  constructor () {
    this.size = 5000;

    this.minZoom = APP.minZoom;
    this.maxZoom = APP.maxZoom;

    this.matrix = new GLX.Matrix();

    this.createGeometry();
  }

  createGeometry () {
    const
      NUM_SEGMENTS = 50,
      segmentSize = 2*this.size / NUM_SEGMENTS,
      normal = [0, 0, 1],
      quadNormals = [...normal, ...normal, ...normal, ...normal, ...normal, ...normal],
      vertices = [],
      normals = [],
      zScale = [];

    for (let x = 0; x < NUM_SEGMENTS; x++) {
      for (let y = 0; y < NUM_SEGMENTS; y++) {
        const
          baseX = -this.size + x * segmentSize,
          baseY = -this.size + y * segmentSize;

        vertices.push(
          baseX, baseY, 0,
          baseX + segmentSize, baseY + segmentSize, 0,
          baseX + segmentSize, baseY, 0,

          baseX, baseY, 0,
          baseX, baseY + segmentSize, 0,
          baseX + segmentSize, baseY + segmentSize, 0);

        normals.push(...quadNormals);

        // vertices.push(
        //   baseX, baseY, 0,
        //   baseX + segmentSize, baseY, 0,
        //   baseX + segmentSize, baseY + segmentSize, 0,
        //
        //   baseX, baseY, 0,
        //   baseX + segmentSize, baseY + segmentSize, 0,
        //   baseX, baseY + segmentSize, 0);
        //
        // normals.push(...quadNormals);

        zScale.push(1, 1, 1, 1, 1, 1);
      }
    }

    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));
    this.normalBuffer = new GLX.Buffer(3, new Float32Array(normals));
    this.zScaleBuffer = new GLX.Buffer(1, new Float32Array(zScale));
  }

  getFade () {
    return 1;
  }

  getMatrix () {
    // const scale = Math.pow(2, APP.zoom - 16);
    // this.matrix.scale(scale, scale, scale);
    return this.matrix;
  }

  destroy () {
    this.vertexBuffer.destroy();
    this.normalBuffer.destroy();
  }
}
