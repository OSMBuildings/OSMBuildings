
var Events = {};

(function() {

  var listeners = {};
  var emitDebounce;

  Events.on = function(type, fn) {
    if (!listeners[type]) {
      listeners[type] = [];
    }
    listeners[type].push(fn);
  };

  Events.off = function(type, fn) {};

  Events.emit = function(type, payload) {
    if (!listeners[type]) {
      return;
    }
    clearTimeout(emitDebounce);
    emitDebounce = setTimeout(function() {
      for (var i = 0, il = listeners[type].length; i < il; i++) {
        listeners[type][i](payload);
      }
    }, 1);
  };

  Events.destroy = function() {
    listeners = null;
  };

}());
