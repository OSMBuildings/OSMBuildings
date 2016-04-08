
if (CustomEvent === undefined) {
  var CustomEvent = function(type, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail );
    return e;
  };

  CustomEvent.prototype = window.Event.prototype;
}

// adapted from https://raw.githubusercontent.com/seznam/JAK/master/lib/polyfills/gesturechange.js
// MIT License

if (!('ongesturechange' in window) && 'ontouchstart' in window) {
  (function() {

    var dist1 = 0;
    var angle1 = 0;
    var gestureStarted = false;

    document.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 2) { return; }
      var t1 = e.touches[0];
      var t2 = e.touches[1];
      var dx = t1.clientX - t2.clientX;
      var dy = t1.clientY - t2.clientY;
      dist1 = Math.sqrt(dx*dx+dy*dy);
      angle1 = Math.atan2(dy,dx);
      gestureStarted = true;
    }, false);

    document.addEventListener('touchmove', function(e) {
      if (e.touches.length !== 2) { return; }

      var t1 = e.touches[0];
      var t2 = e.touches[1];
      var dx = t1.clientX - t2.clientX;
      var dy = t1.clientY - t2.clientY;
      var dist2 = Math.sqrt(dx*dx+dy*dy);
      var angle2 = Math.atan2(dy,dx);

      var event = new CustomEvent('gesturechange', { bubbles: true });
      event.altKey = e.altKey;
      event.ctrlKey = e.ctrlKey;
      event.metaKey = e.metaKey;
      event.shiftKey = e.shiftKey;
      event.rotation = ((angle2 - angle1) * (180 / Math.PI)) % 360;
      event.scale = dist2/dist1;

      // setTimeout(function() { target.dispatchEvent(event); }, 0);
      e.target.dispatchEvent(event);
    }, false);

    document.addEventListener('touchend', function(e) {
      gestureStarted = false;
    }, false);

  }());
}
