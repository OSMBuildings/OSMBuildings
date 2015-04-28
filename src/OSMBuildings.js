
var Map = {}, Renderer;

var OSMBuildings = function(containerId, options) {
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


  Grid.fixedZoom = 16;

  // dataSource=false and dataSource=null would disable the data grid
  if (options.dataSource === undefined) {
    Grid.src = DATA_SRC.replace('{k}', options.dataKey || DATA_KEY);
  } else if (typeof options.dataSource === 'string') {
    Grid.src = options.dataSource;
  }

  this.setDisabled(options.disabled);

  if (options.style) {
    this.setStyle(options.style);
  }

  this.on('change', function() {
    Grid.onMapChange();
  });

  this.on('resize', function() {
    Grid.onMapResize();
    Renderer.onMapResize();
  });

  //  this.addAttribution(OSMBuildings.ATTRIBUTION);

  Renderer = new GLRenderer(this.getContext());

  Grid.onMapChange();
  Grid.onMapResize();
  Renderer.onMapResize();
};

OSMBuildings.VERSION = '0.1.5';
OSMBuildings.ATTRIBUTION = '&copy; <a href="http://osmbuildings.org">OSM Buildings</a>';

OSMBuildings.prototype = {

addLayer: function(layer) {
  this._layers.push(layer);
},

  setStyle: function(style) {
    var color = style.color || style.wallColor;
    if (color) {
      DEFAULT_COLOR = Color.parse(color).toRGBA();
    }
    return this;
  },

  addMesh: function(url) {
    var mesh = new Mesh(url);
    Data.add(mesh);
    if (typeof url === 'string') {
      mesh.load(url);
    }
    return this;
  },

  setDisabled: function(flag) {
    this._isDisabled = !!flag;
    return this;
  },

  isDisabled: function() {
    return !!this._isDisabled;
  },

  on: function(type, listener) {
    var listeners = this._listeners[type] || (this._listeners[type] = []);
    listeners.push(listener);
    return this;
  },

  off: function(type, listener) {
    return this;
  },

  setZoom: function(zoom, e) {
    zoom = clamp(parseFloat(zoom), this.minZoom, this.maxZoom);

    if (Map.zoom !== zoom) {
      if (!e) {
        Map.zoom = zoom;
        this._worldSize = TILE_SIZE*Math.pow(2, zoom);
        this._updateOrigin(project(Map.center.latitude, Map.center.longitude, this._worldSize));
      } else {
        var size = this.getSize();
        var dx = size.width/2 - e.clientX;
        var dy = size.height/2 - e.clientY;
        var geoPos = unproject(Map.origin.x - dx, Map.origin.y - dy, this._worldSize);

        Map.zoom = zoom;
        this._worldSize = TILE_SIZE*Math.pow(2, zoom);

        var pxPos = project(geoPos.latitude, geoPos.longitude, this._worldSize);
        this._updateOrigin({ x: pxPos.x + dx, y: pxPos.y + dy });
        Map.center = unproject(Map.origin.x, Map.origin.y, this._worldSize);
      }

      this._updateBounds();
      this._emit('change');
    }

    return this;
  },

  getZoom: function() {
    return Map.zoom;
  },

  setCenter: function(center) {
    center.latitude = clamp(parseFloat(center.latitude), -90, 90);
    center.longitude = clamp(parseFloat(center.longitude), -180, 180);

    if (Map.center.latitude !== center.latitude || Map.center.longitude !== center.longitude) {
      Map.center = center;
      this._updateOrigin(project(center.latitude, center.longitude, this._worldSize));
      this._updateBounds();
      this._emit('change');
    }

    return this;
  },

  getCenter: function() {
    return Map.center;
  },

  getBounds: function() {
    return Map.bounds();
  },

  setSize: function(size) {
    var canvas = gl.canvas;
    if (size.width !== Map.size.width || size.height !== Map.size.height) {
      canvas.width = Map.size.width = size.width;
      canvas.height = Map.size.height = size.height;
      gl.viewport(0, 0, size.width, size.height);
      this._projection = Matrix.perspective(20, size.width, size.height, 40000);
      this._updateBounds();
      this._emit('resize');
    }

    return this;
  },

  getSize: function() {
    return Map.size;
  },

  getOrigin: function() {
    return Map.origin;
  },

  setRotation: function(rotation) {
    rotation = parseFloat(rotation)%360;
    if (Map.rotation !== rotation) {
      Map.rotation = rotation;
      this._updateBounds();
      this._emit('change');
    }
    return this;
  },

  getRotation: function() {
    return Map.rotation;
  },

  setTilt: function(tilt) {
    tilt = clamp(parseFloat(tilt), 0, 70);
    if (Map.tilt !== tilt) {
      Map.tilt = tilt;
      this._updateBounds();
      this._emit('change');
    }
    return this;
  },

  getTilt: function() {
    return Map.tilt;
  },




  _initState: function(options) {
    Map.center = {};
    Map.size = { width: 0, height: 0 };
    options = State.load(options);
    this.setCenter(options.center || { latitude: 52.52000, longitude: 13.41000 });
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
    this._dragMoveEvent = this._hasTouch ? 'touchmove' : 'mousemove';
    this._dragEndEvent = this._hasTouch ? 'touchend' : 'mouseup';

    addListener(container, this._dragStartEvent, this._onDragStart.bind(this));
    addListener(container, 'dblclick', this._onDoubleClick.bind(this));
    addListener(document, this._dragMoveEvent, this._onDragMove.bind(this));
    addListener(document, this._dragEndEvent, this._onDragEnd.bind(this));

    if (this._hasTouch) {
      addListener(container, 'gesturechange', this._onGestureChange.bind(this));
    } else {
      addListener(container, 'mousewheel', this._onMouseWheel.bind(this));
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
    } catch (ex) {
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
    this.setSize({ width: this._container.offsetWidth, height: this._container.offsetHeight });

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    this._loop = setInterval(this._render.bind(this), 17);
  },

  _render: function() {
    requestAnimationFrame(function() {
      gl.clearColor(0.5, 0.5, 0.5, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      Renderer.render(); // Data
      for (var i = 0; i<this._layers.length; i++) {
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
      this._startRotation = Map.rotation;
      this._startZoom = Map.zoom;
      if (e.touches.length>1) {
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
      if (e.touches.length>1) {
        return;
      }
      e = e.touches[0];
    }

    var dx = e.clientX - this._startX;
    var dy = e.clientY - this._startY;
    var r = this._rotatePoint(dx, dy, Map.rotation*Math.PI/180);
    this.setCenter(unproject(Map.origin.x - r.x, Map.origin.y - r.y, this._worldSize));

    this._startX = e.clientX;
    this._startY = e.clientY;
  },

  _onDragEnd: function(e) {
    if (this._isDisabled || !this._isDragging) {
      return;
    }

    if (e.touches !== undefined) {
      if (e.touches.length>1) {
        return;
      }
      e = e.touches[0];
    }

    this._isDragging = false;

    var dx = e.clientX - this._startX;
    var dy = e.clientY - this._startY;
    var r = this._rotatePoint(dx, dy, Map.rotation*Math.PI/180);
    this.setCenter(unproject(Map.origin.x - r.x, Map.origin.y - r.y, this._worldSize));
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
    this.setRotation(this._startRotation - e.rotation);
    this.setZoom(this._startZoom + (e.scale - 1));
  },

  _onDoubleClick: function(e) {
    if (this._isDisabled) {
      return;
    }
    cancelEvent(e);
    this.setZoom(Map.zoom + 1, e);
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

    var adjust = 0.2*(delta>0 ? 1 : delta<0 ? -1 : 0);

    this.setZoom(Map.zoom + adjust, e);
  },

  _onResize: function() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(function() {
      var container = this._container;
      if (Map.size.width !== container.offsetWidth || Map.size.height !== container.offsetHeight) {
        this.setSize({ width: container.offsetWidth, height: container.offsetHeight });
      }
    }.bind(this), 250);
  },

  _updateOrigin: function(origin) {
    Map.origin = origin;
  },

  _updateBounds: function() {
    var centerXY = project(Map.center.latitude, Map.center.longitude, this._worldSize);

    var halfWidth = Map.size.width/2;
    var halfHeight = Map.size.height/2;

    var nw = unproject(centerXY.x - halfWidth, centerXY.y - halfHeight, this._worldSize);
    var se = unproject(centerXY.x + halfWidth, centerXY.y + halfHeight, this._worldSize);

    Map.bounds = {
      n: nw.latitude,
      w: nw.longitude,
      s: se.latitude,
      e: se.longitude
    };
  },

  _emit: function(type) {
    if (!this._listeners[type]) {
      return;
    }
    var listeners = this._listeners[type];
    for (var i = 0, il = listeners.length; i<il; i++) {
      listeners[i]();
    }
  },

  addLayer: function(layer) {
    this._layers.push(layer);
  },

  removeLayer: function(layer) {
    for (var i = 0; i<this._layers.length; i++) {
      if (this._layers[i] === layer) {
        this._layers[i].splice(i, 1);
        return;
      }
    }
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

    for (var i = 0; i<this._layers.length; i++) {
      this._layers[i].destroy();
    }
    this._layers = null;

    Grid.destroy();
  }
};
