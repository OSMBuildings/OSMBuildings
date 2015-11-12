
var Events = {};

(function() {
  Events.emit = function(type, payload) {
  
    var event = new CustomEvent( type, {detail:payload});
    gl.canvas.dispatchEvent(event);
  };

  Events.on = function(type, fn) {
    gl.canvas.addEventListener(type, fn);
  };

  Events.off = function(type, fn) {
    gl.canvas.removeEventListener(type, fn);
  };

  Events.destroy = function() {
  };

}());
