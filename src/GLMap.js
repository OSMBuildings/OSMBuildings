
var GLMap = function(containerId, options) {

  options = options || {};

  this._listeners = {};
  this._layers = [];
  this._container = document.getElementById(containerId);

  this.minZoom = parseFloat(options.minZoom) || 10;
  this.maxZoom = parseFloat(options.maxZoom) || 20;

  if (this.maxZoom < this.minZoom) {
    this.maxZoom = this.minZoom;
  }

  this._initState(options);
  this._initEvents(this._container);
  this._initRenderer(this._container);

  this.setDisabled(options.disabled);
};

GLMap.prototype = {

  _initState: function(options) {
    this._center = {};
    this._size = { width:0, height:0 };
    options = State.load(options);
    this.setCenter(options.center || { latitude:52.52000, longitude:13.41000 });
    this.setZoom(options.zoom || this.minZoom);
    this.setRotation(options.rotation || 0);
    this.setTilt(options.tilt || 0);

    this.on('change', function() {
      State.save(this);
    }.bind(this));

    State.save(this);
  },

  _initEvents: function(container) {
    this._startX = 0;
    this._startY = 0;
    this._startRotation = 0;
    this._startZoom = 0;

    this._hasTouch = ('ontouchstart' in window);
    this._dragStartEvent = this._hasTouch ? 'touchstart' : 'mousedown';
    this._dragMoveEvent  = this._hasTouch ? 'touchmove'  : 'mousemove';
    this._dragEndEvent   = this._hasTouch ? 'touchend'   : 'mouseup';

    addListener(container, this._dragStartEvent, this._onDragStart.bind(this));
    addListener(container, 'dblclick',   this._onDoubleClick.bind(this));
    addListener(document, this._dragMoveEvent, this._onDragMove.bind(this));
    addListener(document, this._dragEndEvent,  this._onDragEnd.bind(this));

    if (this._hasTouch) {
      addListener(container, 'gesturechange', this._onGestureChange.bind(this));
    } else {
      addListener(container, 'mousewheel',     this._onMouseWheel.bind(this));
      addListener(container, 'DOMMouseScroll', this._onMouseWheel.bind(this));
    }

    addListener(window, 'resize', this._onResize.bind(this));
  },

  _initRenderer: function(container) {
    var canvas = document.createElement('CANVAS');
    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';

    container.appendChild(canvas);

    // TODO: handle context loss
    try {
      gl = canvas.getContext('experimental-webgl', {
        antialias: true,
        depth: true,
        premultipliedAlpha: false
      });
    } catch(ex) {
      throw ex;
    }

    addListener(canvas, 'webglcontextlost', function(e) {
      cancelEvent(e);
      clearInterval(this._loop);
    }.bind(this));

    addListener(canvas, 'webglcontextrestored', this._initGL.bind(this));

    this._initGL();
  },

  _initGL: function() {
    this.setSize({ width:this._container.offsetWidth, height:this._container.offsetHeight });

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    this._loop = setInterval(this._render.bind(this), 17);
  },

  _render: function() {
    requestAnimationFrame(function() {
      gl.clearColor(0.5, 0.5, 0.5, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//    for (var i = this._layers.length-1; i >= 0; i--) {
      for (var i = 0; i < this._layers.length; i++) {
        this._layers[i].render(this._projection);
      }
    }.bind(this));
  },

  _onDragStart: function(e) {
    if (this._isDisabled || (e.button !== undefined && e.button !== 0)) {
      return;
    }

    cancelEvent(e);

    if (e.touches !== undefined) {
      this._startRotation = this._rotation;
      this._startZoom = this._zoom;
      if (e.touches.length > 1) {
        return;
      }
      e = e.touches[0];
    }

    this._startX = e.clientX;
    this._startY = e.clientY;

    this._isDragging = true;
  },

  _onDragMove: function(e) {
    if (this._isDisabled || !this._isDragging) {
      return;
    }

    if (e.touches !== undefined) {
      if (e.touches.length > 1) {
        return;
      }
      e = e.touches[0];
    }

    var dx = e.clientX-this._startX;
    var dy = e.clientY-this._startY;
    var r = this._rotatePoint(dx, dy, this._rotation * Math.PI / 180);
    this.setCenter(unproject(this._origin.x-r.x, this._origin.y-r.y, this._worldSize));

    this._startX = e.clientX;
    this._startY = e.clientY;
  },

  _onDragEnd: function(e) {
    if (this._isDisabled || !this._isDragging) {
      return;
    }

    if (e.touches !== undefined) {
      if (e.touches.length > 1) {
        return;
      }
      e = e.touches[0];
    }

    this._isDragging = false;

    var dx = e.clientX-this._startX;
    var dy = e.clientY-this._startY;
    var r = this._rotatePoint(dx, dy, this._rotation * Math.PI / 180);
    this.setCenter(unproject(this._origin.x-r.x, this._origin.y-r.y, this._worldSize));
  },

  _rotatePoint: function(x, y, angle) {
    return {
      x: Math.cos(angle)*x - Math.sin(angle)*y,
      y: Math.sin(angle)*x + Math.cos(angle)*y
    };
  },

  _onGestureChange: function(e) {
    if (this._isDisabled) {
      return;
    }
    cancelEvent(e);
    this.setRotation(this._startRotation-e.rotation);
    this.setZoom(this._startZoom + (e.scale - 1));
  },

  _onDoubleClick: function(e) {
    if (this._isDisabled) {
      return;
    }
    cancelEvent(e);
    this.setZoom(this._zoom + 1, e);
  },

  _onMouseWheel: function(e) {
    if (this._isDisabled) {
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

    var adjust = 0.2 * (delta > 0 ? 1 : delta < 0 ? -1 : 0);

    this.setZoom(this._zoom + adjust, e);
  },

  _onResize: function() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(function() {
      var container = this._container;
      if (this._size.width !== container.offsetWidth || this._size.height !== container.offsetHeight) {
        this.setSize({ width:container.offsetWidth, height:container.offsetHeight });
      }
    }.bind(this), 250);
  },

  _emit: function(type) {
    if (!this._listeners[type]) {
      return;
    }
    var listeners = this._listeners[type];
    for (var i = 0, il = listeners.length; i < il; i++) {
      listeners[i]();
    }
  },

  addLayer: function(layer) {
    this._layers.push(layer);
  },

  removeLayer: function(layer) {
    for (var i = 0; i < this._layers.length; i++) {
      if (this._layers[i] === layer) {
        this._layers[i].splice(i, 1);
        return;
      }
    }
  },

  setDisabled: function(flag) {
    this._isDisabled = !!flag;
  },

  on: function(type, listener) {
    var listeners = this._listeners[type] || (this._listeners[type] = []);
    listeners.push(listener);
    return this;
  },

  _setOrigin: function(origin) {
    this._origin = origin;
  },

  off: function(type, listener) {
    return this;
  },

  getZoom: function() {
    return this._zoom;
  },

  setZoom: function(zoom, e) {
    zoom = clamp(parseFloat(zoom), this.minZoom, this.maxZoom);

    if (this._zoom !== zoom) {
      if (!e) {
        this._zoom = zoom;
        this._worldSize = TILE_SIZE * Math.pow(2, zoom);
        this._setOrigin(project(this._center.latitude, this._center.longitude, this._worldSize));
      } else {
        var size = this.getSize();
        var dx = size.width /2 - e.clientX;
        var dy = size.height/2 - e.clientY;
        var geoPos = unproject(this._origin.x - dx, this._origin.y - dy, this._worldSize);

        this._zoom = zoom;
        this._worldSize = TILE_SIZE * Math.pow(2, zoom);

        var pxPos = project(geoPos.latitude, geoPos.longitude, this._worldSize);
        this._setOrigin({ x:pxPos.x+dx, y:pxPos.y+dy });
        this._center = unproject(this._origin.x, this._origin.y, this._worldSize);
      }

      this._emit('change');
    }

    return this;
  },

  getCenter: function() {
    return this._center;
  },

  setCenter: function(center) {
    center.latitude  = clamp(parseFloat(center.latitude),   -90,  90);
    center.longitude = clamp(parseFloat(center.longitude), -180, 180);

    if (this._center.latitude !== center.latitude || this._center.longitude !== center.longitude) {
      this._center = center;
      this._setOrigin(project(center.latitude, center.longitude, this._worldSize));
      this._emit('change');
    }

    return this;
  },

  getBounds: function() {
    var centerXY = project(this._center.latitude, this._center.longitude, this._worldSize);

    var size = this.getSize();
    var halfWidth  = size.width/2;
    var halfHeight = size.height/2;

    var nw = unproject(centerXY.x - halfWidth, centerXY.y - halfHeight, this._worldSize);
    var se = unproject(centerXY.x + halfWidth, centerXY.y + halfHeight, this._worldSize);

    return {
      n: nw.latitude,
      w: nw.longitude,
      s: se.latitude,
      e: se.longitude
    };
  },

  setSize: function(size) {
    var canvas = gl.canvas;
    if (size.width !== this._size.width || size.height !== this._size.height) {
      canvas.width  = this._size.width  = size.width;
      canvas.height = this._size.height = size.height;
      gl.viewport(0, 0, size.width, size.height);
      this._projection = Matrix.perspective(20, size.width, size.height, 40000);
      this._emit('resize');
    }

    return this;
  },

  getSize: function() {
    return this._size;
  },

  getOrigin: function() {
    return this._origin;
  },

  getRotation: function() {
    return this._rotation;
  },

  setRotation: function(rotation) {
    rotation = parseFloat(rotation)%360;
    if (this._rotation !== rotation) {
      this._rotation = rotation;
      this._emit('change');
    }
    return this;
  },

  getTilt: function() {
    return this._tilt;
  },

  setTilt: function(tilt) {
    tilt = clamp(parseFloat(tilt), 0, 70);
    if (this._tilt !== tilt) {
      this._tilt = tilt;
      this._emit('change');
    }
    return this;
  },

  getContext: function() {
    return gl;
  },

  destroy: function() {
    var canvas = gl.canvas;
    canvas.parentNode.removeChild(canvas);
    gl = null;

    // TODO: stop render loop
//  clearInterval(...);
    this._listeners = null;

    for (var i = 0; i < this._layers.length; i++) {
      this._layers[i].destroy();
    }
    this._layers = null;
  }
};
