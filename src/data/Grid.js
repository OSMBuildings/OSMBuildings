
data.Grid = {

  tiles: {},
  buffer: 1,

  init: function(src, options) {
    this.source = src;
    this.options = options || {};

    if (this.options.bounds) {
      this.fixedBounds = this.options.bounds;
    }

    this.fixedZoom = options.fixedZoom;

    this.minZoom = parseFloat(options.minZoom) || APP.minZoom;
    this.maxZoom = parseFloat(options.maxZoom) || APP.maxZoom;
    if (this.maxZoom < this.minZoom) {
      this.maxZoom = this.minZoom;
    }

    MAP.on('change', this._onChange = function() {
    this.update(250);
    }.bind(this));

    MAP.on('resize', this._onResize = this.update.bind(this));

    this.update();
  },

  // strategy: start loading in {delay} ms after movement ends, ignore any attempts until then
  update: function(delay) {
    if (MAP.zoom < this.minZoom || MAP.zoom > this.maxZoom) {
      return;
    }

    if (!delay) {
      this.loadTiles();
      return;
    }

    if (this.isDelayed) {
      clearTimeout(this.isDelayed);
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

    // TODO: use visibility trapezoid here
    var
      radius = 1500,
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
        this.tiles[key] = new data.Tile(tileX, tileY, bounds.zoom, this.options);
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
