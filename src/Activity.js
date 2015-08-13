
var Activity = {};

(function() {

  var id = 0;
  var items = [];
  var stack = 0;

  Activity.setBusy = function() {
    var key = ++id;
    if (!items.length) {
      Events.emit('busy');
    }
    if (items.indexOf(key) === -1) {
      items.push(key);
      stack++;
    }
    return key;
  };

  Activity.setIdle = function(key) {
    if (!items.length) {
      return;
    }
    var i = items.indexOf(key);
    if (i > -1) {
      items.splice(i, 1);
      stack--;
    }
    if (!items.length) {
      Events.emit('idle');
console.log('STACK', stack);
      id = 0;
    }
  };

  Activity.isBusy = function() {
    return !!items.length;
  };

}());
