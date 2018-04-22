// TODO: should be part of Render

class Activity {

  constructor (delay = 0) {
    this.delay = delay;
    this.value = 0;
  }

  setBusyUser () {
    if (this.userTimer) {
      clearTimeout(this.userTimer);
    }
     this.value = this.value | 1;
    // console.log('BUSY User');
  }

  setIdleUser () {
    if (this.userTimer) {
       clearTimeout(this.userTimer);
    }
    this.userTimer = setTimeout(() => {
      this.value = this.value & 2;
     // console.log('IDLE User');
    }, this.delay);
  }

  isBusyUser () {
    return (this.value & 1)?true:false;
  }
// ----------------------------
  setBusyData () {
    if (this.dataTimer) {
      clearTimeout(this.dataTimer);
    }
    this.value = this.value | 2;
    // console.log('BUSY Data');
  }

  setIdleData () {
    if (this.dataTimer) {
       clearTimeout(this.dataTimer);
    }
    this.dataTimer = setTimeout(() => {
      this.value = this.value & 1;
      //console.log('IDLE Data');
    }, this.delay);
  }

  isBusyData () {
    return (this.value & 2)?true:false;
  }

  destroy () {
    if (this.dataTimer) {
      clearTimeout(this.dataTimer);
    }
    if (this.userTimer) {
      clearTimeout(this.userTimer);
    }
    this.value = 0;
  }
}

// /**************************
//   value:
//  counting in decimal, binary
//  0      0              //nothing busy
//  1      1       2^0    // busy user
//  2     10       2^1    // busy data loading
//  3     11              // busy both
//  **************************/