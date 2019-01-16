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

let APP, GL;

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
 * @class OSMBuildings
 */

class OSMBuildings {

  /**
   * @constructor
   * @param {Object} [options] OSMBuildings options
   * @param {String} options.container A DOM Element or its id to append the viewer to
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
   * @param {String} [options.baseURL='.'] DEPRECATED For locating assets. This is relative to calling html page
   * @param {Boolean} [options.showBackfaces=false] DEPRECATED Render front and backsides of polygons. false increases performance, true might be needed for bad geometries
   * @param {String} [options.fogColor='#e8e0d8'] DEPRECATED Color to be used for sky gradients and distance fog
   * @param {String} [options.highlightColor='#f08000'] DEPRECATED Default color for highlighting features
   * @param {Array} [options.effects=[]] DEPRECATED Which effects to enable. The only effect at the moment is 'shadows'
   * @param {String} [options.backgroundColor='#efe8e0'] Overall background color
   * @param {Boolean} [options.fastMode=false] Enables faster rendering at cost of image quality.
   * @param {Object} [options.style] Sets the default building style
   * @param {String} [options.style.color='rgb(220, 210, 200)'] Sets the default building color
   */
  constructor (options = {}) {
    APP = this; // refers to current instance. Should make other globals obsolete.

    if (options.style) {
      if (options.style.color || options.style.wallColor) {
        DEFAULT_COLOR = Qolor.parse(options.style.color || options.style.wallColor).toArray();
      }
    }

    this.view = new View();
    this.view.backgroundColor = Qolor.parse(options.backgroundColor || BACKGROUND_COLOR).toArray();
    this.view.fogColor = Qolor.parse(options.fogColor || FOG_COLOR).toArray();

    this.attribution = options.attribution || OSMBuildings.ATTRIBUTION;

    this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), MIN_ZOOM);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), MAX_ZOOM);
    if (this.maxZoom < this.minZoom) {
      this.minZoom = MIN_ZOOM;
      this.maxZoom = MAX_ZOOM;
    }

    this.bounds = options.bounds;

    this.position = options.position || { latitude: 52.520000, longitude: 13.410000 };
    this.zoom = options.zoom || (this.minZoom + (this.maxZoom - this.minZoom) / 2);
    this.rotation = options.rotation || 0;
    this.tilt = options.tilt || 0;

    const numProc = Math.min(window.navigator.hardwareConcurrency || 2, 4);

    const blob = new Blob([workers.feature], { type: 'application/javascript' });
    this.workers = new WorkerPool(URL.createObjectURL(blob), numProc * 4);

    //*** create container ********************************

    let container = options.container;
    if (typeof container === 'string') {
      container = document.getElementById(options.container);
    }

    this.container = document.createElement('DIV');
    this.container.className = 'osmb';
    if (container.offsetHeight === 0) {
      container.style.height = '100%';
      console.warn('Container height should be set. Now defaults to 100%.');
    }
    container.appendChild(this.container);

    //*** create canvas ***********************************

    this.canvas = document.createElement('CANVAS');
    this.canvas.className = 'osmb-viewport';

    // const devicePixelRatio = window.devicePixelRatio || 1;
    const devicePixelRatio = 1; // this also affects building height and zoom

    this.canvas.width = this.width = container.offsetWidth*devicePixelRatio;
    this.canvas.height = this.height = container.offsetHeight*devicePixelRatio;
    this.container.appendChild(this.canvas);

    this.glx = new GLX(this.canvas, options.fastMode);
    GL = this.glx.GL;

    this.features = new FeatureCollection();
    this.icons = new IconCollection();
    this.markers = new Collection();

    this.events = new Events(this.canvas);
    if (options.disabled) {
      this.setDisabled(true);
    }

    this._getStateFromUrl();
    if (options.state) {
      this._setStateToUrl();
      this.events.on('change', e => {
        this._setStateToUrl();
      });
    }

    this._attribution = document.createElement('DIV');
    this._attribution.className = 'osmb-attribution';
    this.container.appendChild(this._attribution);
    this._updateAttribution();

    this.setDate(new Date());
    this.view.start();

    this.emit('load', this);
  }

  /**
   * DEPRECATED
   */
  appendTo () {}

    /**
   * Adds an event listener
   * @param {String} type Event type to listen for
   * @param {eventCallback} fn Callback function
   */
  on (type, fn) {
    this.events.on(type, fn);
  }

  /**
   * Removes an event listener
   * @param {String} type Event type to listen for
   * @param {eventCallback} [fn] If callback is given, only remove that particular listener
   */
  off (type, fn) {
    this.events.off(type, fn);
  }

  /**
   * Triggers a specific event
   * @param {String} event Event type to listen for
   * @param {} [payload] Any kind of payload
   */
  emit (type, payload) {
    this.events.emit(type, payload);
  }

  /**
   * Set date for shadow calculations
   * @param {Date} date
   */
  setDate (date) {
    View.Sun.setDate(typeof date === 'string' ? new Date(date) : date);
  }

  /**
   * Gets 2d screen position from a 3d point
   * @param {Number} latitude Latitude of the point
   * @param {Number} longitude Longitude of the point
   * @param {Number} altitude Altitude of the point
   * @return {Object} Screen position in pixels { x, y }
   */
  project (latitude, longitude, altitude) {
    const worldPos = [(longitude - this.position.longitude) * METERS_PER_DEGREE_LONGITUDE, -(latitude - this.position.latitude) * METERS_PER_DEGREE_LATITUDE, altitude];

    // takes current cam pos into account.
    let posNDC = transformVec3(this.view.viewProjMatrix.data, worldPos);
    posNDC = mul3scalar(add3(posNDC, [1, 1, 1]), 1 / 2); // from [-1..1] to [0..1]

    return {
      x: posNDC[0] * this.width,
      y: (1 - posNDC[1]) * this.height,
      z: posNDC[2]
    };
  }

  /**
   * Turns a screen point (x, y) into a geographic position (latitude/longitude/altitude=0).
   * Returns 'undefined' if point would be invisible or lies above horizon.
   * @param {Number} x X position on screen
   * @param {Number} y Y position om screen
   * @return {Object} Geographic position { latitude, longitude }
   */
  unproject (x, y) {
    const inverseViewMatrix = GLX.Matrix.invert(this.view.viewProjMatrix.data);
    // convert window/viewport coordinates to NDC [0..1]. Note that the browser
    // screen coordinates are y-down, while the WebGL NDC coordinates are y-up,
    // so we have to invert the y value here

    let posNDC = [x / this.width, 1 - y / this.height];
    posNDC = add2(mul2scalar(posNDC, 2.0), [-1, -1, -1]); // [0..1] to [-1..1];

    const worldPos = getIntersectionWithXYPlane(posNDC[0], posNDC[1], inverseViewMatrix);
    if (worldPos === undefined) {
      return;
    }

    return {
      longitude: this.position.longitude + worldPos[0] / METERS_PER_DEGREE_LONGITUDE,
      latitude: this.position.latitude - worldPos[1] / METERS_PER_DEGREE_LATITUDE
    };
  }

  /**
   * Removes a feature, layer or marker from the map.
   */
  remove (item) {
    if (item.destroy) {
      item.destroy();
    }
  }

  /**
   * Adds an 3d object (OBJ format) file to the map.
   * <em>Important</em> objects with exactly the same url are cached and only loaded once.
   * @param {String} url URL of the OBJ file
   * @param {Object} position Where to render the object
   * @param {Number} position.latitude Position latitude for the object
   * @param {Number} position.longitude Position longitude for the object
   * @param {Object} [options] Options for rendering the object
   * @param {Number} [options.scale=1] Scale the model by this value before rendering
   * @param {Number} [options.rotation=0] Rotate the model by this much before rendering
   * @param {Number} [options.altitude=0] The height above ground to place the model at
   * @param {String} [options.id] An identifier for the object. This is used for getting info about the object later
   * @param {String} [options.color] A color to apply to the model
   * @param {Boolean} [options.swapYZ] Swap y and z coordinates. Use this if your model is standing upright on one side
   * @return {Object} The added object
   */
  addOBJ (url, position, options = {}) {
    options.position = position;
    return new Feature('OBJ', url, options);
  }

  /**
   * Adds a GeoJSON object to the map.
   * @param {String} url URL of the GeoJSON file or a JavaScript Object representing a GeoJSON FeatureCollection
   * @param {Object} [options] Options to apply to the GeoJSON being rendered
   * @param {Number} [options.scale=1] Scale the model by this value before rendering
   * @param {Number} [options.rotation=0] Rotate the model by this much before rendering
   * @param {Number} [options.altitude=0] The height above ground to place the model at
   * @param {String} [options.id] An identifier for the object. This is used for getting info about the object later
   * @param {String} [options.color] A color to apply to the model
   * @param {Number} [options.minZoom=14.5] Minimum zoom level to show this feature, defaults to and limited by global minZoom
   * @param {Number} [options.maxZoom=maxZoom] Maximum zoom level to show this feature, defaults to and limited by global maxZoom
   * @param {Boolean} [options.fadeIn=true] DEPRECATED Fade GeoJSON features; if `false`, then display immediately
   * @return {Object} The added object
   */
  addGeoJSON (url, options) {
    return new Feature('GeoJSON', url, options);
  }

  // TODO: allow more data layers later on
  /**
   * Adds a GeoJSON tile layer to the map.
   * This is for continuous building coverage.
   * @param {String} [url=https://{s}.data.osmbuildings.org/0.2/{k}/tile/{z}/{x}/{y}.json] url The URL of the GeoJSON tile server
   * @param {Object} [options]
   * @param {Number} [options.fixedZoom=15] Tiles are fetched for this zoom level only. Other zoom levels are scaled up/down to this value
   * @param {Number} [options.minZoom=14.5] Minimum zoom level to show features from this layer. Defaults to and limited by global minZoom.
   * @param {Number} [options.maxZoom=maxZoom] Maximum zoom level to show features from this layer. Defaults to and limited by global maxZoom.
   * @return {Object} The added layer object
   */
  addGeoJSONTiles (url, options = {}) {
    options.fixedZoom = options.fixedZoom || 15;
    this.dataGrid = new Grid(url, GeoJSONTile, options, 2);
    return this.dataGrid;
  }

  /**
   * Adds a 2d base map source. This renders below the buildings.
   * @param {String} url The URL of the map server. This could be from Mapbox or other tile servers
   * @return {Object} The added layer object
   */
  addMapTiles (url) {
    this.basemapGrid = new Grid(url, BitmapTile, {}, 4);
    return this.basemapGrid;
  }

  /**
   * This replaces any previous highlighting.
   * @example
   * osmb.highlight(building => {
   *   if (building.properties.height > 200) return 'red';
   *   if (building.properties.height > 100) return 'green';
   * });
   * @param callback {Function} A function that does user defined filtering and highlights by returning a color. Can be falsy in order to reset highlighting.
   */
  highlight (tintCallback) {
    return this.features.setTintCallback(tintCallback || (() => false));
  }

  /**
   * This replaces any previous show/hide rule.
   * @example
   * osmb.hide(building => {
   *   if (building.properties.height < 100) return true;
   *   if (building.id == "B05417") return true;
   * });
   * @param callback {Function} A function that does user defined filtering and hides if return value is true
   */
  hide (zScaleCallback) {
    this.features.setZScaleCallback(zScaleCallback);
  }

  /**
   * DEPRECATED
   */
  show () {}

  /**
   * DEPRECATED
   */
  getTarget () {}

  /**
   * DEPRECATED
   */
  screenshot () {}

  /**
   * @private
   */
  _updateAttribution () {
    const attribution = [];
    if (this.attribution) {
      attribution.push(this.attribution);
    }
    // this.layers.forEach(layer => {
    //   if (layer.attribution) {
    //     attribution.push(layer.attribution);
    //   }
    // });
    this._attribution.innerHTML = attribution.join(' · ');
  }

  /**
   * @private
   */
  _getStateFromUrl () {
    const
      query = location.search,
      state = {};

    if (query) {
      query.substring(1).replace(/(?:^|&)([^&=]*)=?([^&]*)/g, ($0, $1, $2) => {
        if ($1) {
          state[$1] = $2;
        }
      });
    }

    this.setPosition((state.lat !== undefined && state.lon !== undefined) ? {
      latitude: parseFloat(state.lat),
      longitude: parseFloat(state.lon)
    } : this.position);

    this.setZoom(state.zoom !== undefined ? parseFloat(state.zoom) : this.zoom);
    this.setRotation(state.rotation !== undefined ? parseFloat(state.rotation) : this.rotation);
    this.setTilt(state.tilt !== undefined ? parseFloat(state.tilt) : this.tilt);
  }

  /**
   * @private
   */
  _setStateToUrl () {
    if (!history.replaceState || this.stateDebounce) {
      return;
    }

    this.stateDebounce = setTimeout(() => {
      this.stateDebounce = null;
      const params = [];
      params.push('lat=' + this.position.latitude.toFixed(6));
      params.push('lon=' + this.position.longitude.toFixed(6));
      params.push('zoom=' + this.zoom.toFixed(1));
      params.push('tilt=' + this.tilt.toFixed(1));
      params.push('rotation=' + this.rotation.toFixed(1));
      history.replaceState({}, '', '?' + params.join('&'));
    }, 1000);
  }

  /**
   * Disables map interaction
   * @param {Boolean} flag
   */
  setDisabled (flag) {
    this.events.isDisabled = !!flag;
  }

  /**
   * Checks for map interaction disabled
   * @return {Boolean} flag
   */
  isDisabled () {
    return !!this.events.isDisabled;
  }

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
  getBounds () {
    const viewQuad = this.view.getViewQuad();
    return viewQuad.map(point => getPositionFromLocal(point));
  }

  /**
   * Set zoom level
   * @emits OSMBuildings#zoom
   * @emits OSMBuildings#change
   * @param {Number} zoom The new zoom level
   */
  setZoom (zoom, e) {
    zoom = Math.max(zoom, this.minZoom);
    zoom = Math.min(zoom, this.maxZoom);

    if (this.zoom !== zoom) {
      this.zoom = zoom;

      /* if a screen position was given for which the geographic position displayed
       * should not change under the zoom */
      if (e) {
        // FIXME: add code; this needs to take the current camera (rotation and
        //        perspective) into account
        // NOTE:  the old code (comment out below) only works for north-up
        //        non-perspective views
        /*
         const dx = this.container.offsetWidth/2  - e.clientX;
         const dy = this.container.offsetHeight/2 - e.clientY;
         this.center.x -= dx;
         this.center.y -= dy;
         this.center.x *= ratio;
         this.center.y *= ratio;
         this.center.x += dx;
         this.center.y += dy;*/
      }

      this.events.emit('zoom', { zoom: zoom });
      this.events.emit('change');
    }
  }

  /**
   * Get current zoom level
   * @return {Number} zoom level
   */
  getZoom () {
    return this.zoom;
  }

  /**
   * Set map's geographic position
   * @param {Object} pos The new position
   * @param {Number} pos.latitude
   * @param {Number} pos.longitude
   * @emits OSMBuildings#change
   */
  setPosition (pos) {
    // if (isNaN(lat) || isNaN(lon)) {
    //   return;
    // }
    // { latitude: clamp(lat, -90, 90), longitude: clamp(lon, -180, 180) };

    this.position = pos;

    METERS_PER_DEGREE_LONGITUDE = METERS_PER_DEGREE_LATITUDE * Math.cos(this.position.latitude / 180 * Math.PI);

    this.events.emit('change');
  }

  /**
   * Get map's current geographic position
   * @return {Object} Geographic position { latitude, longitude }
   */
  getPosition () {
    return this.position;
  }

  /**
   * Set map view's size in pixels
   * @public
   * @param {Object} size DEPRECATED
   * @param {Integer} size.width DEPRECATED
   * @param {Integer} size.height DEPRECATED
   * @param {Integer} width
   * @param {Integer} height
   * @emits OSMBuildings#resize
   */
  setSize (width, height) {
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;
      this.events.emit('resize', { width: this.width, height: this.height });
    }
  }

  /**
   * Get map's current view size in pixels
   * @return {Object} View size { width, height }
   */
  getSize () {
    return { width: this.width, height: this.height };
  }

  /**
   * Set map's rotation
   * @param {Number} rotation The new rotation angle in degrees
   * @emits OSMBuildings#rotate
   * @emits OSMBuildings#change
   */
  setRotation (rotation) {
    rotation = rotation % 360;
    if (this.rotation !== rotation) {
      this.rotation = rotation;
      this.events.emit('rotate', { rotation: rotation });
      this.events.emit('change');
    }
  }

  /**
   * Get map's current rotation
   * @return {Number} Rotation in degrees
   */
  getRotation () {
    return this.rotation;
  }

  /**
   * Set map's tilt
   * @param {Number} tilt The new tilt in degree
   * @emits OSMBuildings#tilt
   * @emits OSMBuildings#change
   */
  setTilt (tilt) {
    tilt = clamp(tilt, 0, MAX_TILT);
    if (this.tilt !== tilt) {
      this.tilt = tilt;
      this.events.emit('tilt', { tilt: tilt });
      this.events.emit('change');
    }
  }

  /**
   * Get map's current tilt
   * @return {Number} Tilt in degrees
   */
  getTilt () {
    return this.tilt;
  }

  /**
   * Adds a marker to the map in 3d space.
   * @param {Object} position geographic position including altitude
   * @param {Number} position.latitude latitude
   * @param {Number} position.longitude longitude
   * @param {Number} [position.altitude=0] altitude in meters
   * @param {Object} [data] custom data properties to attach to the marker, i.e. an id
   * @param {Object} [options] additional options
   * @param {String} [options.url] url to an SVG file to use as custom marker. Currently only path properties are supported. Overlapping path's may create strange results.
   * @param {String} [options.color] color which whole marker will be tinted
   * @return {Object} Marker
   */
  addMarker (position, data, options) {
   return new Marker(position, data, options);
  }

  /**
   * Destroys the map
   */
  destroy () {
    this.view.destroy();

    // this.basemapGrid.destroy();
    // this.dataGrid.destroy();

    this.events.destroy();

    this.glx.destroy();
    this.canvas.parentNode.removeChild(this.canvas);

    this.features.destroy();
    this.markers.destroy();

    this.container.innerHTML = '';
  }

  // destroyWorker () {
  //   this._worker.terminate();
  // }
}


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
 * DEPRECATED Fired when data loading starts
 * @event OSMBuildings#busy
 */

/**
 * DEPRECATED Fired when data loading ends
 * @event OSMBuildings#idle
 */

/**
 * (String) OSMBuildings version
 * @static
 */
OSMBuildings.VERSION = null;

/**
 * (String) OSMBuildings attribution
 * @static
 */
OSMBuildings.ATTRIBUTION = '<a href="https://osmbuildings.org/">© OSM Buildings</a>';


//*****************************************************************************

if (typeof define === 'function') {
  define([], OSMBuildings);
} else if (typeof module === 'object') {
  module.exports = OSMBuildings;
} else {
  window.OSMBuildings = OSMBuildings;
}
