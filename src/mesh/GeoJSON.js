
mesh.GeoJSON = class {

  constructor(url, options) {
    options = options || {};
    this.options = options;

    this.forcedId = options.id;
    // no Qolor.toArray() needed as Triangulation does it internally
    this.forcedColor = options.color;

    this.replace      = !!options.replace;
    this.scale        = options.scale     || 1;
    this.rotation     = options.rotation  || 0;
    this.elevation    = options.elevation || 0;
    this.shouldFadeIn = 'fadeIn' in options ? !!options.fadeIn : true;

    this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), APP.minZoom);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), APP.maxZoom);
    if (this.maxZoom < this.minZoom) {
      this.minZoom = MIN_ZOOM;
      this.maxZoom = MAX_ZOOM;
    }

    this.items = [];

    // const worker = new Worker('./../src/worker.js');

    APP.worker.addEventListener('message', e => this.setData(e), false);

    Activity.setBusy();
    if (typeof url === 'object') {
      APP.worker.postMessage({ action: 'process', geojson: url, options: this.options });
    } else {
      APP.worker.postMessage({ action: 'load', url: url, options: this.options });
    }
  }

  setData(e) {
    APP.worker.removeEventListener('message', this.setData, false);

    const res = e.data;

    this.items = res.items;
    this.position = res.position;

    this.vertexBuffer   = new GLX.Buffer(3, res.vertices);
    this.normalBuffer   = new GLX.Buffer(3, res.normals);
    this.colorBuffer    = new GLX.Buffer(3, res.colors);
    this.texCoordBuffer = new GLX.Buffer(2, res.texCoords);
    this.idBuffer       = new GLX.Buffer(3, res.idColors);

    this.initBuffers();

    Filter.apply(this);
    data.Index.add(this);

    this.isReady = true;
    Activity.setIdle();
  }

  initBuffers() {
    let
      start = Filter.getTime(),
      end = start;

    if (this.shouldFadeIn) {
      start += 250;
      end += 750;
    }

    const
      filters = [],
      heights = [];

    this.items.forEach(item => {
      item.filter = [start, end, 0, 1];
      for (let i = 0; i < item.vertexCount; i++) {
        filters.push.apply(filters, item.filter);
        heights.push(item.height);
      }
    });

    this.filterBuffer = new GLX.Buffer(4, new Float32Array(filters));
    this.heightBuffer = new GLX.Buffer(1, new Float32Array(heights));
  }

  applyFilter() {
    const filters = [];
    this.items.forEach(item => {
      for (let i = 0; i < item.vertexCount; i++) {
        filters.push.apply(filters, item.filter);
      }
    });

    this.filterBuffer = new GLX.Buffer(4, new Float32Array(filters));
  }

  // TODO: switch to a notation like mesh.transform
  getMatrix() {
    const matrix = new GLX.Matrix();

    if (this.elevation) {
      matrix.translate(0, 0, this.elevation);
    }

    matrix.scale(this.scale, this.scale, this.scale*HEIGHT_SCALE);

    if (this.rotation) {
      matrix.rotateZ(-this.rotation);
    }

    // this position is available once geometry processing is complete.
    // should not be failing before because of this.isReady
    const dLat = this.position.latitude - APP.position.latitude;
    const dLon = this.position.longitude - APP.position.longitude;

    const metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);

    matrix.translate( dLon*metersPerDegreeLongitude, -dLat*METERS_PER_DEGREE_LATITUDE, 0);

    return matrix;
  }

  destroy() {
    this.isReady = false;

    clearTimeout(this.relaxTimer);

    data.Index.remove(this);

    if (this.request) {
      this.request.abort(); // TODO: signal to workers
    }

    this.items = [];

    if (this.isReady) {
      this.vertexBuffer.destroy();
      this.normalBuffer.destroy();
      this.colorBuffer.destroy();
      this.texCoordBuffer.destroy();
      this.idBuffer.destroy();
      this.heightBuffer.destroy();
    }
  }
};
