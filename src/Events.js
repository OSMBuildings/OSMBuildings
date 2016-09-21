
// gesture polyfill adapted from https://raw.githubusercontent.com/seznam/JAK/master/lib/polyfills/gesturechange.js
// MIT License

/**
 * @private
 */
function add2(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

/**
 * @private
 */
function mul2scalar(a, f) {
  return [a[0]*f, a[1]*f];
}

/**
 * @private
 */
function getEventPosition(e, offset) {
  return {
    x: e.clientX - offset.x,
    y: e.clientY - offset.y
  };
}

/**
 * @private
 */
function getElementOffset(el) {
  if (el.getBoundingClientRect) {
    var box = el.getBoundingClientRect();
    return { x:box.left, y:box.top };
  }

  var res = { x:0, y:0 };
  while(el.nodeType === 1) {
    res.x += el.offsetLeft;
    res.y += el.offsetTop;
    el = el.parentNode;
  }
  return res;
}

/**
 * @private
 */
function cancelEvent(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  //if (e.stopPropagation) {
  //  e.stopPropagation();
  //}
  e.returnValue = false;
}

/**
 * @private
 */
function addListener(target, type, fn) {
  target.addEventListener(type, fn, false);
}

/**
 * @private
 */
var Events = {};

/**
 * @private
 */
Events.disabled = false;

/**
 * @private
 */
Events.init = function(container) {

  if ('ontouchstart' in window) {
    addListener(container, 'touchstart', onTouchStart);
    addListener(document, 'touchmove', onTouchMove);
    addListener(document, 'touchend', onTouchEnd);
    addListener(document, 'gesturechange', onGestureChange);
  } else {
    addListener(container, 'mousedown', onMouseDown);
    addListener(document, 'mousemove', onMouseMove);
    addListener(document, 'mouseup', onMouseUp);
    addListener(container, 'dblclick', onDoubleClick);
    addListener(container, 'mousewheel', onMouseWheel);
    addListener(container, 'DOMMouseScroll', onMouseWheel);
  }

  var resizeDebounce;
  addListener(window, 'resize', function() {
    if (resizeDebounce) {
      return;
    }
    resizeDebounce = setTimeout(function() {
      resizeDebounce = null;
        APP.setSize({ width:container.offsetWidth, height:container.offsetHeight });
    }, 250);
  });

  //***************************************************************************

  var
    prevX = 0,
    prevY = 0,
    startX = 0,
    startY = 0,
    startZoom = 0,
    startOffset,
    prevRotation = 0,
    prevTilt = 0,
    pointerIsDown = false;

  function onDoubleClick(e) {
    cancelEvent(e);
    if (!Events.disabled) {
      APP.setZoom(APP.zoom + 1, e);
    }
    var pos = getEventPosition(e, getElementOffset(e.target));
      APP.emit('doubleclick', { x:pos.x, y:pos.y, button:e.button });
  }

  function onMouseDown(e) {
    cancelEvent(e);

    if (e.button > 1) {
      return;
    }

    startZoom = APP.zoom;
    prevRotation = APP.rotation;
    prevTilt = APP.tilt;

    startOffset = getElementOffset(e.target);
    var pos = getEventPosition(e, startOffset);
    startX = prevX = pos.x;
    startY = prevY = pos.y;

    pointerIsDown = true;

    APP.emit('pointerdown', { x: pos.x, y: pos.y, button: e.button });
  }

  function onMouseMove(e) {
    var pos;
    if (!pointerIsDown) {
      pos = getEventPosition(e, getElementOffset(e.target));
    } else {
      if (e.button === 0 && !e.altKey) {
        moveMap(e, startOffset);
      } else {
        rotateMap(e, startOffset);
      }

      pos = getEventPosition(e, startOffset);
      prevX = pos.x;
      prevY = pos.y;
    }

    APP.emit('pointermove', { x: pos.x, y: pos.y });
  }

  function onMouseUp(e) {
    // prevents clicks on other page elements
    if (!pointerIsDown) {
      return;
    }

    var pos = getEventPosition(e, startOffset);

    if (e.button === 0 && !e.altKey) {
      if (Math.abs(pos.x - startX)>5 || Math.abs(pos.y - startY)>5) {
        moveMap(e, startOffset);
      }
    } else {
      rotateMap(e, startOffset);
    }

    pointerIsDown = false;

    APP.emit('pointerup', { x: pos.x, y: pos.y, button: e.button });
  }

  function onMouseWheel(e) {
    cancelEvent(e);

    var delta = 0;
    if (e.wheelDeltaY) {
      delta = e.wheelDeltaY;
    } else if (e.wheelDelta) {
      delta = e.wheelDelta;
    } else if (e.detail) {
      delta = -e.detail;
    }

    if (!Events.disabled) {
      var adjust = 0.2*(delta>0 ? 1 : delta<0 ? -1 : 0);
      APP.setZoom(APP.zoom + adjust, e);
    }

    // we don't emit mousewheel here as we don't want to run into a loop of death
  }

  //***************************************************************************

  function moveMap(e, offset) {
    if (Events.disabled) {
      return;
    }

    // FIXME: make movement exact, i.e. make the position that
    // appeared at (prevX, prevY) before appear at (e.offsetX, e.offsetY) now.
    // the constant 0.86 was chosen experimentally for the map movement to be
    // "pinned" to the cursor movement when the map is shown top-down
    var
      scale = 0.86 * Math.pow(2, -APP.zoom),
      lonScale = 1/Math.cos( APP.position.latitude/ 180 * Math.PI),
      pos = getEventPosition(e, offset),
      dx = pos.x - prevX,
      dy = pos.y - prevY,
      angle = APP.rotation * Math.PI/180,
      vRight   = [ Math.cos(angle),             Math.sin(angle)],
      vForward = [ Math.cos(angle - Math.PI/2), Math.sin(angle - Math.PI/2)],
      dir = add2(mul2scalar(vRight, dx), mul2scalar(vForward, -dy));

    var newPosition = {
      longitude: APP.position.longitude - dir[0] * scale*lonScale,
      latitude:  APP.position.latitude  + dir[1] * scale };

    APP.setPosition(newPosition);
    APP.emit('move', newPosition);
  }

  function rotateMap(e, offset) {
    if (Events.disabled) {
      return;
    }
    var pos = getEventPosition(e, offset);
    prevRotation += (pos.x - prevX)*(360/innerWidth);
    prevTilt -= (pos.y - prevY)*(360/innerHeight);
    APP.setRotation(prevRotation);
    APP.setTilt(prevTilt);
  }

  //***************************************************************************

  var
    dist1 = 0,
    angle1 = 0,
    gestureStarted = false;

  function emitGestureChange(e) {
    var
      t1 = e.touches[0],
      t2 = e.touches[1],
      dx = t1.clientX - t2.clientX,
      dy = t1.clientY - t2.clientY,
      dist2 = dx*dx + dy*dy,
      angle2 = Math.atan2(dy, dx);

    onGestureChange({ rotation: ((angle2 - angle1)*(180/Math.PI))%360, scale: Math.sqrt(dist2/dist1) });
  }

  function onTouchStart(e) {
    cancelEvent(e);

    // gesturechange polyfill
    if (e.touches.length === 2 && !('ongesturechange' in window)) {
      var t1 = e.touches[0];
      var t2 = e.touches[1];
      var dx = t1.clientX - t2.clientX;
      var dy = t1.clientY - t2.clientY;
      dist1 = dx*dx + dy*dy;
      angle1 = Math.atan2(dy,dx);
      gestureStarted = true;
    }

    startZoom = APP.zoom;
    prevRotation = APP.rotation;
    prevTilt = APP.tilt;

    if (e.touches.length) {
      e = e.touches[0];
    }

    startOffset = getElementOffset(e.target);
    var pos = getEventPosition(e, startOffset);
    startX = prevX = pos.x;
    startY = prevY = pos.y;

    APP.emit('pointerdown', { x: pos.x, y: pos.y, button: 0 });
  }

  function onTouchMove(e) {
    var pos = getEventPosition(e.touches[0], startOffset);
    if (e.touches.length > 1) {
      APP.setTilt(prevTilt + (prevY - pos.y) * (360/innerHeight));
      prevTilt = APP.tilt;
      // gesturechange polyfill
      if (!('ongesturechange' in window)) {
        emitGestureChange(e);
      }
    } else {
      moveMap(e.touches[0], startOffset);
      APP.emit('pointermove', { x: pos.x, y: pos.y });
    }
    prevX = pos.x;
    prevY = pos.y;
  }

  function onTouchEnd(e) {
    // gesturechange polyfill
    gestureStarted = false;

    if (e.touches.length === 0) {
      APP.emit('pointerup', { x: prevX, y: prevY, button: 0 });
    } else if (e.touches.length === 1) {
      // There is one touch currently on the surface => gesture ended. Prepare for continued single touch move
      var pos = getEventPosition(e.touches[0], startOffset);
      prevX = pos.x;
      prevY = pos.y;
    }
  }

  function onGestureChange(e) {
    cancelEvent(e);

    if (!Events.disabled) {
      APP.setZoom(startZoom + (e.scale - 1));
      APP.setRotation(prevRotation - e.rotation);
    }

    APP.emit('gesture', e);
  }
};
