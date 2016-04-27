
if (CustomEvent === undefined) {
  var CustomEvent = function(type, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail );
    return e;
  };

  CustomEvent.prototype = window.Event.prototype;
}
