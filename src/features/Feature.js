
class Feature {

  constructor (type, url, options = {}, callback = function () {}) {
    this.type = type;
    this.options = options;
    this.callback = callback;

    this.id = options.id;
    this.color = options.color;

    this.matrix = new GLX.Matrix();
    this.scale(options.scale || 1);
    this.rotate(options.rotation || 0);

    this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), APP.minZoom);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), APP.maxZoom);

    if (this.maxZoom < this.minZoom) {
      this.minZoom = MIN_ZOOM;
      this.maxZoom = MAX_ZOOM;
    }

    this.load(url);
  }

  load (url) {
    // TODO: perhaps have some workers attached to collection and just ask for them
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

      worker.postMessage({ type: this.type, url: url, options: this.options });
    });
  }

  onLoad (res) {
    this.longitude = res.position.longitude;
    this.latitude = res.position.latitude;
    this.metersPerLon = METERS_PER_DEGREE_LATITUDE * Math.cos(this.latitude / 180 * Math.PI);

    //****** init buffers *********************************

    // this cascade ralaxes rendering a lot when new tile data arrives
    // TODO: destroy properly, even while this cascade might run -> make each step abortable
    this.vertexBuffer = new GLX.Buffer(3, res.vertices);
    this.timer = setTimeout(() => {
      this.normalBuffer = new GLX.Buffer(3, res.normals);
      this.timer = setTimeout(() => {
        this.colorBuffer = new GLX.Buffer(3, res.colors);
        this.timer = setTimeout(() => {
          this.texCoordBuffer = new GLX.Buffer(2, res.texCoords);
          this.timer = setTimeout(() => {
            this.heightBuffer = new GLX.Buffer(1, res.heights);
            this.timer = setTimeout(() => {
              this.pickingBuffer = new GLX.Buffer(3, res.pickingColors);
              this.timer = setTimeout(() => {
                this.items = res.items;
                this.applyTintAndZScale();
                APP.features.add(this);
                this.fade = 0;
              }, 20);
            }, 20);
          }, 20);
        }, 20);
      }, 20);
    }, 20);
  }

  translateBy (x = 0, y = 0, z = 0) {
    this.matrix.translateBy(x, y, z);
  }

  scale (scaling) {
    this.matrix.scale(scaling, scaling, scaling);
  }

  rotate (angle) {
    this.matrix.rotateZ(-angle);
  }

  getMatrix () {
    this.matrix.translateTo(
      (this.longitude - APP.position.longitude) * this.metersPerLon,
      (APP.position.latitude-this.latitude) * METERS_PER_DEGREE_LATITUDE,
      0
    );
    return this.matrix;
  }

  getFade () {
    if (this.fade >= 1) {
      return 1;
    }

    APP.view.speedUp();

    const fade = this.fade;
    this.fade += 1 / (1 * 60); // (duration * fps)

    return fade;
  }

  applyTintAndZScale () {
    const tintColors = [];
    const tintCallback = APP.features.tintCallback;
    const zScales = [];
    const zScaleCallback = APP.features.zScaleCallback;

    this.items.forEach(item => {
      const f = { id: item.id, properties: item.properties }; // perhaps pass center/bbox as well
      const tintColor = tintCallback(f);
      const col = tintColor ? [...Qolor.parse(tintColor).toArray(), 1] : [0, 0, 0, 0];
      const hideFlag = zScaleCallback(f);
      for (let i = 0; i < item.vertexCount; i++) {
        tintColors.push(...col);
        zScales.push(hideFlag ? 0 : 1);
      }
    });

    // perhaps mix colors in JS and transfer just one color buffer
    this.tintBuffer = new GLX.Buffer(4, new Float32Array(tintColors));
    this.zScaleBuffer = new GLX.Buffer(1, new Float32Array(zScales));
  }

  destroy () {
    APP.features.remove(this);

    // if (this.request) {
    //   this.request.abort(); // TODO: signal to workers
    // }

    clearTimeout(this.timer);

    this.vertexBuffer && this.vertexBuffer.destroy();
    this.normalBuffer && this.normalBuffer.destroy();
    this.colorBuffer && this.colorBuffer.destroy();
    this.texCoordBuffer && this.texCoordBuffer.destroy();
    this.heightBuffer && this.heightBuffer.destroy();
    this.pickingBuffer && this.pickingBuffer.destroy();
    this.tintBuffer && this.tintBuffer.destroy();
    this.zScaleBuffer && this.zScaleBuffer.destroy();

    this.items = [];
  }
}
