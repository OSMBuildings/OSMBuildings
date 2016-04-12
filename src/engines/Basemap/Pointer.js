
// TODO: detect pointerleave from container
// TODO: continue drag/gesture even when off container

function getEventOffset(e) {
  if (e.offsetX !== undefined) {
    return { x:e.offsetX, y:e.offsetY };
  }
  var offset = getElementOffset(e.target);
  return {
    x: e.clientX - offset.x,
    y: e.clientY - offset.y
  }
}

function getElementOffset(el) {
  var res = { x:0, y:0 };

  while(el.nodeType === 1) {
    res.x += el.offsetLeft;
    res.y += el.offsetTop;
    el = el.parentNode;
  }
  return res;
}

function cancelEvent(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  //if (e.stopPropagation) {
  //  e.stopPropagation();
  //}
  e.returnValue = false;
}

var Pointer = function(map, container) {
  this.map = map;

  if ('ontouchstart' in global) {
    this._addListener(container, 'touchstart', this.onTouchStart);
    this._addListener(container, 'touchmove', this.onTouchMove);
    this._addListener(container, 'touchend', this.onTouchEnd);
    this._addListener(container, 'gesturechange', this.onGestureChange);
  } else {
    this._addListener(container, 'mousedown', this.onMouseDown);
    this._addListener(container, 'mousemove', this.onMouseMove);
    this._addListener(container, 'mouseup', this.onMouseUp);
    this._addListener(container, 'contextmenu', this.onContextMenu);
    this._addListener(container, 'dblclick', this.onDoubleClick);
    this._addListener(container, 'mousewheel', this.onMouseWheel);
    this._addListener(container, 'DOMMouseScroll', this.onMouseWheel);
  }

  var resizeDebounce;
  this._addListener(global, 'resize', function() {
    if (resizeDebounce) {
      return;
    }
    resizeDebounce = setTimeout(function() {
      resizeDebounce = null;
      map.setSize({ width:container.offsetWidth, height:container.offsetHeight });
    }, 250);
  });
};

Pointer.prototype = {

  prevX: 0,
  prevY: 0,
  startX: 0,
  startY: 0,
  startZoom: 0,
  prevRotation: 0,
  prevTilt: 0,
  disabled: false,
  pointerIsDown: false,

  _listeners: [],

  _addListener: function(target, type, fn) {
    var boundFn = fn.bind(this);
    target.addEventListener(type, boundFn, false);
    this._listeners.push({ target:target, type:type, fn:boundFn });
  },

  onDoubleClick: function(e) {
    cancelEvent(e);
    if (!this.disabled) {
      this.map.setZoom(this.map.zoom + 1, e);
    }
    var pos = getEventOffset(e);
    this.map.emit('doubleclick', { x:pos.x, y:pos.y, button:e.button });
  },

  onMouseDown: function(e) {
    if (e.button > 1) {
      return;
    }

    cancelEvent(e);

    this.startZoom = this.map.zoom;
    this.prevRotation = this.map.rotation;
    this.prevTilt = this.map.tilt;

    var pos = getEventOffset(e);
    this.startX = this.prevX = pos.x;
    this.startY = this.prevY = pos.y;

    this.pointerIsDown = true;

    this.map.emit('pointerdown', { x: pos.x, y: pos.y, button: e.button });
    this.map.emit('dragstart', { x: pos.x, y: pos.y })
  },

  onMouseMove: function(e) {
    var pos = getEventOffset(e);

    if (this.pointerIsDown) {
      if (e.button === 0 && !e.altKey) {
        this.moveMap(e);
        this.map.emit('drag', { x: pos.x, y: pos.y })
      } else {
        this.rotateMap(e);
      }

      this.prevX = pos.x;
      this.prevY = pos.y;
    }

    this.map.emit('pointermove', { x: pos.x, y: pos.y });
  },

  onMouseUp: function(e) {
    // prevents clicks on other page elements
    if (!this.pointerIsDown) {
      return;
    }

    var pos = getEventOffset(e);

    if (e.button === 0 && !e.altKey) {
      if (Math.abs(pos.x - this.startX)>5 || Math.abs(pos.y - this.startY)>5) {
        this.moveMap(e);
      }
      this.map.emit('dragend', { x: pos.x, y: pos.y })
    } else {
      this.rotateMap(e);
    }

    this.pointerIsDown = false;

    this.map.emit('pointerup', { x: pos.x, y: pos.y, button: e.button });
  },

  onContextMenu: function(e) {
    e.preventDefault();
    var pos = getEventOffset(e);
    this.map.emit('contextmenu', { x: pos.x, y: pos.y })
    return false;
  },

  onMouseWheel: function(e) {
    cancelEvent(e);
    var delta = 0;
    if (e.wheelDeltaY) {
      delta = e.wheelDeltaY;
    } else if (e.wheelDelta) {
      delta = e.wheelDelta;
    } else if (e.detail) {
      delta = -e.detail;
    }

    if (!this.disabled) {
      var adjust = 0.2*(delta>0 ? 1 : delta<0 ? -1 : 0);
      this.map.setZoom(this.map.zoom + adjust, e);
    }

    this.map.emit('mousewheel', { delta: delta });
  },

  moveMap: function(e) {
    if (this.disabled) {
      return;
    }

    // FIXME: make movement exact, i.e. make the position that
    //        appeared at (this.prevX, this.prevY) before appear at
    //        (e.offsetX, e.offsetY) now.
    // the constant 0.86 was chosen experimentally for the map movement to be
    // "pinned" to the cursor movement when the map is shown top-down
    var scale = 0.86 * Math.pow(2, -this.map.zoom);
    var lonScale = 1/Math.cos( this.map.position.latitude/ 180 * Math.PI);
    var pos = getEventOffset(e);
    var dx = pos.x - this.prevX;
    var dy = pos.y - this.prevY;
    var angle = this.map.rotation * Math.PI/180;

    var vRight = [ Math.cos(angle),             Math.sin(angle)];
    var vForward=[ Math.cos(angle - Math.PI/2), Math.sin(angle - Math.PI/2)]

    var dir = add2(  mul2scalar(vRight,    dx),
                     mul2scalar(vForward, -dy));

    var new_position = {
      longitude: this.map.position.longitude - dir[0] * scale*lonScale,
      latitude:  this.map.position.latitude  + dir[1] * scale };

    this.map.setPosition(new_position);
    this.map.emit('move', new_position)
  },

  rotateMap: function(e) {
    if (this.disabled) {
      return;
    }
    var pos = getEventOffset(e);
    this.prevRotation += (pos.x - this.prevX)*(360/innerWidth);
    this.prevTilt -= (pos.y - this.prevY)*(360/innerHeight);
    this.map.setRotation(this.prevRotation);
    this.map.setTilt(this.prevTilt);
  },

  //***************************************************************************

  onTouchStart: function(e) {
    cancelEvent(e);

    this.startZoom = this.map.zoom;
    this.prevRotation = this.map.rotation;
    this.prevTilt = this.map.tilt;

    if (e.touches.length) {
      e = e.touches[0];
    }

    var pos = getEventOffset(e);
    this.startX = this.prevX = pos.x;
    this.startY = this.prevY = pos.y;

    this.map.emit('pointerdown', { x: pos.x, y: pos.y, button: 0 });
  },

  onTouchMove: function(e) {
    if (e.touches.length) {
      e = e.touches[0];
    }

    this.moveMap(e);

    var pos = getEventOffset(e);
    this.prevX = pos.x;
    this.prevY = pos.y;

    this.map.emit('pointermove', { x: pos.x, y: pos.y });
  },

  onTouchEnd: function(e) {
    if (e.touches.length) {
      e = e.touches[0];
    }

    var pos = getEventOffset(e);
    if (Math.abs(pos.x - this.startX)>5 || Math.abs(pos.y - this.startY)>5) {
      this.moveMap(e);
    }

    this.map.emit('pointerup', { x: pos.x, y: pos.y, button: 0 });
  },

  onGestureChange: function(e) {
    cancelEvent(e);
    if (!this.disabled) {
      this.map.setZoom(this.startZoom + (e.scale - 1));
      this.map.setRotation(this.prevRotation - e.rotation);
  //  this.map.setTilt(prevTilt ...);
    }
    this.map.emit('gesture', e.touches);
  },

  destroy: function() {
    this.disabled = true;
    var listener;
    for (var i = 0; i < this._listeners.length; i++) {
      listener = this._listeners[i];
      listener.target.removeEventListener(listener.type, listener.fn, false);
    }
    this._listeners = [];
  }
};
