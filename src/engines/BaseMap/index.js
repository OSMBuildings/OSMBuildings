
var document = global.document;

function clamp(value, min, max) {
  return Math.min(max, Math.max(value, min));
}

var BaseMap = function(container, options) {
  this.container = typeof container === 'string' ? document.getElementById(container) : container;
  options = options || {};

  this.container.classList.add('glmap-container');
  this.width = this.container.offsetWidth;
  this.height = this.container.offsetHeight;

  this.minZoom = parseFloat(options.minZoom) || 10;
  this.maxZoom = parseFloat(options.maxZoom) || 20;

  if (this.maxZoom < this.minZoom) {
    this.maxZoom = this.minZoom;
  }

  this.center = { x:0, y:0 };
  this.zoom = 0;

  this.listeners = {};

  this.restoreState(options);

  if (options.state) {
    this.persistState();
    this.on('change', function() {
      this.persistState();
    }.bind(this));
  }

  this.interaction = new Interaction(this, this.container);
  this.layers      = new Layers(this);

  if (options.disabled) {
    this.setDisabled(true);
  }

  this.attribution = options.attribution;
  this.attributionDiv = document.createElement('DIV');
  this.attributionDiv.className = 'glmap-attribution';
  this.container.appendChild(this.attributionDiv);
  this.updateAttribution();
};

BaseMap.TILE_SIZE = 256;

BaseMap.prototype = {

  updateAttribution: function() {
    var attribution = this.layers.getAttribution();
    if (this.attribution) {
      attribution.unshift(this.attribution);
    }
    this.attributionDiv.innerHTML = attribution.join(' &middot; ');
  },

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

    var bend;
    if (state.bend !== undefined) {
      bend = parseFloat(state.bend);
    }
    this.setBend(bend || options.bend || 0);
  },

  persistState: function() {
    if (!history.replaceState) {
      return;
    }

    if (this.stateDebounce) {
      return;
    }

    this.stateDebounce = setTimeout(function() {
      this.stateDebounce = null;
      var params = [];
      params.push('lat=' + this.position.latitude.toFixed(5));
      params.push('lon=' + this.position.longitude.toFixed(5));
      params.push('zoom=' + this.zoom.toFixed(1));
      params.push('tilt=' + this.tilt.toFixed(1));
      params.push('bend=' + this.bend.toFixed(1));
      params.push('rotation=' + this.rotation.toFixed(1));
      history.replaceState({}, '', '?'+ params.join('&'));
    }.bind(this), 1000);
  },

  setCenter: function(center) {
    if (this.center.x !== center.x || this.center.y !== center.y) {
      this.center = center;
      this.position = this.unproject(center.x, center.y, BaseMap.TILE_SIZE*Math.pow(2, this.zoom));
      this.emit('change');
    }
  },

  emit: function(type, payload) {
    if (!this.listeners[type]) {
      return;
    }

    var listeners = this.listeners[type];

    if (listeners.timer) {
      return;
    }

    listeners.timer = setTimeout(function() {
      for (var i = 0, il = listeners.fn.length; i < il; i++) {
        listeners.fn[i](payload);
      }
      listeners.timer = null;
    }.bind(this), 17);
  },

  //***************************************************************************

  on: function(type, fn) {
    if (!this.listeners[type]) {
      this.listeners[type] = { fn:[] };
    }
    this.listeners[type].fn.push(fn);
    return this;
  },

  off: function(type, fn) {},

  setDisabled: function(flag) {
    this.interaction.disabled = !!flag;
    return this;
  },

  isDisabled: function() {
    return !!this.interaction.disabled;
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
      W2 = this.width/2, H2 = this.height/2,
      angle = this.rotation*Math.PI/180,
      x = Math.cos(angle)*W2 - Math.sin(angle)*H2,
      y = Math.sin(angle)*W2 + Math.cos(angle)*H2,
      center = this.center,
      worldSize = BaseMap.TILE_SIZE*Math.pow(2, this.zoom),
      nw = this.unproject(center.x - x, center.y - y, worldSize),
      se = this.unproject(center.x + x, center.y + y, worldSize);
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
    return this;
  },

  getZoom: function() {
    return this.zoom;
  },

  setPosition: function(pos) {
    var
      latitude  = clamp(parseFloat(pos.latitude), -90, 90),
      longitude = clamp(parseFloat(pos.longitude), -180, 180),
      center = this.project(latitude, longitude, BaseMap.TILE_SIZE*Math.pow(2, this.zoom));
    this.setCenter(center);
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
    tilt = clamp(parseFloat(tilt), 0, 60);
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
    this.listeners = null;
    this.interaction.destroy();
    this.layers.destroy();
  }
};

//*****************************************************************************

if (typeof global.define === 'function') {
  global.define([], BaseMap);
} else if (typeof global.exports === 'object') {
  global.module.exports = BaseMap;
} else {
  global.BaseMap = BaseMap;
}
