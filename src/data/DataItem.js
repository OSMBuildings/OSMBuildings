
class DataItem {

  constructor (type, url, options = {}, callback) {
    this.type = type;
    this.url = url;
    this.options = options;
    this.callback = callback || function () {};

    this.id = options.id;
    this.color = options.color;
    this.scale = options.scale || 1;
    this.rotation = options.rotation || 0;
    this.elevation = options.elevation || 0;

    this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), APP.minZoom);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), APP.maxZoom);

    if (this.maxZoom < this.minZoom) {
      this.minZoom = MIN_ZOOM;
      this.maxZoom = MAX_ZOOM;
    }

    this.load();
  }

  load () {
    APP.workers.get(worker => {
      worker.onMessage(res => {
        if (res === 'error') {
          this.callback();
          worker.free();
          return;
        }

        if (res === 'load') {
          this.callback();
          return;
        }

        this.onLoad(res);
        worker.free();
      });

      worker.postMessage({ type: this.type, url: this.url, options: this.options });
    });
  }

  onLoad (res) {

    //****** init matrix **********************************

    this.position = res.position;

    this.prevX = 0;
    this.prevY = 0;

    this.matrix = new GLX.Matrix();

    if (this.elevation) {
      this.translate(0, 0, this.elevation);
    }

    this.scaleX(this.scale);

    if (this.rotation) {
      this.rotate(-this.rotation);
    }

    //****** init buffers *********************************

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

  // TODO
  scaleX (scale) {
    this.matrix.scale(scale, scale, scale);
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
    DataIndex.remove(this);

    // if (this.request) {
    //   this.request.abort(); // TODO: signal to workers
    // }

    this.items = [];

    if (this.isReady) {
      this.isReady = false;
      this.vertexBuffer.destroy();
      this.normalBuffer.destroy();
      this.colorBuffer.destroy();
      this.texCoordBuffer.destroy();
      this.idBuffer.destroy();
      this.heightBuffer.destroy();
    }
  }
}
