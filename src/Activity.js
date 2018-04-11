// TODO: should be part of Render

class Activity {

  constructor () {
    this.busy = false;
    // console.log('IDLE');
    this.delay = 1000;
  }

  setBusy () {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.busy = true;
    // console.log('BUSY');
  }

  setIdle () {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.busy = false;
      // console.log('IDLE');
    }, this.delay);
  }

  isBusy () {
    return this.busy;
  }

  destroy () {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.busy = false;
    // console.log('IDLE');
  }
}
