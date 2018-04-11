class Activity {

  constructor () {
    this.jobs = {};
    this.delay = 1000;
  }

  setBusy (id) {
    if (this.jobs[id] && this.jobs[id].timer) {
      clearTimeout(this.jobs[id].timer);
    }
    this.jobs[id] = { id: id };
  }

  setIdle (id) {
    if (!this.jobs[id]) {
      return;
    }
    if (this.jobs[id].timer) {
      clearTimeout(this.jobs[id].timer);
    }
    this.jobs[id].timer = setTimeout(() => {
      delete this.jobs[id];
    }, this.delay);
  }

  isBusy () {
    let num = 0;
    for (let id in this.jobs) {
      num++;
    }
    return num > 0;
  }

  destroy () {
    for (let id in this.jobs) {
      if (this.jobs[id].timer) {
        clearTimeout(this.jobs[id].timer);
      }
    }
    this.jobs = {};
  }
}
