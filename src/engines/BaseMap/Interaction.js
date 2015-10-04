
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

var Interaction = function(map, container) {
  this.map = map;

  if ('ontouchstart' in global) {
    addListener(container, 'touchstart', this.onTouchStart.bind(this));
    addListener(document, 'touchmove', this.onTouchMove.bind(this));
    addListener(document, 'touchend', this.onTouchEnd.bind(this));
    addListener(container, 'gesturechange', this.onGestureChange.bind(this));
  } else {
    addListener(container, 'mousedown', this.onMouseDown.bind(this));
    addListener(document, 'mousemove', this.onMouseMove.bind(this));
    addListener(document, 'mouseup', this.onMouseUp.bind(this));
    addListener(container, 'dblclick', this.onDoubleClick.bind(this));
    addListener(container, 'mousewheel', this.onMouseWheel.bind(this));
    addListener(container, 'DOMMouseScroll', this.onMouseWheel.bind(this));
  }

  var resizeDebounce;
  addListener(global, 'resize', function() {
    if (resizeDebounce) {
      return;
    }
    resizeDebounce = setTimeout(function() {
      resizeDebounce = null;
      map.setSize({ width:container.offsetWidth, height:container.offsetHeight });
    }, 250);
  });
};

Interaction.prototype = {

  prevX: 0,
  prevY: 0,
  startX: 0,
  startY: 0,
  startZoom: 0,
  prevRotation: 0,
  prevTilt: 0,
  disabled: false,
  pointerIsDown: false,

  onDoubleClick: function(e) {
    if (this.disabled) {
      return;
    }
    cancelEvent(e);
    this.map.setZoom(this.map.zoom + 1, e);
  },

  onMouseDown: function(e) {
    if (this.disabled || e.button>1) {
      return;
    }

    cancelEvent(e);

    this.startZoom = this.map.zoom;
    this.prevRotation = this.map.rotation;
    this.prevTilt = this.map.tilt;

    this.startX = this.prevX = e.clientX;
    this.startY = this.prevY = e.clientY;

    this.pointerIsDown = true;

    this.map.emit('pointerdown', { x: e.clientX, y: e.clientY });
  },

  onMouseMove: function(e) {
    if (this.disabled) {
      return;
    }

    if (this.pointerIsDown) {
      if (e.button === 0 && !e.altKey) {
        this.moveMap(e);
      } else {
        this.rotateMap(e);
      }

      this.prevX = e.clientX;
      this.prevY = e.clientY;
    }

    this.map.emit('pointermove', { x: e.clientX, y: e.clientY });
  },

  onMouseUp: function(e) {
    if (this.disabled) {
      return;
    }

    // prevents clicks on other page elements
    if (!this.pointerIsDown) {
      return;
    }

    if (e.button === 0 && !e.altKey) {
      if (Math.abs(e.clientX - this.startX)>5 || Math.abs(e.clientY - this.startY)>5) {
        this.moveMap(e);
      }
    } else {
      this.rotateMap(e);
    }

    this.pointerIsDown = false;

    this.map.emit('pointerup', { x: e.clientX, y: e.clientY });
  },

  onMouseWheel: function(e) {
    if (this.disabled) {
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
    this.map.setZoom(this.map.zoom + adjust, e);
  },

  moveMap: function(e) {
    var dx = e.clientX - this.prevX;
    var dy = e.clientY - this.prevY;
    var angle = this.map.rotation * Math.PI/180;
    // rotate point
    var r = {
      x: Math.cos(angle)*dx - Math.sin(angle)*dy,
      y: Math.sin(angle)*dx + Math.cos(angle)*dy
    };
    this.map.setCenter({ x: this.map.center.x - r.x, y: this.map.center.y - r.y });
  },

  rotateMap: function(e) {
    this.prevRotation += (e.clientX - this.prevX)*(360/innerWidth);
    this.prevTilt -= (e.clientY - this.prevY)*(360/innerHeight);
    this.map.setRotation(this.prevRotation);
    this.map.setTilt(this.prevTilt);
  },

  //***************************************************************************

  onTouchStart: function(e) {
    if (this.disabled) {
      return;
    }

    cancelEvent(e);

    this.startZoom = this.map.zoom;
    this.prevRotation = this.map.rotation;
    this.prevTilt = this.map.tilt;

    if (e.touches.length>1) {
      e = e.touches[0];
    }

    this.startX = this.prevX = e.clientX;
    this.startY = this.prevY = e.clientY;

    this.map.emit('pointerdown', { x: e.clientX, y: e.clientY });
  },

  onTouchMove: function(e) {
    if (this.disabled) {
      return;
    }

    if (e.touches.length>1) {
      e = e.touches[0];
    }

    this.moveMap(e);

    this.prevX = e.clientX;
    this.prevY = e.clientY;

    this.map.emit('pointermove', { x: e.clientX, y: e.clientY });
  },

  onTouchEnd: function(e) {
    if (this.disabled) {
      return;
    }

    if (e.touches.length>1) {
      e = e.touches[0];
    }

    if (Math.abs(e.clientX - this.startX)>5 || Math.abs(e.clientY - this.startY)>5) {
      this.moveMap(e);
    }

    this.map.emit('pointerup', { x: e.clientX, y: e.clientY });
  },

  onGestureChange: function(e) {
    if (this.disabled) {
      return;
    }
    cancelEvent(e);
    this.map.setZoom(this.startZoom + (e.scale - 1));
    this.map.setRotation(this.prevRotation - e.rotation);
//  this.map.setTilt(prevTilt ...);
  },

  destroy: function() {
    this.disabled = true;
  }
};
