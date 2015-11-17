
var Activity = {};

// TODO: could turn into a public loading handler
// OSMB.loader - stop(), start(), isBusy(), events..

(function() {

  var count = 0;
  var debounce;

  Activity.setBusy = function() {
    //console.log('setBusy', count);

    if (!count) {
      if (debounce) {
        clearTimeout(debounce);
        debounce = null;
      } else {
        APP.emit('busy');
      }
    }
    count++;
  };

  Activity.setIdle = function() {
    if (!count) {
      return;
    }

    count--;
    if (!count) {
      debounce = setTimeout(function() {
        debounce = null;
        APP.emit('idle');
      }, 33);
    }

    //console.log('setIdle', count);
  };

  Activity.isBusy = function() {
    return !!count;
  };

}());
