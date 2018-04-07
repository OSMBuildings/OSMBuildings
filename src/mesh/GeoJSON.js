
mesh.GeoJSON = class {

  constructor(url, options) {
    options = options || {};
    this.options = options;

    this.forcedId = options.id;
    // no Qolor.toArray() needed as Triangulation does it internally
    this.forcedColor = options.color;

    this.replace   = !!options.replace;
    this.scale     = options.scale     || 1;
    this.rotation  = options.rotation  || 0;
    this.elevation = options.elevation || 0;

    this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), APP.minZoom);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), APP.maxZoom);
    if (this.maxZoom < this.minZoom) {
      this.minZoom = MIN_ZOOM;
      this.maxZoom = MAX_ZOOM;
    }

    this.items = [];

    APP.activity.setBusy("meshloading");

    APP.workers.get(worker => {
      this.worker = worker;

      // TODO: if loading fails, a worker should be returned to pool. Done, right?

      const onResult = function(e) {
        if(e.data !== 'error'){
            this.setData(e.data);
        }

        worker.removeEventListener('message', onResult, false); // remove this listener
        APP.workers.free(worker); // return worker to pool

        setTimeout(function () {
          APP.activity.setIdle("meshloading");
        }, 3000);

      }.bind(this);

      this.worker.addEventListener('message', onResult, false);

      if (typeof url === 'object') {
        worker.postMessage({ action: 'process', geojson: url, options: this.options });
      } else {
        worker.postMessage({ action: 'load', url: url, options: this.options });
      }
    });
  }

  setData(res) {
    this.items = res.items;
    this.position = res.position;

    this.vertexBuffer   = new GLX.Buffer(3, res.vertices);
    this.normalBuffer   = new GLX.Buffer(3, res.normals);
    this.colorBuffer    = new GLX.Buffer(3, res.colors);
    this.texCoordBuffer = new GLX.Buffer(2, res.texCoords);
    this.heightBuffer   = new GLX.Buffer(1, res.heights);

    const idColors = [];
    res.items.forEach(item => {
      const idColor = render.Picking.idToColor(item.id);

      for (let i = 0; i < item.vertexCount; i++) {
         idColors.push(idColor[0], idColor[1], idColor[2]);
      }
    });
    this.idBuffer = new GLX.Buffer(3, new Float32Array(idColors));

    Filter.apply(this);
    data.Index.add(this);

    this.fade = 0;
    this.isReady = true;

  }

  applyFilter() {} // TODO

  getFade() {
    if (this.fade >= 1) {
      return 1;
    }
    const fade = this.fade;
    this.fade += 1 / (1 * 60); // (duration * fps)
    return fade;
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
