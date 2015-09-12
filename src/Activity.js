
var Activity = {};

(function() {

  var count = 0;
  var timer;

  Activity.setBusy = function(msg) {
    //if (msg) {
    //  console.log('setBusy', msg, count);
    //}

    if (!count) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      } else {
        Events.emit('busy');
      }
    }
    count++;
  };

  Activity.setIdle = function(msg) {
    if (!count) {
      return;
    }

    count--;
    if (!count) {
      timer = setTimeout(function() {
        timer = null;
        Events.emit('idle');
      }, 33);
    }

    //if (msg) {
    //  console.log('setIdle', msg, count);
    //}
  };

  Activity.isBusy = function() {
    return !!count;
  };

}());
