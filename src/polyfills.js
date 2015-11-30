
function CustomEvent(type, params) {
  params = params || { bubbles: false, cancelable: false, detail: undefined };
  var e = document.createEvent( 'CustomEvent' );
  e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail );
  return e;
}

CustomEvent.prototype = window.Event.prototype;

//window.CustomEvent = CustomEvent;
