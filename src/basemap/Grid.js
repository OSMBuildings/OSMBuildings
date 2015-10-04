
basemap.Grid = function(src, options) {
  this.source = src;
  this.options = options || {};

  this.buffer = this.options.buffer || 1;
  this.tiles = {};

  MAP.on('change', function() {
    this.update(2000);
  }.bind(this));

  MAP.on('resize', this.update.bind(this));

  this.update();
};

basemap.Grid.prototype = {

  // strategy: start loading after {delay}ms, skip any attempts until then
  // effectively loads in intervals during movement
  update: function(delay) {
    if (MAP.zoom < MIN_ZOOM || MAP.zoom > MAX_ZOOM) {
      return;
    }

    if (!delay) {
      this.loadTiles();
      return;
    }

    if (this.isDelayed) {
      return;
    }

    this.isDelayed = setTimeout(function() {
      this.isDelayed = null;
      this.loadTiles();
    }.bind(this), delay);
  },

  updateBounds: function() {
    var
      zoom = Math.round(MAP.zoom),
      radius = 1500, // render.SkyDome.radius,
      ratio = Math.pow(2, zoom-MAP.zoom)/GLMap.TILE_SIZE,
      mapCenter = MAP.center;

    this.bounds = {
      zoom: zoom,
      minX: ((mapCenter.x-radius)*ratio <<0),
      minY: ((mapCenter.y-radius)*ratio <<0),
      maxX: Math.ceil((mapCenter.x+radius)*ratio),
      maxY: Math.ceil((mapCenter.y+radius)*ratio),
    };
  },

  getURL: function(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(this.source, { s:s, x:x, y:y, z:z });
  },

  loadTiles: function() {
    this.updateBounds();

    var
      tileX, tileY,
      key,
      queue = [], queueLength,
      bounds = this.bounds,
      tileAnchor = [
        MAP.center.x/GLMap.TILE_SIZE <<0,
        MAP.center.y/GLMap.TILE_SIZE <<0
      ];

    for (tileY = bounds.minY; tileY < bounds.maxY; tileY++) {
      for (tileX = bounds.minX; tileX < bounds.maxX; tileX++) {
        key = [tileX, tileY, bounds.zoom].join(',');
        if (this.tiles[key]) {
          continue;
        }
        this.tiles[key] = new basemap.Tile(tileX, tileY, bounds.zoom);
        // TODO: rotate anchor point
        queue.push({ tile:this.tiles[key], dist:distance2([tileX, tileY], tileAnchor) });
      }
    }

    if (!(queueLength = queue.length)) {
      return;
    }

    queue.sort(function(a, b) {
      return a.dist-b.dist;
    });

    var tile;
    for (var i = 0; i < queueLength; i++) {
      tile = queue[i].tile;
      tile.load(this.getURL(tile.x, tile.y, tile.zoom));
    }

    this.purge();
  },

  purge: function() {
    for (var key in this.tiles) {
      if (!this.tiles[key].isVisible(this.bounds, this.buffer)) {
        this.tiles[key].destroy();
        delete this.tiles[key];
      }
    }
  },

  destroy: function() {
    clearTimeout(this.isDelayed);
    for (var key in this.tiles) {
      this.tiles[key].destroy();
    }
    this.tiles = null;
  }
};
