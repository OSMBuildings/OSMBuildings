
var Renderer;

var OSMBuildings = function(containerId, options) {
  options = options || {};

  this._container = document.getElementById(containerId);

  Map.setState(options);
  Events.init(this._container);
  this._initRenderer(this._container);


  if (options.tileSource) {
    TileGrid.setSource(options.tileSource);
  }

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

  Renderer = new GLRenderer(gl);

  Grid.onMapChange();
  Grid.onMapResize();
  Renderer.onMapResize();
};

OSMBuildings.VERSION = '0.1.5';
OSMBuildings.ATTRIBUTION = '&copy; <a href="http://osmbuildings.org">OSM Buildings</a>';

OSMBuildings.prototype = {

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

  on: function(type, fn) {
    Events.on(type, fn);
    return this;
  },

  off: function(type, fn) {
    Events.off(type, fn);
    return this;
  },

  setZoom: function(zoom) {
    Map.setZoom(zoom);
    return this;
  },

  getZoom: function() {
    return Map.zoom;
  },

  setCenter: function(center) {
    Map.setCenter(center);
    return this;
  },

  getCenter: function() {
    return Map.center;
  },

  getBounds: function() {
    return Map.bounds();
  },

  setSize: function(size) {
    Map.setSize(size);
    return this;
  },

  getSize: function() {
    return Map.size;
  },

  getOrigin: function() {
    return Map.origin;
  },

  setRotation: function(rotation) {
    Map.setRotation(rotation);
    return this;
  },

  getRotation: function() {
    return Map.rotation;
  },

  setTilt: function(tilt) {
    Map.setTilt(tilt);
    return this;
  },

  getTilt: function() {
    return Map.tilt;
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
// TODO: do this rarely
var projection = Matrix.perspective(20, Map.size.width, Map.size.height, 40000);

      TileGrid.render(projection);
      Renderer.render(projection); // Data
    }.bind(this));
  },

  destroy: function() {
    var canvas = gl.canvas;
    canvas.parentNode.removeChild(canvas);
    gl = null;

    // TODO: stop render loop
    //  clearInterval(...);

    TileGrid.destroy();
    Grid.destroy();
  }
};
