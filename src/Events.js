
var Events = {};

(function() {

  var
    listeners = {},

    prevX = 0, prevY = 0,
    startX = 0, startY  = 0,
    startZoom = 0,
    prevRotation = 0,
    prevTilt = 0,

    isDisabled = false,
    pointerIsDown = false,
    resizeTimer;

  //***************************************************************************
  //***************************************************************************

  function onDoubleClick(e) {
    if (isDisabled) {
      return;
    }
    cancelEvent(e);
    Map.setZoom(Map.zoom + 1, e);
  }

  function onMouseDown(e) {
    if (isDisabled || e.button > 1) {
      return;
    }

    cancelEvent(e);

    startZoom = Map.zoom;
    prevRotation = Map.rotation;
    prevTilt = Map.tilt;

    startX = prevX = e.clientX;
    startY = prevY = e.clientY;

    pointerIsDown = true;

    Interaction.getTargetID(e.clientX, e.clientY, function(targetID) {
      var payload = { target: { id:targetID }, x:e.clientX, y: e.clientY };
      Events.emit('pointerdown', payload);
    });
  }

  function onMouseMove(e) {
    if (isDisabled) {
      return;
    }

    if (pointerIsDown) {
      if (e.button === 0 && !e.altKey) {
        moveMap(e);
      } else {
        rotateMap(e);
      }

      prevX = e.clientX;
      prevY = e.clientY;
    }

    Interaction.getTargetID(e.clientX, e.clientY, function(targetID) {
      var payload = { target: { id:targetID }, x:e.clientX, y: e.clientY };
      Events.emit('pointermove', payload);
    });
  }

  function onMouseUp(e) {
    if (isDisabled) {
      return;
    }

    // prevents clicks on other page elements
    if (!pointerIsDown) {
      return;
    }

    if (e.button === 0 && !e.altKey) {
      if (Math.abs(e.clientX-startX) > 5 || Math.abs(e.clientY-startY) > 5) {
        moveMap(e);
      }
    } else {
      rotateMap(e);
    }

    pointerIsDown = false;

    Interaction.getTargetID(e.clientX, e.clientY, function(targetID) {
      var payload = { target: { id:targetID }, x:e.clientX, y: e.clientY };
      Events.emit('pointerup', payload);
    });
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
  //***************************************************************************

  function onTouchStart(e) {
    if (isDisabled) {
      return;
    }

    cancelEvent(e);

    startZoom = Map.zoom;
    prevRotation = Map.rotation;
    prevTilt = Map.tilt;

    if (e.touches.length > 1) {
      e = e.touches[0];
    }

    startX = prevX = e.clientX;
    startY = prevY = e.clientY;

    var payload = { x:e.clientX, y: e.clientY };
    Events.emit('pointerdown', payload);
  }

  function onTouchMove(e) {
    if (isDisabled) {
      return;
    }

    if (e.touches.length > 1) {
      e = e.touches[0];
    }

    moveMap(e);

    prevX = e.clientX;
    prevY = e.clientY;

    var payload = { x:e.clientX, y: e.clientY };
    Events.emit('pointermove', payload);
  }

  function onTouchEnd(e) {
    if (isDisabled) {
      return;
    }

    if (e.touches.length > 1) {
      e = e.touches[0];
    }

    if (Math.abs(e.clientX-startX) > 5 || Math.abs(e.clientY-startY) > 5) {
      moveMap(e);
    }

    var payload = { x:e.clientX, y: e.clientY };
    Events.emit('pointerup', payload);
  }

  function onGestureChange(e) {
    if (isDisabled) {
      return;
    }
    cancelEvent(e);
    Map.setZoom(startZoom + (e.scale - 1));
    Map.setRotation(prevRotation - e.rotation);
//  Map.setTilt(prevTilt ...);
  }

  //***************************************************************************

  function moveMap(e) {
    var dx = e.clientX - prevX;
    var dy = e.clientY - prevY;
    var r = rotatePoint(dx, dy, Map.rotation*Math.PI/180);
    Map.setCenter({ x:Map.center.x-r.x, y:Map.center.y-r.y });
  }

  function rotateMap(e) {
    prevRotation += (e.clientX - prevX)*(360/innerWidth);
    prevTilt -= (e.clientY - prevY)*(360/innerHeight);
    Map.setRotation(prevRotation);
    Map.setTilt(prevTilt);
  }

  //***************************************************************************

  Events.init = function(container) {
    if ('ontouchstart' in global) {
      addListener(container, 'touchstart', onTouchStart);
      addListener(document, 'touchmove', onTouchMove);
      addListener(document, 'touchend', onTouchEnd);
      addListener(container, 'gesturechange', onGestureChange);
    } else {
      addListener(container, 'mousedown', onMouseDown);
      addListener(document, 'mousemove', onMouseMove);
      addListener(document, 'mouseup', onMouseUp);
      addListener(container, 'dblclick', onDoubleClick);
      addListener(container, 'mousewheel', onMouseWheel);
      addListener(container, 'DOMMouseScroll', onMouseWheel);
    }

    addListener(global, 'resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // some duplication with index.js
        if (container.offsetWidth !== WIDTH || container.offsetHeight !== HEIGHT) {
          GL.canvas.width  = WIDTH  = container.offsetWidth;
          GL.canvas.height = HEIGHT = container.offsetHeight;
          Events.emit('resize');
        }
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

  Events.emit = function(type, payload) {
    if (!listeners[type]) {
      return;
    }
    for (var i = 0, il = listeners[type].length; i<il; i++) {
      listeners[type][i](payload);
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
