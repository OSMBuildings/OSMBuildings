
basemap.Grid = {

  tiles: {},
  buffer: 1, // TODO: buffer is a bad idea with fixed fixedZoom

  init: function(src, options) {
    this.source = src;
    this.options = options || {};

    if (this.options.bounds) {
      this.fixedBounds = this.options.bounds;
    }

    MAP.on('change', this._onChange = function() {
      this.update(1000);
    }.bind(this));

    MAP.on('resize', this._onResize = this.update.bind(this));

    this.update();
  },

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
    var zoom = Math.round(this.fixedZoom || MAP.zoom);

    if (this.fixedBounds) {
      var
        min = project(this.fixedBounds.s, this.fixedBounds.w, 1<<zoom),
        max = project(this.fixedBounds.n, this.fixedBounds.e, 1<<zoom);

      this.bounds = {
        zoom: zoom,
        minX: (min.x <<0) - this.buffer,
        minY: (min.y <<0) - this.buffer,
        maxX: (max.x <<0) + this.buffer,
        maxY: (max.y <<0) + this.buffer
      };

      return;
    }

    var
      radius = 1500, // render.SkyDome.radius,
      ratio = Math.pow(2, zoom-MAP.zoom)/TILE_SIZE,
      mapCenter = MAP.center;

    this.bounds = {
      zoom: zoom,
      minX: ((mapCenter.x-radius)*ratio <<0) - this.buffer,
      minY: ((mapCenter.y-radius)*ratio <<0) - this.buffer,
      maxX: Math.ceil((mapCenter.x+radius)*ratio) + this.buffer,
      maxY: Math.ceil((mapCenter.y+radius)*ratio) + this.buffer
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
        MAP.center.x/TILE_SIZE <<0,
        MAP.center.y/TILE_SIZE <<0
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
      if (!this.tiles[key].isVisible(this.bounds)) {
        this.tiles[key].destroy();
        delete this.tiles[key];
      }
    }
  },

  destroy: function() {
    MAP.off('change', this._onChange);
    MAP.off('resize', this._onResize);

    clearTimeout(this.isDelayed);
    for (var key in this.tiles) {
      this.tiles[key].destroy();
    }
    this.tiles = [];
  }
};
