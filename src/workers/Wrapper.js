
class WorkerWrapper {

  constructor (path) {
    this.busy = false;
    this.thread = new Worker(path);
  }

  postMessage (message) {
    this.thread.postMessage(message);
  }

  onMessage (callback) {
    this.thread.onmessage = function (e) {
      callback(e.data);
    };
  }

  free () {
    this.thread.onmessage = function (e) {};
    this.busy = false;
  }

  destroy () {
    this.thread.close();
  }
}
