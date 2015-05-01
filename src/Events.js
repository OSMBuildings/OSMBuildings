
var Events = {};

(function() {

  var
    listeners = {},

    hasTouch = ('ontouchstart' in window),
    dragStartEvent = hasTouch ? 'touchstart' : 'mousedown',
    dragMoveEvent = hasTouch ? 'touchmove' : 'mousemove',
    dragEndEvent = hasTouch ? 'touchend' : 'mouseup',

    startX = 0,
    startY = 0,
    startZoom = 0,
    startRotation = 0,
    startTilt = 0,

    button,
    stepX, stepY,

    isDisabled = false,
    isDragging = false,
    resizeTimer;

  function onDragStart(e) {
    if (isDisabled || e.button > 1) {
      return;
    }

    cancelEvent(e);

    startZoom = Map.zoom;
    startRotation = Map.rotation;
    startTilt = Map.tilt;

    stepX = 360/innerWidth;
    stepY = 360/innerHeight;

    if (e.touches === undefined) {
      button = e.button;
    } else {
      if (e.touches.length>1) {
        return;
      }
      e = e.touches[0];
    }

    startX = e.clientX;
    startY = e.clientY;

    isDragging = true;
  }

  function onDragMove(e) {
    if (isDisabled || !isDragging) {
      return;
    }

    if (e.touches !== undefined) {
      if (e.touches.length>1) {
        return;
      }
      e = e.touches[0];
    }

    if (e.touches !== undefined || button === 0) {
      moveMap(e);
    } else {
      startRotation += (e.clientX - startX)*stepX;
      startTilt     -= (e.clientY - startY)*stepY;
      Map.setRotation(startRotation);
      Map.setTilt(startTilt);
    }

    startX = e.clientX;
    startY = e.clientY;
  }

  function onDragEnd(e) {
    if (isDisabled || !isDragging) {
      return;
    }

    if (e.touches !== undefined) {
      if (e.touches.length>1) {
        return;
      }
      e = e.touches[0];
    }

    if (e.touches !== undefined || button === 0) {
      moveMap(e);
    } else {
      startRotation += (e.clientX - startX)*stepX;
      startTilt     -= (e.clientY - startY)*stepY;
      Map.setRotation(startRotation);
      Map.setTilt(startTilt);
    }

    isDragging = false;
  }

  function onGestureChange(e) {
    if (isDisabled) {
      return;
    }
    cancelEvent(e);
    Map.setZoom(startZoom + (e.scale - 1));
    Map.setRotation(startRotation - e.rotation);
//  Map.setTilt(startTilt ...);
  }

  function onDoubleClick(e) {
    if (isDisabled) {
      return;
    }
    cancelEvent(e);
    Map.setZoom(Map.zoom + 1, e);
  }

  function onMouseWheel(e) {
    if (isDisabled) {
      return;
    }
    cancelEvent(e);
    var delta = 0;
    if (e.wheelDeltaY) {
      delta = e.wheelDeltaY;
    } else if (e.wheelDelta) {
      delta = e.wheelDelta;
    } else if (e.detail) {
      delta = -e.detail;
    }

    var adjust = 0.2*(delta>0 ? 1 : delta<0 ? -1 : 0);
    Map.setZoom(Map.zoom + adjust, e);
  }

  //***************************************************************************

  function moveMap(e) {
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    var r = rotatePoint(dx, dy, Map.rotation*Math.PI/180);
    Map.setCenter(unproject(Map.origin.x - r.x, Map.origin.y - r.y, Map.worldSize));
  }

  //***************************************************************************

  Events.init = function(container) {
    addListener(container, dragStartEvent, onDragStart);
    addListener(container, 'dblclick', onDoubleClick);
    addListener(document, dragMoveEvent, onDragMove);
    addListener(document, dragEndEvent, onDragEnd);

    if (hasTouch) {
      addListener(container, 'gesturechange', onGestureChange);
    } else {
      addListener(container, 'mousewheel', onMouseWheel);
      addListener(container, 'DOMMouseScroll', onMouseWheel);
    }

    addListener(window, 'resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
  //      if (Map.size.width !== container.offsetWidth || Map.size.height !== container.offsetHeight) {
  //        Map.setSize({ width: container.offsetWidth, height: container.offsetHeight });
  //      }
      }, 250);
    });
  };

  Events.on = function(type, fn) {
    if (!listeners[type]) {
     listeners[type] = [];
    }
    listeners[type].push(fn);
  };

  Events.off = function(type, fn) {};

  Events.emit = function(type) {
    if (!listeners[type]) {
      return;
    }
    for (var i = 0, il = listeners[type].length; i<il; i++) {
      listeners[type][i]();
    }
  };

  Events.setDisabled = function(flag) {
    isDisabled = !!flag;
  };

  Events.isDisabled = function() {
    return !!isDisabled;
  };

  Events.destroy = function() {
    listeners = null;
  };
}());

//*****************************************************************************

function addListener(target, type, fn) {
  target.addEventListener(type, fn, false);
}

function removeListener(target, type, fn) {
  target.removeEventListener(type, fn, false);
}

function cancelEvent(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  e.returnValue = false;
}
