
class GeoJSONData extends DataItem {

  constructor (url, options, callback) {
    super(url, options, callback);
    this.load();
  }

  load () {
    APP.workers.get(worker => {
      const onResult = function (e) {
        if (e.data !== 'error') {
          this.setData(e.data);
        }

        worker.removeEventListener('message', onResult, false); // remove this listener
        APP.workers.free(worker); // return worker to pool

        if (this.callback) {
          this.callback();
        }
      }.bind(this);

      worker.addEventListener('message', onResult, false);

      if (typeof this.url === 'object') {
        worker.postMessage({ action: 'process', geojson: this.url, options: this.options });
      } else {
        worker.postMessage({ action: 'load', url: this.url, options: this.options });
      }
    });
  }
}
