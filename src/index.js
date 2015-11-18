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

var OSMBuildings = function(options) {
  APP = this; // references to this. Should make other globals obsolete.

  options = options || {};

  if (options.style) {
    this.setStyle(options.style);
  }

  APP.baseURL = options.baseURL || '.';

  render.bendRadius = 500;
  render.bendDistance = 500;

  render.backgroundColor = new Color(options.backgroundColor || BACKGROUND_COLOR).toArray();
  render.fogColor        = new Color(options.fogColor        || FOG_COLOR).toArray();
  render.highlightColor  = new Color(options.highlightColor  || HIGHLIGHT_COLOR).toArray();

  render.Buildings.showBackfaces = options.showBackfaces;

  // can be: 'quality', 'performance'
  render.optimize = options.optimize || 'quality';

  this.attribution = options.attribution || OSMBuildings.ATTRIBUTION;

  APP.minZoom = parseFloat(options.minZoom) || 15;
  APP.maxZoom = parseFloat(options.maxZoom) || 22;
  if (APP.maxZoom < APP.minZoom) {
    APP.maxZoom = APP.minZoom;
  }
};

OSMBuildings.VERSION = '1.0.1';
OSMBuildings.ATTRIBUTION = '© OSM Buildings <a href="http://osmbuildings.org">http://osmbuildings.org</a>';

OSMBuildings.prototype = {

  on: function(type, fn) {
    gl.canvas.addEventListener(type, fn);
    return this;
  },

  off: function(type, fn) {
    gl.canvas.removeEventListener(type, fn);
  },

  emit: function(type, detail) {
    var event = new CustomEvent(type, { detail:detail });
    gl.canvas.dispatchEvent(event);
  },

  addTo: function(map) {
    MAP = map;
    glx = new GLX(MAP.container, MAP.width, MAP.height, render.optimize);
    gl = glx.context;

    MAP.addLayer(this);

    render.start();

    return this;
  },

  remove: function() {
    render.stop();
    MAP.removeLayer(this);
    MAP = null;
  },

  setStyle: function(style) {
    //render.backgroundColor = new Color(options.backgroundColor || BACKGROUND_COLOR).toArray();
    //render.fogColor        = new Color(options.fogColor        || FOG_COLOR).toArray();
    //render.highlightColor  = new Color(options.highlightColor  || HIGHLIGHT_COLOR).toArray();

    DEFAULT_COLOR = style.color || style.wallColor || DEFAULT_COLOR;
    //if (color.isValid) {
    //  DEFAULT_COLOR = color.toArray();
    //}
    return this;
  },

  // TODO: this should be part of the underlying map engine
  /* Returns the screen position of the point at 'latitude'/'longitude' with
    'elevation'.
   */
  transform: function(latitude, longitude, elevation) {
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
  /* returns the geographic position (latitude/longitude) of the map layer 
   * (elevation==0) at viewport position (x,y), or 'undefined' if no part of the
   * map plane would be rendered at (x,y) - e.g. if (x,y) lies above the horizon.
   */
  untransform: function(x, y) {
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

  //// TODO: this should be part of the underlying map engine
  //getBounds: function(latitude, longitude, elevation) {},

  addOBJ: function(url, position, options) {
    return new mesh.OBJ(url, position, options);
  },

  addGeoJSON: function(url, options) {
    return new mesh.GeoJSON(url, options);
  },

  // TODO: allow more data layers later on
  addGeoJSONTiles: function(url, options) {
    options = options || {};
    options.fixedZoom = options.fixedZoom || 15;
    APP.dataGrid = new Grid(url, data.Tile, options);
    return APP.dataGrid;
  },

  addMapTiles: function(url, options) {
    APP.basemapGrid = new Grid(url, basemap.Tile, options);
    return APP.basemapGrid;
  },

  highlight: function(id) {
    render.Buildings.highlightID = id ? render.Interaction.idToColor(id) : null;
  },

  // TODO: check naming. show() suggests it affects the layer rather than objects on it
  show: function(selector, duration) {
    Filter.remove('hidden', selector, duration);
    return this;
  },

  // TODO: check naming. hide() suggests it affects the layer rather than objects on it
  hide: function(selector, duration) {
    Filter.add('hidden', selector, duration);
    return this;
  },

  getTarget: function(x, y) {
    return render.Interaction.getTarget(x, y);
  },

  screenshot: function(callback) {
    // TODO: use promises here
    render.screenshotCallback = callback;
    return this;
  },

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
