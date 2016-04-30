
// TODO: detect pointerleave from map.container
// TODO: continue drag/gesture even when off map.container
// TODO: allow two finger swipe for tilt

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
function getEventOffset(e) {
  if (e.offsetX !== undefined) {
    return { x:e.offsetX, y:e.offsetY };
  }
  var offset = getElementOffset(e.target);
  return {
    x: e.clientX - offset.x,
    y: e.clientY - offset.y
  };
}

/**
 * @private
 */
function getElementOffset(el) {
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
Events.init = function(map) {

  if ('ontouchstart' in window) {
    addListener(map.container, 'touchstart', onTouchStart);
    addListener(document, 'touchmove', onTouchMove);
    addListener(document, 'touchend', onTouchEnd);
    addListener(document, 'gesturechange', onGestureChange);
  } else {
    addListener(map.container, 'mousedown', onMouseDown);
    addListener(document, 'mousemove', onMouseMove);
    addListener(document, 'mouseup', onMouseUp);
    addListener(map.container, 'dblclick', onDoubleClick);
    addListener(map.container, 'mousewheel', onMouseWheel);
    addListener(map.container, 'DOMMouseScroll', onMouseWheel);
  }

  addListener(window, 'devicemotion', onDeviceMotion);

  var resizeDebounce;
  addListener(window, 'resize', function() {
    if (resizeDebounce) {
      return;
    }
    resizeDebounce = setTimeout(function() {
      resizeDebounce = null;
        map.setSize({ width:map.container.offsetWidth, height:map.container.offsetHeight });
    }, 250);
  });

  //***************************************************************************

  var
    prevX = 0,
    prevY = 0,
    startX = 0,
    startY = 0,
    startZoom = 0,
    prevRotation = 0,
    prevTilt = 0,
    pointerIsDown = false;

  function onDoubleClick(e) {
    cancelEvent(e);
    if (!Events.disabled) {
      map.setZoom(map.zoom + 1, e);
    }
    var pos = getEventOffset(e);
      map.emit('doubleclick', { x:pos.x, y:pos.y, button:e.button });
  }

  function onMouseDown(e) {
    cancelEvent(e);

    if (e.button > 1) {
      return;
    }

    startZoom = map.zoom;
    prevRotation = map.rotation;
    prevTilt = map.tilt;

    var pos = getEventOffset(e);
    startX = prevX = pos.x;
    startY = prevY = pos.y;

    pointerIsDown = true;

    map.emit('pointerdown', { x: pos.x, y: pos.y, button: e.button });
  }

  function onMouseMove(e) {
    var pos = getEventOffset(e);

    if (pointerIsDown) {
      if (e.button === 0 && !e.altKey) {
        moveMap(e);
      } else {
        rotateMap(e);
      }

      prevX = pos.x;
      prevY = pos.y;
    }

    map.emit('pointermove', { x: pos.x, y: pos.y });
  }

  function onMouseUp(e) {
    // prevents clicks on other page elements
    if (!pointerIsDown) {
      return;
    }

    var pos = getEventOffset(e);

    if (e.button === 0 && !e.altKey) {
      if (Math.abs(pos.x - startX)>5 || Math.abs(pos.y - startY)>5) {
        moveMap(e);
      }
    } else {
      rotateMap(e);
    }

    pointerIsDown = false;

    map.emit('pointerup', { x: pos.x, y: pos.y, button: e.button });
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
      map.setZoom(map.zoom + adjust, e);
    }

    // we don't emit mousewheel here as we don't want to run into a loop of death
  }

  //***************************************************************************

  function moveMap(e) {
    if (Events.disabled) {
      return;
    }

    // FIXME: make movement exact, i.e. make the position that
    // appeared at (prevX, prevY) before appear at (e.offsetX, e.offsetY) now.
    // the constant 0.86 was chosen experimentally for the map movement to be
    // "pinned" to the cursor movement when the map is shown top-down
    var
      scale = 0.86 * Math.pow(2, -map.zoom),
      lonScale = 1/Math.cos( map.position.latitude/ 180 * Math.PI),
      pos = getEventOffset(e),
      dx = pos.x - prevX,
      dy = pos.y - prevY,
      angle = map.rotation * Math.PI/180,
      vRight   = [ Math.cos(angle),             Math.sin(angle)],
      vForward = [ Math.cos(angle - Math.PI/2), Math.sin(angle - Math.PI/2)],
      dir = add2(mul2scalar(vRight, dx), mul2scalar(vForward, -dy));

    var newPosition = {
      longitude: map.position.longitude - dir[0] * scale*lonScale,
      latitude:  map.position.latitude  + dir[1] * scale };

    map.setPosition(newPosition);
    map.emit('move', newPosition);
  }

  function rotateMap(e) {
    if (Events.disabled) {
      return;
    }
    var pos = getEventOffset(e);
    prevRotation += (pos.x - prevX)*(360/innerWidth);
    prevTilt -= (pos.y - prevY)*(360/innerHeight);
    map.setRotation(prevRotation);
    map.setTilt(prevTilt);
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

    startZoom = map.zoom;
    prevRotation = map.rotation;
    prevTilt = map.tilt;

    if (e.touches.length) {
      e = e.touches[0];
    }

    var pos = getEventOffset(e);
    startX = prevX = pos.x;
    startY = prevY = pos.y;

    map.emit('pointerdown', { x: pos.x, y: pos.y, button: 0 });
  }

  function onTouchMove(e) {
    var pos = getEventOffset(e.touches[0]);
    if (e.touches.length > 1) {
      map.setTilt(prevTilt + (prevY - pos.y) * (360/innerHeight));
      prevTilt = map.tilt;
      // gesturechange polyfill
      if (!('ongesturechange' in window)) {
        emitGestureChange(e);
      }
    } else {
      moveMap(e.touches[0]);
      map.emit('pointermove', { x: pos.x, y: pos.y });
    }
    prevX = pos.x;
    prevY = pos.y;
  }

  function onTouchEnd(e) {
    // gesturechange polyfill
    gestureStarted = false;

    if (e.touches.length === 0) {
      map.emit('pointerup', { x: prevX, y: prevY, button: 0 });
    } else if (e.touches.length === 1) {
      // There is one touch currently on the surface => gesture ended. Prepare for continued single touch move
      var pos = getEventOffset(e.touches[0]);
      prevX = pos.x;
      prevY = pos.y;
    }
  }

  function onGestureChange(e) {
    cancelEvent(e);

    if (!Events.disabled) {
      map.setZoom(startZoom + (e.scale - 1));
      map.setRotation(prevRotation - e.rotation);
    }

    map.emit('gesture', e);
  }

  //***************************************************************************

  var a1 = 0, b1 = 0, c1 = 0;
  //var aFilter = 0, bFilter = 0, cFilter = 0;

  function onDeviceMotion(e) {
    if (!e.accelerationIncludingGravity) {
      return;
    }

    var
      acceleration = e.accelerationIncludingGravity,
      a = acceleration.z*0.1 + a1*0.9,
      b = acceleration.x*0.1 + b1*0.9,
      c = acceleration.y*0.1 + c1*0.9;

    var
      aDelta = a-a1,
      bDelta = b-b1,
      cDelta = c-c1;

    if (!aDelta && !bDelta && !cDelta) {
      return;
    }

    //map.emit('motion', {
    //  alpha: aDelta,
    //  beta:  bDelta,
    //  gamma: cDelta
    //});

    map.setTilt(map.tilt + aDelta*5);
    //map.setRotation(map.rotation - cDelta*5);

    a1 = a;
    b1 = b;
    c1 = c;
  }
};
