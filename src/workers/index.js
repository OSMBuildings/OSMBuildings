
class WorkerPool {

  constructor (path, num) {
    this.items = [];
    for (let i = 0; i < num; i++) {
      this.items[i] = new WorkerWrapper(path);
    }
  }

  get (callback) {
    // console.log(this.items.map(item => {
    //   return item.busy ? '▪' : '▫';
    // }).join(''));

    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i].busy) {
        this.items[i].busy = true;
        callback(this.items[i]);
        return;
      }
    }

    setTimeout(() => {
      this.get(callback);
    }, 50);
  }

  destroy () {
    this.items.forEach(item => item.destroy());
    this.items = [];
  }
}

