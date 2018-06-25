
// TODO: collision check

class FeatureCollection extends Collection {

  constructor (...args) {
    super(...args);
    this.tintCallback = () => {};
    this.zScaleCallback = () => {};

    // const numProc = Math.min(window.navigator.hardwareConcurrency, 4);
    // const blob = new Blob([featureWorker], { type: 'application/javascript' });
    this.workers = new WorkerPool(URL.createObjectURL(blob), 1);
  }

  setTintCallback (tintCallback) {
    this.tintCallback = tintCallback;
    this.forEach(item => {
      item.applyTintAndZScale();
    });
  }

  setZScaleCallback (zScaleCallback) {
    this.zScaleCallback = zScaleCallback;
    this.forEach(item => {
      item.applyTintAndZScale();
    });
  }

  destroy () {
    super.destroy();
    this.workers.destroy();
  }
}
