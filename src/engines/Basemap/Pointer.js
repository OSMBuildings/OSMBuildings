
function cancelEvent(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  e.returnValue = false;
}

var Pointer = function(map, container) {
  this.map = map;

  if ('ontouchstart' in global) {
    this._addListener(container, 'touchstart', this.onTouchStart);
    this._addListener(document, 'touchmove', this.onTouchMove);
    this._addListener(document, 'touchend', this.onTouchEnd);
    this._addListener(container, 'gesturechange', this.onGestureChange);
  } else {
    this._addListener(container, 'mousedown', this.onMouseDown);
    this._addListener(document, 'mousemove', this.onMouseMove);
    this._addListener(document, 'mouseup', this.onMouseUp);
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
    this.map.emit('doubleclick', { x: e.offsetX, y: e.offsetY, button: e.button });
  },

  onMouseDown: function(e) {
    if (e.button > 1) {
      return;
    }

    cancelEvent(e);

    this.startZoom = this.map.zoom;
    this.prevRotation = this.map.rotation;
    this.prevTilt = this.map.tilt;

    this.startX = this.prevX = e.offsetX;
    this.startY = this.prevY = e.offsetY;

    this.pointerIsDown = true;

    this.map.emit('pointerdown', { x: e.offsetX, y: e.offsetY, button: e.button });
  },

  onMouseMove: function(e) {
    if (this.pointerIsDown) {
      if (e.button === 0 && !e.altKey) {
        this.moveMap(e);
      } else {
        this.rotateMap(e);
      }

      this.prevX = e.offsetX;
      this.prevY = e.offsetY;
    }

    this.map.emit('pointermove', { x: e.offsetX, y: e.offsetY });
  },

  onMouseUp: function(e) {
    // prevents clicks on other page elements
    if (!this.pointerIsDown) {
      return;
    }

    if (e.button === 0 && !e.altKey) {
      if (Math.abs(e.offsetX - this.startX)>5 || Math.abs(e.offsetY - this.startY)>5) {
        this.moveMap(e);
      }
    } else {
      this.rotateMap(e);
    }

    this.pointerIsDown = false;

    this.map.emit('pointerup', { x: e.offsetX, y: e.offsetY, button: e.button });
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

    /*FIXME: make movement exact, i.e. make the position that 
     *       appeared at (this.prevX, this.prevY) before appear at 
     *       (e.offsetX, e.offsetY) now.
     */
    // the constant 0.86 was chosen experimentally for the map movement to be 
    // "pinned" to the cursor movement when the map is shown top-down
    var scale = 0.86 * Math.pow( 2, -this.map.zoom);    
    var lngScale = 1/Math.cos( this.map.position.latitude/ 180 * Math.PI);
    var dx = e.offsetX - this.prevX;
    var dy = e.offsetY - this.prevY;
    var angle = this.map.rotation * Math.PI/180;
    
    var vRight = [ Math.cos(angle),             Math.sin(angle)];
    var vForward=[ Math.cos(angle - Math.PI/2), Math.sin(angle - Math.PI/2)]
    
    var dir = add2(  mul2scalar(vRight,    dx), 
                     mul2scalar(vForward, -dy));

    this.map.setPosition({ 
      longitude: this.map.position.longitude - dir[0] * scale*lngScale, 
      latitude:  this.map.position.latitude  + dir[1] * scale });
  },

  rotateMap: function(e) {
    if (this.disabled) {
      return;
    }
    this.prevRotation += (e.offsetX - this.prevX)*(360/innerWidth);
    this.prevTilt -= (e.offsetY - this.prevY)*(360/innerHeight);
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

    this.startX = this.prevX = e.offsetX;
    this.startY = this.prevY = e.offsetY;

    this.map.emit('pointerdown', { x: e.offsetX, y: e.offsetY, button: 0 });
  },

  onTouchMove: function(e) {
    if (e.touches.length) {
      e = e.touches[0];
    }

    this.moveMap(e);

    this.prevX = e.offsetX;
    this.prevY = e.offsetY;

    this.map.emit('pointermove', { x: e.offsetX, y: e.offsetY });
  },

  onTouchEnd: function(e) {
    if (e.touches.length) {
      e = e.touches[0];
    }

    if (Math.abs(e.offsetX - this.startX)>5 || Math.abs(e.offsetY - this.startY)>5) {
      this.moveMap(e);
    }

    this.map.emit('pointerup', { x: e.offsetX, y: e.offsetY, button: 0 });
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
