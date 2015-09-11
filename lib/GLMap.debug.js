var GLMap = (function(window) {


var GLMap = function(container, options) {
  this.container = container;

  this.minZoom = parseFloat(options.minZoom) || 10;
  this.maxZoom = parseFloat(options.maxZoom) || 20;

  if (this.maxZoom < this.minZoom) {
    this.maxZoom = this.minZoom;
  }

  this.center = { x:0, y:0 };
  this.zoom = 0;
  this.transform = new glx.Matrix(); // there are early actions that rely on an existing Map transform

  this.listeners = {};

  this.restoreState(options);

  if (options.state) {
    this.persistState();
    this.on('change', function() {
      this.persistState();
    }.bind(this));
  }

  this.interaction = new Interaction(this, container);
  if (options.disabled) {
    this.setDisabled(true);
  }
};

GLMap.TILE_SIZE = 256;

GLMap.prototype = {

  restoreState: function(options) {
    var
      query = location.search,
      state = {};
    if (query) {
      query.substring(1).replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
        if ($1) {
          state[$1] = $2;
        }
      });
    }

    var position;
    if (state.lat !== undefined && state.lon !== undefined) {
      position = { latitude:parseFloat(state.lat), longitude:parseFloat(state.lon) };
    }
    this.setPosition(position || options.position || { latitude: 52.52000, longitude: 13.41000 });

    var zoom;
    if (state.zoom !== undefined) {
      zoom = (state.zoom !== undefined) ? parseFloat(state.zoom) : null;
    }
    this.setZoom(zoom || options.zoom || this.minZoom);

    var rotation;
    if (state.rotation !== undefined) {
      rotation = parseFloat(state.rotation);
    }
    this.setRotation(rotation || options.rotation || 0);

    var tilt;
    if (state.tilt !== undefined) {
      tilt = parseFloat(state.tilt);
    }
    this.setTilt(tilt || options.tilt || 0);
  },

  persistState: function() {
    if (!history.replaceState) {
      return;
    }

    var stateDebounce;
    clearTimeout(stateDebounce);
    stateDebounce = setTimeout(function() {
      var params = [];
      params.push('lat=' + this.position.latitude.toFixed(5));
      params.push('lon=' + this.position.longitude.toFixed(5));
      params.push('zoom=' + this.zoom.toFixed(1));
      params.push('tilt=' + this.tilt.toFixed(1));
      params.push('rotation=' + this.rotation.toFixed(1));
      history.replaceState({}, '', '?'+ params.join('&'));
    }.bind(this), 2000);
  },

  setCenter: function(center) {
    if (this.center.x !== center.x || this.center.y !== center.y) {
      this.center = center;
      this.position = unproject(center.x, center.y, GLMap.TILE_SIZE*Math.pow(2, this.zoom));
      this.emit('change');
    }
  },

  emitDebounce: null,
  emit: function(type, payload) {
    if (!this.listeners[type]) {
      return;
    }
    clearTimeout(this.emitDebounce);
    var listeners = this.listeners[type];
    this.emitDebounce = setTimeout(function() {
      for (var i = 0, il = listeners.length; i < il; i++) {
        listeners[i](payload);
      }
    }, 1);
  },

  //***************************************************************************

  on: function(type, fn) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(fn);
  },

  off: function(type, fn) {},

  setDisabled: function(flag) {
    this.interaction.setDisabled(flag);
  },

  isDisabled: function() {
    return this.interaction.isDisabled();
  },

  project: function(latitude, longitude, worldSize) {
    var
      x = longitude/360 + 0.5,
      y = Math.min(1, Math.max(0, 0.5 - (Math.log(Math.tan((Math.PI/4) + (Math.PI/2)*latitude/180)) / Math.PI) / 2));
    return { x: x*worldSize, y: y*worldSize };
  },

  unproject: function(x, y, worldSize) {
    x /= worldSize;
    y /= worldSize;
    return {
      latitude: (2 * Math.atan(Math.exp(Math.PI * (1 - 2*y))) - Math.PI/2) * (180/Math.PI),
      longitude: x*360 - 180
    };
  },

  getBounds: function() {
    var
      center = this.center,
      halfWidth  = this.container.offsetWidth/2,
      halfHeight = this.container.offsetHeight/2,
      maxY = center.y + halfHeight,
      minX = center.x - halfWidth,
      minY = center.y - halfHeight,
      maxX = center.x + halfWidth,
      worldSize = GLMap.TILE_SIZE*Math.pow(2, this.zoom),
      nw = unproject(minX, minY, worldSize),
      se = unproject(maxX, maxY, worldSize);

    return {
      n: nw.latitude,
      w: nw.longitude,
      s: se.latitude,
      e: se.longitude
    };
  },

  setZoom: function(zoom, e) {
    zoom = clamp(parseFloat(zoom), this.minZoom, this.maxZoom);

    if (this.zoom !== zoom) {
      var ratio = Math.pow(2, zoom-this.zoom);
      this.zoom = zoom;
      if (!e) {
        this.center.x *= ratio;
        this.center.y *= ratio;
      } else {
        var dx = this.container.offsetWidth/2  - e.clientX;
        var dy = this.container.offsetHeight/2 - e.clientY;
        this.center.x -= dx;
        this.center.y -= dy;
        this.center.x *= ratio;
        this.center.y *= ratio;
        this.center.x += dx;
        this.center.y += dy;
      }
      this.emit('change');
    }
  },

  setPosition: function(pos) {
    var
      latitude  = clamp(parseFloat(pos.latitude), -90, 90),
      longitude = clamp(parseFloat(pos.longitude), -180, 180),
      center = project(latitude, longitude, GLMap.TILE_SIZE*Math.pow(2, this.zoom));
    this.setCenter(center);
  },

  setRotation: function(rotation) {
    rotation = parseFloat(rotation)%360;
    if (this.rotation !== rotation) {
      this.rotation = rotation;
      this.emit('change');
    }
  },

  setTilt: function(tilt) {
    tilt = clamp(parseFloat(tilt), 0, 60);
    if (this.tilt !== tilt) {
      this.tilt = tilt;
      this.emit('change');
    }
  },

  addLayer: function(layer) {
//  Layers.add(layer);
//  this.attribution.innerHTML = Layers.getAttributions([this.attributionPrefix]).join(' &middot; ');
    return this;
  },

  removeLayer: function(layer) {
//    for (var i = 0; i < this._layers.length; i++) {
//      if (this._layers[i] === layer) {
//        this._layers[i].splice(i, 1);
//        return;
//      }
//    }
//  this.attribution.innerHTML = Layers.getAttributions([this.attributionPrefix]).join(' &middot; ');
  },

  destroy: function() {
    this.listeners = null;
    this.interaction.destroy();
  }
};


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
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(function() {
      map.emit('resize');
    }, 250);
  });
};

Interaction.prototype = {
  setDisabled: function(flag) {
    this.disabled = !!flag;
  },

  isDisabled: function() {
    return !!this.disabled;
  },

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

  //***************************************************************************
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

  //***************************************************************************

  moveMap: function(e) {
    var dx = e.clientX - this.prevX;
    var dy = e.clientY - this.prevY;
    var r = rotatePoint(dx, dy, this.map.rotation*Math.PI/180);
    this.map.setCenter({ x: this.map.center.x - r.x, y: this.map.center.y - r.y });
  },

  rotateMap: function(e) {
    this.prevRotation += (e.clientX - this.prevX)*(360/innerWidth);
    this.prevTilt -= (e.clientY - this.prevY)*(360/innerHeight);
    this.map.setRotation(this.prevRotation);
    this.map.setTilt(this.prevTilt);
  },

  destroy: function() {}
};

//
//function rad(deg) {
//  return deg * PI / 180;
//}
//
//function deg(rad) {
//  return rad / PI * 180;
//}
//
//function distance2(a, b) {
//  var
//    dx = a[0]-b[0],
//    dy = a[1]-b[1];
//  return dx*dx + dy*dy;
//}
//
//function normalize(value, min, max) {
//  var range = max-min;
//  return clamp((value-min)/range, 0, 1);
//}
//
//function unit(x, y, z) {
//  var m = Math.sqrt(x*x + y*y + z*z);
//
//  if (m === 0) {
//    m = 0.00001;
//  }
//
//  return [x/m, y/m, z/m];
//}
//
//function pattern(str, param) {
//  return str.replace(/\{(\w+)\}/g, function(tag, key) {
//    return param[key] || tag;
//  });
//}

function clamp(value, min, max) {
  return Math.min(max, Math.max(value, min));
}

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

return GLMap; }(this));