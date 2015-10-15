
var Grid = function(source, tileClass, options) {
  this.tiles = {};
  this.buffer = 1;

  this.source = source;
  this.tileClass = tileClass;
  options = options || {};

  this.bounds = options.bounds;
  this.fixedZoom = options.fixedZoom;

  this.tileOptions = { color:options.color };

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
};

Grid.prototype = {

  // strategy: start loading after {delay}ms, skip any attempts until then
  // effectively loads in intervals during movement
  update: function(delay) {
    if (MAP.zoom < this.minZoom || MAP.zoom > this.maxZoom) {
      return;
    }

    if (!delay) {
      this.loadTiles();
      return;
    }

    if (!this.debounce) {
      this.debounce = setTimeout(function() {
        this.debounce = null;
        this.loadTiles();
      }.bind(this), delay);
    }
  },

  getURL: function(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(this.source, { s:s, x:x, y:y, z:z });
  },

  loadTiles: function() {
    var zoom = Math.round(this.fixedZoom || MAP.zoom);

    // TODO: if there are udser defined bounds for this layer, respect these too
    //  if (this.fixedBounds) {
    //    var
    //      min = project(this.bounds.s, this.bounds.w, 1<<zoom),
    //      max = project(this.bounds.n, this.bounds.e, 1<<zoom);
    //
    //    var bounds = {
    //      zoom: zoom,
    //      minX: (min.x <<0) - this.buffer,
    //      minY: (min.y <<0) - this.buffer,
    //      maxX: (max.x <<0) + this.buffer,
    //      maxY: (max.y <<0) + this.buffer
    //    };
    //  }

    var
      tile, tileX, tileY,
      key,
      queue = [], queueLength,
      tileAnchor = [
        MAP.center.x/TILE_SIZE <<0,
        MAP.center.y/TILE_SIZE <<0
      ];
      
    var viewQuad = render.getViewQuad(render.viewProjMatrix.data, zoom);
    var tilesToLoad = render.getTilesInQuad(viewQuad);

    this.visibleTiles = {};
    for (var t in tilesToLoad) {
      tile = t.split(',');
      tileX = tile[0];
      tileY = tile[1];
      key = [tileX, tileY, zoom].join(',');
      this.visibleTiles[key] = true;

      if (this.tiles[key]) {
        continue;
      }

      this.tiles[key] = new this.tileClass(tileX, tileY, zoom, this.tileOptions);
      // TODO: rotate anchor point
      queue.push({ tile:this.tiles[key], dist:distance2([tileX, tileY], tileAnchor) });
    }

    //console.log(this.visibleTiles);
    if (!(queueLength = queue.length)) {
      return;
    }

    queue.sort(function(a, b) {
      return a.dist-b.dist;
    });

    for (var i = 0; i < queueLength; i++) {
      tile = queue[i].tile;
      tile.load(this.getURL(tile.x, tile.y, tile.zoom));
    }

    this.purge();
  },

  purge: function() {
    var tile;
    for (var key in this.tiles) {
      tile = key.split(',');
      if (!this.visibleTiles[key]) {
        //console.log("purging '%s %s'", this.source, key);
        this.tiles[key].destroy();
        delete this.tiles[key];
      }
    }
  },

  destroy: function() {
    MAP.off('change', this._onChange);
    MAP.off('resize', this._onResize);

    clearTimeout(this.debounce);
    for (var key in this.tiles) {
      this.tiles[key].destroy();
    }
    this.tiles = [];
  }
};
