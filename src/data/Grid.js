
var Grid = function(url, options) {
  this.url = url;

  options = options || {};
  this.tileSize  = options.tileSize || 256;
  this.fixedZoom = options.fixedZoom;

  this.tiles = {};
  this.loading = {};
};

Grid.prototype = {

  updateTileBounds: function() {
    var
      bounds = Map.bounds,
      tileSize = this.tileSize,
      zoom = this.zoom = this.fixedZoom || Math.round(Map.zoom),
      worldSize = tileSize <<zoom,
      min = project(bounds.n, bounds.w, worldSize),
      max = project(bounds.s, bounds.e, worldSize);

    this.tileBounds = {
      minX: min.x/tileSize <<0,
      minY: min.y/tileSize <<0,
      maxX: Math.ceil(max.x/tileSize),
      maxY: Math.ceil(max.y/tileSize)
    };
  },

  update: function(delay) {
    if (!delay) {
      this.loadTiles();
      return;
    }

    if (!this.isWaiting) {
      this.isWaiting = setTimeout(function() {
        this.isWaiting = null;
        this.loadTiles();
      }.bind(this), delay);
    }
  },

  loadTiles: function() {
    var
      tileBounds = this.tileBounds,
      zoom = this.zoom,
      tiles = this.tiles,
      loading = this.loading,
      x, y, key,
      queue = [], queueLength;

    for (y = tileBounds.minY; y <= tileBounds.maxY; y++) {
      for (x = tileBounds.minX; x <= tileBounds.maxX; x++) {
        key = [x, y, zoom].join(',');
        if (tiles[key] || loading[key]) {
          continue;
        }
        queue.push({ x:x, y:y, z:zoom });
      }
    }

    if (!(queueLength = queue.length)) {
      return;
    }

    // TODO: currently viewport center but could be aligned to be camera pos
    var tileAnchor = {
      x:tileBounds.minX + (tileBounds.maxX-tileBounds.minX-1)/2,
      y:tileBounds.minY + (tileBounds.maxY-tileBounds.minY-1)/2
    };

    queue.sort(function(b, a) {
      return distance2(a, tileAnchor) - distance2(b, tileAnchor);
    });

    for (var i = 0; i < queueLength; i++) {
      this.loadTile(queue[i].x, queue[i].y, queue[i].z);
    }

    this.purge();
  },

  getURL: function(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(this.url, { s:s, x:x, y:y, z:z });
  },

  loadTile: function(x, y, z) {
    var key = [x, y, z].join(',');
    this.loading[key] = XHR.loadJSON(this.getURL(x, y, z), function(data) {
      delete this.loading[key];
      this.tiles[key] = new Tile(x, y, z, data);
    }.bind(this));
  },

  purge: function() {
    var
      key,
      tiles = this.tiles,
      loading = this.loading;

    for (key in tiles) {
      if (!this.isVisible(key, 2)) {
        tiles[key].destroy();
        delete tiles[key];
      }
    }

    for (key in loading) {
      if (!this.isVisible(key)) {
        loading[key].abort();
        delete loading[key];
      }
    }
  },

  // TODO: maybe make isVisible() a Tile method. Then create the tile early in order to profit in loading()
  isVisible: function(key, buffer) {
    buffer = buffer || 0;

    var
      tileSize = this.tileSize,
      tileBounds = this.tileBounds,
      xyz = key.split(','),
      x = parseInt(xyz[0], 10), y = parseInt(xyz[1], 10), z = parseInt(xyz[2], 10);

    if (z !== this.zoom) {
      return false;
    }

    return (x >= tileBounds.minX-buffer-tileSize && x <= tileBounds.maxX+buffer && y >= tileBounds.minY-buffer-tileSize && y <= tileBounds.maxY+buffer);
  },

  getVisibleItems: function() {
    var
      tiles = this.tiles,
      key,
      items = [];

    for (key in tiles) {
      if (this.isVisible(key)) {
        items.push(tiles[key]);
      }
    }

    return items;
  },

  destroy: function() {
    clearTimeout(this.isWaiting);

    for (var key in this.tiles) {
      this.tiles[key].destroy();
    }
    this.tiles = null;

    for (key in this.loading) {
      this.loading[key].abort();
    }
    this.loading = null;
  }
};
