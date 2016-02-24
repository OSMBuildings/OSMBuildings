
var document = global.document;

function clamp(value, min, max) {
  return Math.min(max, Math.max(value, min));
}

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

  this.initState(options);

  if (options.state) {
    this.persistState();
    this.on('change', function() {
      this.persistState();
    }.bind(this));
  }

  this.pointer = new Pointer(this, this.container);
  this.layers  = new Layers(this);

  if (options.disabled) {
    this.setDisabled(true);
  }

  this.attribution = options.attribution;
  this.attributionDiv = document.createElement('DIV');
  this.attributionDiv.className = 'osmb-attribution';
  this.container.appendChild(this.attributionDiv);
  this.updateAttribution();
};

Basemap.TILE_SIZE = 256;

Basemap.prototype = {

  updateAttribution: function() {
    var attribution = this.layers.getAttribution();
    if (this.attribution) {
      attribution.unshift(this.attribution);
    }
    this.attributionDiv.innerHTML = attribution.join(' · ');
  },

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
      position = { latitude:parseFloat(state.lat), longitude:parseFloat(state.lon) };
    }
    if (!position && state.latitude !== undefined && state.longitude !== undefined) {
      position = { latitude:state.latitude, longitude:state.longitude };
    }

    var zoom     = (state.zoom     !== undefined) ? state.zoom     : options.zoom;
    var rotation = (state.rotation !== undefined) ? state.rotation : options.rotation;
    var tilt     = (state.tilt     !== undefined) ? state.tilt     : options.tilt;
    var bend     = (state.bend     !== undefined) ? state.bend     : options.bend;

    this.setPosition(position || options.position || { latitude:52.520000, longitude:13.410000 });
    this.setZoom(zoom || this.minZoom);
    this.setRotation(rotation || 0);
    this.setTilt(tilt || 0);
    this.setBend(bend || 0);
  },

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
      params.push('bend=' + this.bend.toFixed(1));
      params.push('rotation=' + this.rotation.toFixed(1));
      history.replaceState({}, '', '?'+ params.join('&'));
    }.bind(this), 1000);
  },

  // TODO: switch to native events
  emit: function(type, payload) {
    if (!this.listeners[type]) {
      return;
    }

    var listeners = this.listeners[type];

    requestAnimationFrame(function() {
      for (var i = 0, il = listeners.length; i < il; i++) {
        listeners[i](payload);
      }
    });
  },

  //***************************************************************************

  // TODO: switch to native events
  on: function(type, fn) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(fn);
    return this;
  },

  // TODO: switch to native events
  off: function(type, fn) {
    if (!this.listeners[type]) {
      return;
    }

    this.listeners[type] = this.listeners[type].filter(function(listener) {
      return (listener !== fn);
    });
  },

  setDisabled: function(flag) {
    this.pointer.disabled = !!flag;
    return this;
  },

  isDisabled: function() {
    return !!this.pointer.disabled;
  },

  getBounds: function() {
    //FIXME: update method; the old code did only work for straight top-down
    //       views, not for other cameras.
    /*
    var
      W2 = this.width/2, H2 = this.height/2,
      angle = this.rotation*Math.PI/180,
      x = Math.cos(angle)*W2 - Math.sin(angle)*H2,
      y = Math.sin(angle)*W2 + Math.cos(angle)*H2,
      position = this.position,
      worldSize = Basemap.TILE_SIZE*Math.pow(2, this.zoom),
      nw = this.unproject(position.x - x, position.y - y, worldSize),
      se = this.unproject(position.x + x, position.y + y, worldSize);
    return {
      n: nw.latitude,
      w: nw.longitude,
      s: se.latitude,
      e: se.longitude
    };*/
    return null;
  },

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
      this.emit('change');
    }
    return this;
  },

  getZoom: function() {
    return this.zoom;
  },

  setPosition: function(pos) {
    this.position = {
      latitude:  clamp(parseFloat(pos.latitude), -90, 90),
      longitude: clamp(parseFloat(pos.longitude), -180, 180)
    };
    this.emit('change');
    return this;
  },

  getPosition: function() {
    return this.position;
  },

  setSize: function(size) {
    if (size.width !== this.width || size.height !== this.height) {
      this.width = size.width;
      this.height = size.height;
      this.emit('resize');
    }
    return this;
  },

  getSize: function() {
    return { width: this.width, height: this.height };
  },

  setRotation: function(rotation) {
    rotation = parseFloat(rotation)%360;
    if (this.rotation !== rotation) {
      this.rotation = rotation;
      this.emit('change');
    }
    return this;
  },

  getRotation: function() {
    return this.rotation;
  },

  setTilt: function(tilt) {
    tilt = clamp(parseFloat(tilt), 0, 45); // bigger max increases shadow moire on base map
    if (this.tilt !== tilt) {
      this.tilt = tilt;
      this.emit('change');
    }
    return this;
  },

  getTilt: function() {
    return this.tilt;
  },

  setBend: function(bend) {
    bend = clamp(parseFloat(bend), 0, 90);
    if (this.bend !== bend) {
      this.bend = bend;
      this.emit('change');
    }
    return this;
  },

  getBend: function() {
    return this.bend;
  },

  addLayer: function(layer) {
    this.layers.add(layer);
    this.updateAttribution();
    return this;
  },

  removeLayer: function(layer) {
    this.layers.remove(layer);
    this.updateAttribution();
  },

  destroy: function() {
    this.listeners = [];
    this.pointer.destroy();
    this.layers.destroy();
    this.container.innerHTML = '';
  }
};

//*****************************************************************************

global.GLMap = Basemap;
