/**
 * This is the base map engine for standalone OSM Buildings
 * @class Basemap
 */

/**
 * @private
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(value, min));
}

/**
 * Basemap
 * @Basemap
 * @param {HTMLElement} DOM container
 * @param {Object} options
 */
/**
 * OSMBuildings basemap
 * @constructor
 * @param {String} container - The id of the html element to display the map in
 * @param {Object} options
 * @param {Integer} [options.minZoom=10] - Minimum allowed zoom
 * @param {Integer} [options.maxZoom=20] - Maxiumum allowed zoom
 * @param {Object} [options.bounds] - A bounding box to restrict the map to
 * @param {Boolean} [options.state=false] - Store the map state in the URL
 * @param {Boolean} [options.disabled=false] - Disable user input
 * @param {String} [options.attribution] - An attribution string
 * @param {Float} [options.zoom=minZoom] - Initial zoom
 * @param {Float} [options.rotation=0] - Initial rotation
 * @param {Float} [options.tilt=0] - Initial tilt
 * @param {Object} [options.position] - Initial position
 * @param {Float} [options.position.latitude=52.520000]
 * @param {Float} [options.position.latitude=13.410000]
 */
var Basemap = function(container, options) {
  this.container = typeof container === 'string' ? document.getElementById(container) : container;
  options = options || {};

  this.container.classList.add('osmb-container');
  this.width = this.container.offsetWidth;
  this.height = this.container.offsetHeight;

  this.minZoom = parseFloat(options.minZoom) || 10;
  this.maxZoom = parseFloat(options.maxZoom) || 20;

  if (this.maxZoom < this.minZoom) {
    this.maxZoom = this.minZoom;
  }

  this.bounds = options.bounds;

  this.position = {};
  this.zoom = 0;

  this.listeners = {};
  this.layers = [];

  this.initState(options);

  if (options.state) {
    this.persistState();
    this.on('change', function() {
      this.persistState();
    }.bind(this));
  }

  Events.init(this);

  if (options.disabled) {
    this.setDisabled(true);
  }

  this.attribution = options.attribution;
  this.attributionDiv = document.createElement('DIV');
  this.attributionDiv.className = 'osmb-attribution';
  this.container.appendChild(this.attributionDiv);
  this.updateAttribution();
};

Basemap.prototype = {

  /**
   * @private
   */
  updateAttribution: function() {
    var attribution = [];
    for (var i = 0; i < this.layers.length; i++) {
      if (this.layers[i].attribution) {
        attribution.push(this.layers[i].attribution);
      }
    }
    if (this.attribution) {
      attribution.unshift(this.attribution);
    }
    this.attributionDiv.innerHTML = attribution.join(' · ');
  },

  /**
   * @private
   */
  initState: function(options) {
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
      position = { latitude: parseFloat(state.lat), longitude: parseFloat(state.lon) };
    }
    if (!position && state.latitude !== undefined && state.longitude !== undefined) {
      position = { latitude: state.latitude, longitude: state.longitude };
    }

    var zoom = (state.zoom !== undefined) ? state.zoom : options.zoom;
    var rotation = (state.rotation !== undefined) ? state.rotation : options.rotation;
    var tilt = (state.tilt !== undefined) ? state.tilt : options.tilt;

    this.setPosition(position || options.position || { latitude: 52.520000, longitude: 13.410000 });
    this.setZoom(zoom || this.minZoom);
    this.setRotation(rotation || 0);
    this.setTilt(tilt || 0);
  },

  /**
   * @private
   */
  persistState: function() {
    if (!history.replaceState || this.stateDebounce) {
      return;
    }

    this.stateDebounce = setTimeout(function() {
      this.stateDebounce = null;
      var params = [];
      params.push('lat=' + this.position.latitude.toFixed(6));
      params.push('lon=' + this.position.longitude.toFixed(6));
      params.push('zoom=' + this.zoom.toFixed(1));
      params.push('tilt=' + this.tilt.toFixed(1));
      params.push('rotation=' + this.rotation.toFixed(1));
      history.replaceState({}, '', '?' + params.join('&'));
    }.bind(this), 1000);
  },

  emit: function(type, detail) {
    var event = new CustomEvent(type, { detail:detail });
    this.container.dispatchEvent(event);
  },

  //***************************************************************************

  on: function(type, fn) {
    this.container.addEventListener(type, fn, false);
    return this;
  },

  off: function(type, fn) {
    this.container.removeEventListener(type, fn, false);
  },

  setDisabled: function(flag) {
    Events.disabled = !!flag;
    return this;
  },

  isDisabled: function() {
    return !!Events.disabled;
  },

  /* returns the geographical bounds of the current view.
   * notes:
   * - since the bounds are always axis-aligned they will contain areas that are
  /**
   * Returns the geographical bounds of the current view.
   * Notes:
   * - Since the bounds are always axis-aligned they will contain areas that are
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
   */
  getBounds: function() {
    var viewQuad = render.getViewQuad(), res = [];
    for (var i in viewQuad) {
      res[i] = getPositionFromLocal(viewQuad[i]);
    }
    return res;
  },

  /**
   * Sets the zoom level
   * @param {Float} zoom - The new zoom level
   * @param {Object} e - **Not currently used**
   * @fires Basemap#zoom
   * @fires Basemap#change
   */
  setZoom: function(zoom, e) {
    zoom = clamp(parseFloat(zoom), this.minZoom, this.maxZoom);

    if (this.zoom !== zoom) {
      this.zoom = zoom;

      /* if a screen position was given for which the geographic position displayed
       * should not change under the zoom */
      if (e) {
        //FIXME: add code; this needs to take the current camera (rotation and
        //       perspective) into account
        //NOTE:  the old code (comment out below) only works for north-up
        //       non-perspective views
        /*
         var dx = this.container.offsetWidth/2  - e.clientX;
         var dy = this.container.offsetHeight/2 - e.clientY;
         this.center.x -= dx;
         this.center.y -= dy;
         this.center.x *= ratio;
         this.center.y *= ratio;
         this.center.x += dx;
         this.center.y += dy;*/
      }
      /**
       * Fired when the basemap is zoomed (in either direction)
       * @event Basemap#zoom
       */
      this.emit('zoom', { zoom: zoom });

      /**
       * Fired when the basemap changes
       * @event Basemap#change
       */
      this.emit('change');
    }
    return this;
  },

  /**
   * Returns the current zoom level
   */
  getZoom: function() {
    return this.zoom;
  },

  /**
   * Sets the map's geographic position
   * @param {Object} pos - The new position
   * @param {Float} pos.latitude
   * @param {Float} pos.longitude
   * @fires Basemap#change
   */
  setPosition: function(pos) {
    var lat = parseFloat(pos.latitude);
    var lon = parseFloat(pos.longitude);
    if (isNaN(lat) || isNaN(lon)) {
      return;
    }
    this.position = { latitude: clamp(lat, -90, 90), longitude: clamp(lon, -180, 180) };
    this.emit('change');
    return this;
  },

  /**
   * Returns the map's current geographic position
   */
  getPosition: function() {
    return this.position;
  },

  /**
   * Sets the map's size
   * @param {Object} size
   * @param {Integer} size.width
   * @param {Integer} size.height
   * @fires Basemap#resize
   */
  setSize: function(size) {
    if (size.width !== this.width || size.height !== this.height) {
      this.width = size.width;
      this.height = size.height;

      /**
       * Fired when the map is resized
       * @event Basemap#resize
       */
      this.emit('resize', { width: this.width, height: this.height });
    }
    return this;
  },

  /**
   * Returns the map's current size
   */
  getSize: function() {
    return { width: this.width, height: this.height };
  },

  /**
   * Set's the maps rotation
   * @param {Float} rotation - The new rotation angle
   * @fires Basemap#rotate
   * @fires Basemap#change
   */
  setRotation: function(rotation) {
    rotation = parseFloat(rotation)%360;
    if (this.rotation !== rotation) {
      this.rotation = rotation;

      /**
       * Fired when the basemap is rotated
       * @event Basemap#rotate
       */
      this.emit('rotate', { rotation: rotation });
      this.emit('change');
    }
    return this;
  },

  /**
   * Returns the maps current rotation
   */
  getRotation: function() {
    return this.rotation;
  },

  /**
   * Sets the map's tilt
   * @param {Float} tilt - The new tilt
   * @fires Basemap#tilt
   * @fires Basemap#change
   */
  setTilt: function(tilt) {
    tilt = clamp(parseFloat(tilt), 0, 45); // bigger max increases shadow moire on base map
    if (this.tilt !== tilt) {
      this.tilt = tilt;

      /**
       * Fired when the basemap is tilted
       * @event Basemap#tilt
       */
      this.emit('tilt', { tilt: tilt });
      this.emit('change');
    }
    return this;
  },

  /**
   * Returns the map's current tilt
   */
  getTilt: function() {
    return this.tilt;
  },

  /**
   * Adds a layer to the map
   * @param {Object} layer - The layer to add
   */
  addLayer: function(layer) {
    this.layers.push(layer);
    this.updateAttribution();
    return this;
  },

  /**
   * Removes a layer from the map
   * @param {Object} layer - The layer to remove
   */
  removeLayer: function(layer) {
    this.layers = this.layers.filter(function(item) {
      return (item !== layer);
    });
    this.updateAttribution();
  },

  /**
   * Destroys the map
   */
  destroy: function() {
    this.listeners = [];
    this.layers = [];
    this.container.innerHTML = '';
  }
};
