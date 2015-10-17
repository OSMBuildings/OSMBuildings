
var Events = {};

(function() {

  var listeners = {};

  Events.emit = function(type, payload) {
    if (!listeners[type]) {
      return;
    }

    var l = listeners[type];

    requestAnimationFrame(function() {
      for (var i = 0, il = l.length; i < il; i++) {
        l[i](payload);
      }
    });
  };

  Events.on = function(type, fn) {
    if (!listeners[type]) {
      listeners[type] = [];
    }
    listeners[type].push(fn);
  };

  Events.off = function(type, fn) {
    if (!listeners[type]) {
      return;
    }
    var l = listeners[type];
    for (var i = 0; i < l.length; i++) {
      if (l[i] === fn) {
        l.splice(i, 1);
        return;
      }
    }
  };

  Events.destroy = function() {
    listeners = {};
  };

}());
