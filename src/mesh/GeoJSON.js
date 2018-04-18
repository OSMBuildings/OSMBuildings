mesh.GeoJSON = class {

  constructor (url, options, callback) {
    options = options || {};
    this.options = options;

    this.forcedId = options.id;
    // no Qolor.toArray() needed as Triangulation does it internally
    this.forcedColor = options.color;

    this.replace = !!options.replace;
    this.scale = options.scale || 1;
    this.rotation = options.rotation || 0;
    this.elevation = options.elevation || 0;

    this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), APP.minZoom);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), APP.maxZoom);
    if (this.maxZoom < this.minZoom) {
      this.minZoom = MIN_ZOOM;
      this.maxZoom = MAX_ZOOM;
    }

    this.items = [];

    APP.workers.get(worker => {
      this.worker = worker;

      const onResult = function (e) {
        if (e.data !== 'error') {
          this.setData(e.data);
        }

        worker.removeEventListener('message', onResult, false); // remove this listener
        APP.workers.free(worker); // return worker to pool

        if (callback) {
          callback();
        }
      }.bind(this);

      this.worker.addEventListener('message', onResult, false);

      if (typeof url === 'object') {
        worker.postMessage({ action: 'process', geojson: url, options: this.options });
      } else {
        worker.postMessage({ action: 'load', url: url, options: this.options });
      }
    });
  }

  setData (res) {

    //****** init matrix **********************************

    this.position = res.position;

    this.prevX = 0; this.prevY = 0;

    this.matrix = new GLX.Matrix();

    if (this.elevation) { // means floating
      this.translate(0, 0, this.elevation);
    }

    this.scaleX(this.scale);

    if (this.rotation) {
      this.rotate(-this.rotation);
    }

    //*****************************************************

    this.items = res.items;

    this.vertexBuffer = new GLX.Buffer(3, res.vertices);
    setTimeout(() => {
      this.normalBuffer = new GLX.Buffer(3, res.normals);
      setTimeout(() => {
        this.colorBuffer = new GLX.Buffer(3, res.colors);
        setTimeout(() => {
          this.texCoordBuffer = new GLX.Buffer(2, res.texCoords);
          setTimeout(() => {
            this.heightBuffer = new GLX.Buffer(1, res.heights);
            setTimeout(() => {
              const idColors = [];
              res.items.forEach(item => {
                const idColor = render.Picking.idToColor(item.id);
                
                for (let i = 0; i < item.vertexCount; i++) {
                  idColors.push(idColor[0], idColor[1], idColor[2]);
                }
              });
              this.idBuffer = new GLX.Buffer(3, new Float32Array(idColors));

              DataIndex.add(this);

              APP.activity.setBusy();

              this.fade = 0;
              this.isReady = true;
            }, 10);
          }, 10);
        }, 10);
      }, 10);
    }, 10);
  }

  getFade () {
    if (this.fade >= 1) {
      return 1;
    }

    const fade = this.fade;
    this.fade += 1 / (1 * 60); // (duration * fps)

    if (this.fade >= 1) {
      APP.activity.setIdle();
    }

    return fade;
  }

  translate (x = 0, y = 0, z = 0) {
    this.matrix.translate(x, y, z);
  }

  scaleX (scale) {
    this.matrix.scale(scale, scale, scale * HEIGHT_SCALE);
  }

  rotate (angle) {
    this.matrix.scale(-angle);
  }

  getMatrix () {
    // this position is available once geometry processing is complete.
    // should not be failing before (because of this.isReady)
    const
      x = (this.position.longitude - APP.position.longitude) - this.prevX,
      y = (this.position.latitude - APP.position.latitude) - this.prevY;

    // TODO: calc this once per renderFrame()
    const metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);

    this.matrix.translate(x * metersPerDegreeLongitude, -y * METERS_PER_DEGREE_LATITUDE, 0);

    this.prevX = (this.position.longitude - APP.position.longitude);
    this.prevY =(this.position.latitude - APP.position.latitude);

    return this.matrix;
  }

  destroy () {
    this.isReady = false;

    clearTimeout(this.relaxTimer);

    DataIndex.remove(this);

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
