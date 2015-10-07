
var Events = {};

(function() {

  var listeners = {};

  Events.on = function(type, fn) {
    if (!listeners[type]) {
      listeners[type] = { fn:[] };
    }

    listeners[type].fn.push(fn);
  };

  Events.off = function(type, fn) {
    if (!listeners[type]) {
      return;
    }
    var listenerFn = listeners[type].fn;
    for (var i = 0; i < listenerFn.length; i++) {
      if (listenerFn[i] === fn) {
        listenerFn.splice(i, 1);
        return;
      }
    }
  };

  Events.emit = function(type, payload) {
    if (!listeners[type]) {
      return;
    }

    var l = listeners[type];
    if (l.timer) {
      return;
    }
    l.timer = setTimeout(function() {
      l.timer = null;
      for (var i = 0, il = l.fn.length; i < il; i++) {
        l.fn[i](payload);
      }
    }, 17);
  };

  Events.destroy = function() {
    listeners = {};
  };

}());
