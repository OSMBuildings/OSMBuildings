
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
    this.update(500);
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

    // TODO: if there are user defined bounds for this layer, respect these too
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
      queue = [],
      tileAnchor = [
        MAP.center.x/TILE_SIZE <<0,
        MAP.center.y/TILE_SIZE <<0
      ],
      i,
      viewQuad = render.getViewQuad(render.viewProjMatrix.data);

    for (i = 0; i < 4; i++) {
      viewQuad[i] = asTilePosition(viewQuad[i], zoom);
    }

    var tmp = rasterConvexQuad(viewQuad);

    this.visibleTiles = {};
    for (i = 0; i < tmp.length; i++)
      this.visibleTiles[ [tmp[i][0], tmp[i][1], zoom] ] = true;

    /*var s = "";

    var numTiles = 0;
    for (var i in this.visibleTiles) {
      numTiles += 1;
      s += i + "\n";
    }
    
    if (zoom == 15) {
      console.log( "%s tiles for zoom %s: ", numTiles, zoom);
      //console.log( s);
    }*/
    
    for (var key in this.visibleTiles) {
      tile = key.split(',');
      tileX = tile[0];
      tileY = tile[1];

      if (this.tiles[key]) {
        continue;
      }

      tile = this.tiles[key] = new this.tileClass(tileX, tileY, zoom, this.tileOptions, this.tiles);

      queue.push({ tile:this.tiles[key], dist:distance2([tileX, tileY], tileAnchor) });
    }

    this.purge();

    queue.sort(function(a, b) {
      return a.dist-b.dist;
    });

    for (i = 0; i < queue.length; i++) {
      tile = queue[i].tile;
      tile.load(this.getURL(tile.x, tile.y, tile.zoom));
    }
  },

  purge: function() {
    var
      zoom = Math.round(MAP.zoom),
      tile, parent;

    for (var key in this.tiles) {
      tile = this.tiles[key];
      // tile is visible: keep
      if (this.visibleTiles[key]) {
        continue;
      }

      // tile is not visible and due to fixedZoom there are no alternate zoom levels: drop
      if (this.fixedZoom) {
        this.tiles[key].destroy();
        delete this.tiles[key];
        continue;
      }

      // tile's parent would be visible: keep
      if (tile.zoom === zoom+1) {
        parent = [tile.x/2<<0, tile.y/2<<0, zoom].join(',');
        if (this.visibleTiles[parent]) {
          continue;
        }
      }

      // any of tile's children would be visible: keep
      if (tile.zoom === zoom-1) {
        if (this.visibleTiles[[tile.x*2, tile.y*2, zoom].join(',')] ||
          this.visibleTiles[[tile.x*2 + 1, tile.y*2, zoom].join(',')] ||
          this.visibleTiles[[tile.x*2, tile.y*2 + 1, zoom].join(',')] ||
          this.visibleTiles[[tile.x*2 + 1, tile.y*2 + 1, zoom].join(',')]) {
          continue;
        }
      }

      // drop anything else
      delete this.tiles[key];
      continue;
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
