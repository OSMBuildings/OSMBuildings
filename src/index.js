/*
 * NOTE: OSMBuildings cannot use a single global world coordinate system.
 *       The numerical accuracy required for such a system would be about
 *       32bits to represent world-wide geometry faithfully within a few
 *       centimeters of accuracy. Most computations in OSMBuildings, however,
 *       are performed on a GPU where only IEEE floats with 23bits of accuracy
 *       (plus 8 bits of range) are available.
 *       Instead, OSMBuildings' coordinate system has a reference point
 *       (APP.position) at the viewport center, and all world positions are
 *       expressed as distances in meters from that reference point. The
 *       reference point itself shifts with map panning so that all world
 *       positions relevant to the part of the world curently rendered on-screen
 *       can accurately be represented within the limited accuracy of IEEE floats.
 */

var APP, GL;

/**
 * User defined function that will be called when an event is fired
 * @callback eventCallback
 * @param {String} type Event type
 * @param {any} [payload] Payload of any type
 */

/**
 * User defined function that will be called on each feature, for modification before rendering
 * @callback selectorCallback
 * @param {String} id The feature's id
 * @param {Object} feature The feature
 */

/**
 * User defined callback function for getTarget()
 * @callback getTargetCallback
 * @param {Object} feature The feature
 */

/**
 * @class OSMBuildings
 * @param {Object} [options] OSMBuildings options
 * @param {Number} [options.minZoom=14.5] Global minimum allowed zoom
 * @param {Number} [options.maxZoom=20] Global maximum allowed zoom
 * @param {Object} [options.bounds] A bounding box to restrict the map to
 * @param {Boolean} [options.state=false] Store the map state in the URL
 * @param {Boolean} [options.disabled=false] Disable user input
 * @param {String} [options.attribution] An attribution string
 * @param {Number} [options.zoom=minZoom..maxZoom] Initial zoom, default is middle between global minZoom and maxZoom
 * @param {Number} [options.rotation=0] Initial rotation
 * @param {Number} [options.tilt=0] Initial tilt
 * @param {Object} [options.position] Initial position
 * @param {Number} [options.position.latitude=52.520000] position latitude
 * @param {Number} [options.position.longitude=13.410000] Position longitude
 * @deprecated {String} [options.baseURL='.'] For locating assets. This is relative to calling html page
 * @deprecated {Boolean} [options.showBackfaces=false] Render front and backsides of polygons. false increases performance, true might be needed for bad geometries
 * @deprecated {String} [options.fogColor='#e8e0d8'] Color to be used for sky gradients and distance fog
 * @param {String} [options.backgroundColor='#efe8e0'] Overall background color
 * @param {String} [options.highlightColor='#f08000'] Default color for highlighting features
 * @param {Boolean} [options.fastMode=false] Enables faster rendering at cost of image quality.
 * @deprecated {Array} [options.effects=[]] Which effects to enable. The only effect at the moment is 'shadows'
 * @param {Object} [options.style] Sets the default building style
 * @param {String} [options.style.color='rgb(220, 210, 200)'] Sets the default building color
 */
const OSMBuildings = function(options) {
  APP = this; // refers to 'this' (current instance). Should make other globals obsolete.

  APP.activity = new Activity();

  APP.options = (options || {});

  if (APP.options.style) {
    var style = APP.options.style;
    if (style.color || style.wallColor) {
      DEFAULT_COLOR = Qolor.parse(style.color || style.wallColor).toArray();
    }
  }

  render.backgroundColor = Qolor.parse(APP.options.backgroundColor || BACKGROUND_COLOR).toArray();
  render.fogColor        = Qolor.parse(APP.options.fogColor        || FOG_COLOR).toArray();

  if (APP.options.highlightColor) {
    HIGHLIGHT_COLOR = Qolor.parse(APP.options.highlightColor).toArray();
  }

  APP.attribution = APP.options.attribution || OSMBuildings.ATTRIBUTION;

  APP.minZoom = Math.max(parseFloat(APP.options.minZoom || MIN_ZOOM), MIN_ZOOM);
  APP.maxZoom = Math.min(parseFloat(APP.options.maxZoom || MAX_ZOOM), MAX_ZOOM);
  if (APP.maxZoom < APP.minZoom) {
    APP.minZoom = MIN_ZOOM;
    APP.maxZoom = MAX_ZOOM;
  }

  APP.bounds = APP.options.bounds;

  APP.position = APP.options.position || { latitude: 52.520000, longitude: 13.410000 };
  APP.zoom = APP.options.zoom || (APP.minZoom + (APP.maxZoom-APP.minZoom)/2);
  APP.rotation = APP.options.rotation || 0;
  APP.tilt = APP.options.tilt || 0;

  if (APP.options.disabled) {
    APP.setDisabled(true);
  }

  const numProc = window.navigator.hardwareConcurrency;
  APP.workers = new Workers('./../src/workers/worker.js', numProc*4);
};

/**
 * (String) OSMBuildings version
 * @static
 */
OSMBuildings.VERSION = '{{VERSION}}';

/**
 * (String) OSMBuildings attribution
 * @static
 */
OSMBuildings.ATTRIBUTION = '<a href="https://osmbuildings.org/">© OSM Buildings</a>';

/**
 * Fired when a 3d object has been loaded
 * @event OSMBuildings#loadfeature
 */

/**
 * Fired when map has been zoomed
 * @event OSMBuildings#zoom
 */

/**
 * Fired when map view has been rotated
 * @event OSMBuildings#rotate
 */

/**
 * Fired when map view has been tilted
 * @event OSMBuildings#tilt
 */

/**
 * Fired when map view has been changed, i.e. zoom, pan, tilt, rotation
 * @event OSMBuildings#change
 */

/**
 * Fired when map container has been resized
 * @event OSMBuildings#resize
 */

/**
 * Fired when map container has been double clicked/tapped
 * @event OSMBuildings#doubleclick
 */

/**
 * Fired when map container has been clicked/tapped
 * @event OSMBuildings#pointerdown
 */

/**
 * Fired when mouse/finger has been moved
 * @event OSMBuildings#pointermove
 */

/**
 * Fired when mouse button/finger been lifted
 * @event OSMBuildings#pointerup
 */

/**
 * Fired when gesture has been performed on the map
 * @event OSMBuildings#gesture
 */

/**
 * Fired when data loading starts
 * @event OSMBuildings#busy
 */

/**
 * Fired when data loading ends
 * @event OSMBuildings#idle
 */


OSMBuildings.prototype = {

  /**
   * Adds OSMBuildings to DOM container
   * @param {HTMLElement|String} container A DOM Element or its id to append the map to
   * @param {Integer} [width] Enforce width of container
   * @param {Integer} [height] Enforce height of container
   */
  appendTo: function(container, width, height) {
    if (typeof container === 'string') {
      container = document.getElementById(container);
    }

    APP.container = document.createElement('DIV');
    APP.container.className = 'osmb';
    if (container.offsetHeight === 0) {
      container.style.height = '100%';
      console.warn('Map container height should be set. Now defaults to 100%.');
    }
    container.appendChild(APP.container);

    APP.width  = width  !== undefined ? width  : container.offsetWidth;
    APP.height = height !== undefined ? height : container.offsetHeight;

    this.canvas = document.createElement('CANVAS');
    this.canvas.className = 'osmb-viewport';
    this.canvas.width = APP.width;
    this.canvas.height = APP.width;
    APP.container.appendChild(this.canvas);

    this.glx = new GLX(this.canvas, APP.options.fastMode);
    GL = this.glx.GL;

    Events.init(this.canvas);

    APP._getStateFromUrl();
    if (APP.options.state) {
      APP._setStateToUrl();
      APP.on('change', APP._setStateToUrl);
    }

    APP._attribution = document.createElement('DIV');
    APP._attribution.className = 'osmb-attribution';
    APP.container.appendChild(APP._attribution);
    APP._updateAttribution();

    APP.setDate(new Date());
    render.start();
  },

  /**
   * Adds an event listener
   * @param {String} type Event type to listen for
   * @param {eventCallback} fn Callback function
   */
  on: function(type, fn) {
    Events.on(type, fn);
  },

  /**
   * Removes event listeners
   * @param {String} type Event type to listen for
   * @param {eventCallback} [fn] If callback is given, only remove that particular listener
   */
  off: function(type, fn) {
    Events.off(type, fn);
  },

  /**
   * Trigger a specific event
   * @param {String} event Event type to listen for
   * @param {any} [payload] Any kind of payload
   */
  emit: function(type, payload) {
    Events.emit(type, payload);
  },

  /**
   * Set date for shadow calculations
   * @param {Date} date
   */
  setDate: function(date) {
    Sun.setDate(typeof date === 'string' ? new Date(date) : date);
  },

  // TODO: this should be part of the underlying map engine
  /**
   * Get screen position from a 3d point
   * @param {Number} latitude Latitude of the point
   * @param {Number} longitude Longitude of the point
   * @param {Number} elevation Elevation of the point
   * @return {Object} Screen position in pixels { x, y }
   */
  project: function(latitude, longitude, elevation) {
    var
      metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE *
                                 Math.cos(APP.position.latitude / 180 * Math.PI),
      worldPos = [ (longitude- APP.position.longitude) * metersPerDegreeLongitude,
                  -(latitude - APP.position.latitude)  * METERS_PER_DEGREE_LATITUDE,
                    elevation                          * HEIGHT_SCALE ];
    // takes current cam pos into account.
    var posNDC = transformVec3( render.viewProjMatrix.data, worldPos);
    posNDC = mul3scalar( add3(posNDC, [1, 1, 1]), 1/2); // from [-1..1] to [0..1]

    return { x:    posNDC[0]  * APP.width,
             y: (1-posNDC[1]) * APP.height,
             z:    posNDC[2]
    };
  },

  // TODO: this should be part of the underlying map engine
  /**
   * Turns a screen point (x, y) into a geographic position (latitude/longitude/elevation=0).
   * Returns 'undefined' if point would be invisible or lies above horizon.
   * @param {Number} x X position on screen
   * @param {Number} y Y position om screen
   * @return {Object} Geographic position { latitude, longitude }
   */
  unproject: function(x, y) {
    var inverse = GLX.Matrix.invert(render.viewProjMatrix.data);
    /* convert window/viewport coordinates to NDC [0..1]. Note that the browser
     * screen coordinates are y-down, while the WebGL NDC coordinates are y-up,
     * so we have to invert the y value here */
    var posNDC = [x/APP.width, 1-y/APP.height];
    posNDC = add2( mul2scalar(posNDC, 2.0), [-1, -1, -1]); // [0..1] to [-1..1];
    var worldPos = getIntersectionWithXYPlane(posNDC[0], posNDC[1], inverse);
    if (worldPos === undefined) {
      return;
    }
    var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);

    return {
      latitude:  APP.position.latitude - worldPos[1]/ METERS_PER_DEGREE_LATITUDE,
      longitude: APP.position.longitude+ worldPos[0]/ metersPerDegreeLongitude
    };
  },

  /**
   * Adds an 3D object (OBJ format) file to the map.<br>
   * <em>Important</em>: objects with exactly the same url are cached and only loaded once.<br>
   * In order to remove the object, use myObj.destroy()
   * @param {String} url URL of the OBJ file
   * @param {Object} position Where to render the object
   * @param {Number} position.latitude Position latitude for the object
   * @param {Number} position.longitude Position longitude for the object
   * @param {Object} [options] Options for rendering the object
   * @param {Number} [options.scale=1] Scale the model by this value before rendering
   * @param {Number} [options.rotation=0] Rotate the model by this much before rendering
   * @param {Number} [options.elevation=<ground height>] The height above ground to place the model at
   * @param {String} [options.id] An identifier for the object. This is used for getting info about the object later
   * @param {String} [options.color] A color to apply to the model
   * @return {Object} The added object
   */
  addOBJ: function(url, position, options) {
    return new mesh.OBJ(url, position, options);
  },

  /**
   * Adds a GeoJSON object to the map.<br>
   * In order to remove the object use myObj.destroy()
   * @param {String} url URL of the GeoJSON file or a JavaScript Object representing a GeoJSON FeatureCollection
   * @param {Object} [options] Options to apply to the GeoJSON being rendered
   * @param {Number} [options.scale=1] Scale the model by this value before rendering
   * @param {Number} [options.rotation=0] Rotate the model by this much before rendering
   * @param {Number} [options.elevation=<ground height>] The height above ground to place the model at
   * @param {String} [options.id] An identifier for the object. This is used for getting info about the object later
   * @param {String} [options.color] A color to apply to the model
   * @param {Number} [options.minZoom=14.5] Minimum zoom level to show this feature, defaults to and limited by global minZoom
   * @param {Number} [options.maxZoom=maxZoom] Maximum zoom level to show this feature, defaults to and limited by global maxZoom
   * @param {Boolean} [options.fadeIn=true] Fade GeoJSON features; if `false`, then display immediately
   * @return {Object} The added object
   */
  addGeoJSON: function(url, options) {
    return new mesh.GeoJSON(url, options);
  },

  // TODO: allow more data layers later on
  /**
   * Adds a GeoJSON tile layer to the map.<br>
   * This is for continuous building coverage.<br>
   * In order to remove the layer use myLayer.destroy()
   * @param {String} [url=https://{s}.data.osmbuildings.org/0.2/{k}/tile/{z}/{x}/{y}.json] url The URL of the GeoJSON tile server
   * @param {Object} [options]
   * @param {Number} [options.fixedZoom=15] Tiles are fetched for this zoom level only. Other zoom levels are scaled up/down to this value
   * @param {String} [options.color] A color to apply to all features on this layer
   * @param {Number} [options.minZoom=14.5] Minimum zoom level to show features from this layer. Defaults to and limited by global minZoom.
   * @param {Number} [options.maxZoom=maxZoom] Maximum zoom level to show features from this layer. Defaults to and limited by global maxZoom.
   * @param {Boolean} [options.fadeIn=true] Fade GeoJSON features. If `false`, then display immediately.
   * @return {Object} The added layer object
   */
  addGeoJSONTiles: function(url, options) {
    options = options || {};
    options.fixedZoom = options.fixedZoom || 15;
    APP.dataGrid = new Grid(url, data.Tile, options);
    return APP.dataGrid;
  },

  /**
   * Adds a 2d base map source. This renders below the buildings.<br>
   * In order to remove the layer use myLayer.destroy()
   * @param {String} url The URL of the map server. This could be from Mapbox or other tile servers
   * @return {Object} The added layer object
   */
  addMapTiles: function(url) {
    APP.basemapGrid = new Grid(url, basemap.Tile);
    return APP.basemapGrid;
  },

  /**
   * Highlight a given feature by id.<br>
   * Currently, the highlight can only be applied to one feature.<br>
   * Set id to `null` in order to un-highlight.
   * @param {String} id The feature's id. For OSM buildings, it's the OSM id. For other objects, it's whatever is defined in the options passed to it.
   * @param {String} highlightColor An optional color string to be used for highlighting
   */
  highlight: function(id, highlightColor) {
    render.Buildings.highlightId = id ? render.Picking.idToColor(id) : null;
    render.Buildings.highlightColor = id && highlightColor ? Qolor.parse(highlightColor).toArray() : HIGHLIGHT_COLOR;
  },

  // TODO: check naming. show() suggests it affects the layer rather than objects on it

  /**
   * Sets a function that selects objects to show on this layer
   * @param {selectorCallback} selector A function that will get run on each feature, and returns a boolean indicating whether or not to show the feature
   * @param {Integer} [duration=0] How long to fade out the feature
   */
  show: function(selector, duration) {
    Filter.remove('hidden', selector, duration);
  },

  // TODO: check naming. hide() suggests it affects the layer rather than objects on it

  /**
   * Sets a function that defines which objects to hide on this layer
   * @param {selectorCallback} selector A function that will get run on each feature, and returns a boolean indicating whether or not to hide the feature
   * @param {Integer} [duration=0] How long to fade in the feature
   */
  hide: function(selector, duration) {
    Filter.add('hidden', selector, duration);
  },

  /**
   * Returns the feature from a position on the screen. <em>Works asynchronous.</em>
   * @name getTarget()
   * @deprecated
   */
  getTarget: function(x, y, callback) {
    // TODO: remove
    render.Picking.render(x, y, callback);
  },

  /**
   * Take a screenshot. <em>Works asynchronous.</em>
   * @name screenshot()
   * @deprecated
   */
  screenshot: function() {
  },

  /**
   * @private
   */
  _updateAttribution: function() {
    var attribution = [];
    if (APP.attribution) {
      attribution.push(APP.attribution);
    }
    // for (var i = 0; i < APP.layers.length; i++) {
    //   if (APP.layers[i].attribution) {
    //     attribution.push(APP.layers[i].attribution);
    //   }
    // }
    APP._attribution.innerHTML = attribution.join(' · ');
  },

  /**
   * @private
   */
  _getStateFromUrl: function() {
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

    APP.setPosition((state.lat !== undefined && state.lon !== undefined) ? { latitude:state.lat, longitude:state.lon } : APP.position);
    APP.setZoom(state.zoom !== undefined ? state.zoom : APP.zoom);
    APP.setRotation(state.rotation !== undefined ? state.rotation : APP.rotation);
    APP.setTilt(state.tilt !== undefined ? state.tilt : APP.tilt);
  },

  /**
   * @private
   */
  _setStateToUrl: function() {
    if (!history.replaceState || APP.stateDebounce) {
      return;
    }

    APP.stateDebounce = setTimeout(function() {
      APP.stateDebounce = null;
      var params = [];
      params.push('lat=' + APP.position.latitude.toFixed(6));
      params.push('lon=' + APP.position.longitude.toFixed(6));
      params.push('zoom=' + APP.zoom.toFixed(1));
      params.push('tilt=' + APP.tilt.toFixed(1));
      params.push('rotation=' + APP.rotation.toFixed(1));
      history.replaceState({}, '', '?' + params.join('&'));
    }, 1000);
  },

  setDisabled: function(flag) {
    Events.disabled = !!flag;
  },

  isDisabled: function() {
    return !!Events.disabled;
  },

  /**
   * Returns geographical bounds of the current view
   * - since the bounds are always axis-aligned they will contain areas that are
   *   not currently visible if the current view is not also axis-aligned.
   * - The bounds only contain the map area that OSMBuildings considers for rendering.
   *   OSMBuildings has a rendering distance of about 3.5km, so the bounds will
   *   never extend beyond that, even if the horizon is visible (in which case the
   *   bounds would mathematically be infinite).
   * - the bounds only consider ground level. For example, buildings whose top
   *   is seen at the lower edge of the screen, but whose footprint is outside
   * - The bounds only consider ground level. For example, buildings whose top
   *   is seen at the lower edge of the screen, but whose footprint is outside
   *   of the current view below the lower edge do not contribute to the bounds.
   *   so their top may be visible and they may still be out of bounds.
   * @return {Array} Bounding coordinates in unspecific order [{ latitude, longitude }, ...]
   */
  getBounds: function() {
    var viewQuad = render.getViewQuad(), res = [];
    for (var i in viewQuad) {
      res[i] = getPositionFromLocal(viewQuad[i]);
    }
    return res;
  },

  /**
   * Set zoom level
   * @emits OSMBuildings#zoom
   * @emits OSMBuildings#change
   * @param {Number} zoom The new zoom level
   */
  setZoom: function(zoom, e) {
    zoom = parseFloat(zoom);

    zoom = Math.max(zoom, APP.minZoom);
    zoom = Math.min(zoom, APP.maxZoom);

    if (APP.zoom !== zoom) {
      APP.zoom = zoom;

      /* if a screen position was given for which the geographic position displayed
       * should not change under the zoom */
      if (e) {
        // FIXME: add code; this needs to take the current camera (rotation and
        //        perspective) into account
        // NOTE:  the old code (comment out below) only works for north-up
        //        non-perspective views
        /*
         var dx = APP.container.offsetWidth/2  - e.clientX;
         var dy = APP.container.offsetHeight/2 - e.clientY;
         APP.center.x -= dx;
         APP.center.y -= dy;
         APP.center.x *= ratio;
         APP.center.y *= ratio;
         APP.center.x += dx;
         APP.center.y += dy;*/
      }

      Events.emit('zoom', { zoom: zoom });
      Events.emit('change');
    }
  },

  /**
   * Get current zoom level
   * @return {Number} zoom level
   */
  getZoom: function() {
    return APP.zoom;
  },

  /**
   * Set map's geographic position
   * @param {Object} pos The new position
   * @param {Number} pos.latitude
   * @param {Number} pos.longitude
   * @emits OSMBuildings#change
   */
  setPosition: function(pos) {
    var lat = parseFloat(pos.latitude);
    var lon = parseFloat(pos.longitude);
    if (isNaN(lat) || isNaN(lon)) {
      return;
    }
    APP.position = { latitude: clamp(lat, -90, 90), longitude: clamp(lon, -180, 180) };
    Events.emit('change');
  },

  /**
   * Get map's current geographic position
   * @return {Object} Geographic position { latitude, longitude }
   */
  getPosition: function() {
    return APP.position;
  },

  /**
   * Set map view's size in pixels
   * @public
   * @param {Object} size
   * @param {Integer} size.width
   * @param {Integer} size.height
   * @emits OSMBuildings#resize
   */
  setSize: function(size) {
    if (size.width !== APP.width || size.height !== APP.height) {
      APP.width = size.width;
      APP.height = size.height;
      Events.emit('resize', { width: APP.width, height: APP.height });
    }
  },

  /**
   * Get map's current view size in pixels
   * @return {Object} View size { width, height }
   */
  getSize: function() {
    return { width: APP.width, height: APP.height };
  },

  /**
   * Set map's rotation
   * @param {Number} rotation The new rotation angle in degrees
   * @emits OSMBuildings#rotate
   * @emits OSMBuildings#change
   */
  setRotation: function(rotation) {
    rotation = parseFloat(rotation)%360;
    if (APP.rotation !== rotation) {
      APP.rotation = rotation;
      Events.emit('rotate', { rotation: rotation });
      Events.emit('change');
    }
  },

  /**
   * Get map's current rotation
   * @return {Number} Rotation in degrees
   */
  getRotation: function() {
    return APP.rotation;
  },

  /**
   * Set map's tilt
   * @param {Number} tilt The new tilt in degree
   * @emits OSMBuildings#tilt
   * @emits OSMBuildings#change
   */
  setTilt: function(tilt) {
    tilt = clamp(parseFloat(tilt), 0, 45); // bigger max increases shadow moire on base map
    if (APP.tilt !== tilt) {
      APP.tilt = tilt;
      Events.emit('tilt', { tilt: tilt });
      Events.emit('change');
    }
  },

  /**
   * Get map's current tilt
   * @return {Number} Tilt in degrees
   */
  getTilt: function() {
    return APP.tilt;
  },

  /**
   * Destroys the map
   */
  destroy: function() {
    render.destroy();

    // APP.basemapGrid.destroy();
    // APP.dataGrid.destroy();

    this.glx.destroy();
    this.canvas.parentNode.removeChild(this.canvas);

    data.Index.destroy();
    APP.activity.destroy();

    APP.container.innerHTML = '';
  }

  // ,
  // destroyWorker: function() {
  //   APP._worker.terminate();
  // }
};

//*****************************************************************************

if (typeof define === 'function') {
  define([], OSMBuildings);
} else if (typeof module === 'object') {
  module.exports = OSMBuildings;
} else {
  window.OSMBuildings = OSMBuildings;
}
