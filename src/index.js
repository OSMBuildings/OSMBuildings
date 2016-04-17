var APP;
var MAP, glx, gl;
/*
 * Note: OSMBuildings cannot use a single global world coordinate system.
 *       The numerical accuracy required for such a system would be about
 *       32bits to represent world-wide geometry faithfully within a few
 *       centimeters of accuracy. Most computations in OSMBuildings, however,
 *       are performed on a GPU where only IEEE floats with 23bits of accuracy
 *       (plus 8 bits of range) are available.
 *       Instead, OSMBuildings' coordinate system has a reference point
 *       (MAP.position) at the viewport center, and all world positions are
 *       expressed as distances in meters from that reference point. The
 *       reference point itself shifts with map panning so that all world
 *       positions relevant to the part of the world curently rendered on-screen
 *       can accurately be represented within the limited accuracy of IEEE floats.*/

/**
 * OSMBuildings main class
 * @constructor
 * @param {Object} [options] - OSMBuildings options
 * @param {String} [options.baseURL='.'] - For locating assets. This is relative to calling page
 * @param {Float} [options.minZoom=15] - Minimum allowed zoom
 * @param {Float} [options.maxZoom=22] - Maximum allowed zoom
 * @param {String} [options.attribution='<a href="http://osmbuildings.org">© OSM Buildings</a>'] - Attribution
 * @param {Boolean} [options.showBackfaces=false] - Render front and backsides of polygons. false increases performance, true might be needed for bad geometries
 * @param {String} [options.fogColor='#e8e0d8'] - Color to be used for sky gradients and distance fog
 * @param {String} [options.backgroundColor='#efe8e0'] - Overall background color
 * @param {Boolean} [options.fastMode=false] - Enables faster rendering at cost of image quality. If performance is an issue, consider also removing effects
 * @param {Array} [options.effects=[]] - Which effects to enable. The only effect at the moment is 'shadows'
 * @param {Object} [options.style={ color: 'rgb(220, 210, 200)' }] - Sets the default building style
 */
var OSMBuildings = function(options) {
  APP = this; // references to this. Should make other globals obsolete.

  options = options || {};

  if (options.style) {
    this.setStyle(options.style);
  }

  APP.baseURL = options.baseURL || '.';

  render.backgroundColor = new Color(options.backgroundColor || BACKGROUND_COLOR).toArray();
  render.fogColor        = new Color(options.fogColor        || FOG_COLOR).toArray();
  render.highlightColor  = new Color(options.highlightColor  || HIGHLIGHT_COLOR).toArray();

  render.Buildings.showBackfaces = options.showBackfaces;

  APP.highQuality = !options.fastMode;

  render.effects = {};
  var effects = options.effects || [];
  for (var i = 0; i < effects.length; i++) {
    render.effects[ effects[i] ] = true;
  }

  this.attribution = options.attribution || OSMBuildings.ATTRIBUTION;

  APP.minZoom = parseFloat(options.minZoom) || 15;
  APP.maxZoom = parseFloat(options.maxZoom) || 22;
  if (APP.maxZoom < APP.minZoom) {
    APP.maxZoom = APP.minZoom;
  }
};

OSMBuildings.VERSION = '{{VERSION}}';
OSMBuildings.ATTRIBUTION = '<a href="http://osmbuildings.org">© OSM Buildings</a>';

OSMBuildings.prototype = {

  /**
   * A function that will be called when an event is fired. The parameters passed to the function
   * depend on what type of event it is
   * @callback OSMBuildings~eventListenerFunction
   */
  /**
   * Adds an event listener
   * @param {String} event - An event identifier to listen for
   * @param {OSMBuildings~eventListenerFunction} callback
   */
  on: function(type, fn) {
    gl.canvas.addEventListener(type, fn);
    return this;
  },

  /**
   * Removes event listeners
   * @param {String} event - An event identifier to listen for
   * @param {OSMBuildings~eventListenerFunction} [fn] - If given, only remove the given function
   */
  off: function(type, fn) {
    gl.canvas.removeEventListener(type, fn);
  },

  emit: function(type, detail) {
    var event = new CustomEvent(type, { detail:detail });
    gl.canvas.dispatchEvent(event);
  },

  /**
   * Adds the OSMBuildings object as a layer to the given map
   * @param {Object} map - The map to add it to
   */
  addTo: function(map) {
    MAP = map;
    glx = new GLX(MAP.container, MAP.width, MAP.height, APP.highQuality);
    gl = glx.context;

    MAP.addLayer(this);

    this.setDate(new Date());

    render.start();

    return this;
  },

  /**
   * Removes the OSMBuildings object from the map
   */
  remove: function() {
    render.stop();
    MAP.removeLayer(this);
    MAP = null;
  },

  /**
   * Sets the map style
   * @param {Object} style
   * @param {String} [style.color] - The color for buildings
   */
  setStyle: function(style) {
    //render.backgroundColor = new Color(options.backgroundColor || BACKGROUND_COLOR).toArray();
    //render.fogColor        = new Color(options.fogColor        || FOG_COLOR).toArray();
    //render.highlightColor  = new Color(options.highlightColor  || HIGHLIGHT_COLOR).toArray();

    DEFAULT_COLOR = style.color || style.wallColor || DEFAULT_COLOR;
    // is color valid?
    // DEFAULT_COLOR = color.toArray();
    return this;
  },

  /**
   * Sets the date for shadow calculations
   * @param {Date} date
   */
  setDate: function(date) {
    Sun.setDate(typeof date === 'string' ? new Date(date) : date);
    return this;
  },

  // TODO: this should be part of the underlying map engine
  /**
   * Returns the screen position of the point
   * @param {Float} latitude - Latitude of the point
   * @param {Float} longitude - Longitude of the point
   * @param {Float} elevation - Elevation of the point
   */
  project: function(latitude, longitude, elevation) {
    var
      metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE *
                                 Math.cos(MAP.position.latitude / 180 * Math.PI),
      worldPos = [ (longitude- MAP.position.longitude) * metersPerDegreeLongitude,
                  -(latitude - MAP.position.latitude)  * METERS_PER_DEGREE_LATITUDE,
                    elevation                          * HEIGHT_SCALE ];
    // takes current cam pos into account.
    var posNDC = transformVec3( render.viewProjMatrix.data, worldPos);
    posNDC = mul3scalar( add3(posNDC, [1, 1, 1]), 1/2); // from [-1..1] to [0..1]

    return { x:    posNDC[0]  * MAP.width,
             y: (1-posNDC[1]) * MAP.height,
             z:    posNDC[2]
    };
  },

  // TODO: this should be part of the underlying map engine
  /**
   * Returns the geographic position (latitude/longitude) of the map layer
   * (elevation==0) at viewport position (x,y), or 'undefined' if no part of the
   * map plane would be rendered at (x,y) - e.g. if (x,y) lies above the horizon.
   * @param {Integer} x - the x position in the viewport
   * @param {Integer} y - the y position in the viewport
   */
  unproject: function(x, y) {
    var inverse = glx.Matrix.invert(render.viewProjMatrix.data);
    /* convert window/viewport coordinates to NDC [0..1]. Note that the browser
     * screen coordinates are y-down, while the WebGL NDC coordinates are y-up,
     * so we have to invert the y value here */
    var posNDC = [x/MAP.width, 1-y/MAP.height];
    posNDC = add2( mul2scalar(posNDC, 2.0), [-1, -1, -1]); // [0..1] to [-1..1];
    var worldPos = getIntersectionWithXYPlane(posNDC[0], posNDC[1], inverse);
    if (worldPos === undefined) {
      return;
    }
    metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE *
                               Math.cos(MAP.position.latitude / 180 * Math.PI);

    return {
      latitude:  MAP.position.latitude - worldPos[1]/ METERS_PER_DEGREE_LATITUDE,
      longitude: MAP.position.longitude+ worldPos[0]/ metersPerDegreeLongitude
    };
  },

  /**
   * Adds an OBJ (3D object) file to the map
   * @param {String} url - URL of the OBJ file
   * @param {Object} position - Where to render the OBJ
   * @param {Float} position.latitude - Latitude for the OBJ
   * @param {Float} position.longitude - Longitude for the OBJ
   * @param {Object} [options] - Options for rendering the OBJ
   * @param {Integer} [options.scale=1] - Scale the model by this value before rendering
   * @param {Integer} [options.rotation=0] - Rotate the model by this much before rendering
   * @param {Integer} [options.elevation=<ground height>] - The height above ground to place the model at
   * @param {String} [options.id] - An identifier for the object. This is used for getting info about the object later
   * @param {String} [options.color] - A color to apply to the model
   */
  addOBJ: function(url, position, options) {
    return new mesh.OBJ(url, position, options);
  },


  /**
   * A function that will be called on each feature, for modification before rendering
   * @callback OSMBuildings~modifierFunction
   * @param {String} id - The feature's id
   * @param {Object} properties - The feature's properties
   */
  /**
   * Adds a GeoJSON layer to the map
   * @param {String} url - URL of the GeoJSON file
   * @param {Object} options - Options to apply to the GeoJSON being rendered
   * @param {Integer} [options.scale=1] - Scale the model by this value before rendering
   * @param {Integer} [options.rotation=0] - Rotate the model by this much before rendering
   * @param {Integer} [options.elevation=<ground height>] - The height above ground to place the model at
   * @param {String} [options.id] - An identifier for the object. This is used for getting info about the object later
   * @param {String} [options.color] - A color to apply to the model
   * @param {OSMBuildings~modifierFunction} [options.modifier] - A function that will get called on each feature, for modification before rendering
   */
  addGeoJSON: function(url, options) {
    return new mesh.GeoJSON(url, options);
  },

  // TODO: allow more data layers later on
  /**
   * Adds a GeoJSON tile base layer, for rendering the 3D buildings
   * @param {String} url - The URL of the GeoJSON tile server, in {@link https://github.com/OSMBuildings/OSMBuildings/blob/master/docs/server.md the correct format}
   * @param {Object} options
   * @param {Integer} [options.fixedZoom=15]
   * @param {Object} [options.bounds] - Currently not used
   * @param {String} [options.color] - A color to apply to all features on this layer
   * @param {OSMBuildings~modifierFunction} [options.modifier] - A function that will get called on each feature, for modification before rendering
   * @param {Integer} [options.minZoom] - The minimum zoom level to show features from this layer
   * @param {Integer} [options.maxZoom] - The maxiumum zoom level to show features from this layer
   */
  addGeoJSONTiles: function(url, options) {
    options = options || {};
    options.fixedZoom = options.fixedZoom || 15;
    APP.dataGrid = new Grid(url, data.Tile, options);
    return APP.dataGrid;
  },

  /**
   * Adds a 2D map source, to render below the 3D buildings
   * @param {String} url - The URL of the map server. This could be Mapbox, or {@link https://wiki.openstreetmap.org/wiki/Tiles any other tile server} that supports the right format
   * @param {Object} options
   * @param {Integer} [options.fixedZoom]
   * @param {Object} [options.bounds] - Currently not used
   * @param {String} [options.color] - A color to apply to all features on this layer
   * @param {OSMBuildings~modifierFunction} [options.modifier] - A function that will get called on each feature, for modification before rendering
   * @param {Integer} [options.minZoom] - The minimum zoom level to show features from this layer
   * @param {Integer} [options.maxZoom] - The maxiumum zoom level to show features from this layer
   */
  addMapTiles: function(url, options) {
    APP.basemapGrid = new Grid(url, basemap.Tile, options);
    return APP.basemapGrid;
  },

  /**
   * Highlight a given feature by id. Currently, the highlight can only be applied to one feature. Set color = `null` in order to un-highlight
   * @param {String} id - The feature's id. For OSM buildings, it's the OSM id. For other objects, it's whatever's defined in the options passed to it.
   */
  highlight: function(id) {
    render.Buildings.highlightID = id ? render.Picking.idToColor(id) : null;
    return this;
  },

  // TODO: check naming. show() suggests it affects the layer rather than objects on it
  /**
   * A function that will be called on each feature, for modification before rendering
   * @callback OSMBuildings~selectorFunction
   * @param {String} id - The feature's id
   * @param {Object} data - The feature's data
   */
  /**
   * Sets a function that defines which objects to show on this layer
   * @param {OSMBuildings~selectorFunction} selector - A function that will get run on each feature, and returns a boolean indicating whether or not to show the feature
   * @param {Integer} [duration=0] - How long to show the feature for
   */
  show: function(selector, duration) {
    Filter.remove('hidden', selector, duration);
    return this;
  },

  // TODO: check naming. hide() suggests it affects the layer rather than objects on it
 /**
  * Sets a function that defines which objects to hide on this layer
  * @param {OSMBuildings~selectorFunction} selector - A function that will get run on each feature, and returns a boolean indicating whether or not to hide the feature
  * @param {Integer} [duration=0] - How long to hide the feature for
  */
  hide: function(selector, duration) {
    Filter.add('hidden', selector, duration);
    return this;
  },

  /**
   * A callback function for getTarget
   * @callback OSMBuildings~getTargetCallback
   * @param {Object} feature - The feature
   */
  /**
   * Returns the feature from a position on the screen
   * @param {Integer} x - The x coordinate (in pixels) of position on the screen
   * @param {Integer} y - The y coordinate (in pixels) of position on the screen
   * @param {OSMBuildings~getTargetCallback} callback - A callback function that receives the object
   */
  getTarget: function(x, y, callback) {
    // TODO: use promises here
    render.Picking.getTarget(x, y, callback);
    return this;
  },

  /**
   * A callback function for screnshot
   * @callback OSMBuildings~screenshotCallback
   * @param screenshot - The screenshot
   */
  /**
   * Take a screenshot
   * @param {OSMBuildings~screenshotCallback} callback - A callback function that receives the screenshot
   */
  screenshot: function(callback) {
    // TODO: use promises here
    render.screenshotCallback = callback;
    return this;
  },

  /**
   * Destroy's the layer
   */
  destroy: function() {
    render.destroy();
    if (APP.basemapGrid) APP.basemapGrid.destroy();
    if (APP.dataGrid)    APP.dataGrid.destroy();

    // TODO: when taking over an existing canvas, don't destroy it here
    glx.destroy();
  }
};

//*****************************************************************************

if (typeof global.define === 'function') {
  global.define([], OSMBuildings);
} else if (typeof global.exports === 'object') {
  global.module.exports = OSMBuildings;
} else {
  global.OSMBuildings = OSMBuildings;
}
