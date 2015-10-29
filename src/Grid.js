
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

  /* Returns the set of tiles (as dictionary keys) that overlap in any way with
   * the quadrilateral 'quad'. The returned set may contain false-positives,
   * i.e. tiles that are slightly outside the viewing frustum.
   *
   * The basic approach is to determine the axis-aligned bounding box of the
   * quad, and for each tile in the bounding box determine whether its center
   * lies inside the quad (or rather in one of the two triangles making up the
   * quad) via a point-in-triangle test.
   * This approach however misses some boundary cases:
   * - for tiles on the edge of the screen, parts of the tile may be visible
   *   without its center being visible. Our test misses these cases. We
   *   compensate by adding not only the tile itself but also all horizontal,
   *   vertical and diagonal neighbors to the result set
   * - if the quad is small compared to the tile size then no tile center may
   *   be inside the quad (e.g. when the whole screen is covered by the lower
   *   third of a single tile) and thus the result set would be empty. We
   *   compensate by adding the tiles of all four quad vertices to the result
   *   set in any case.
   * Note: while the set of tiles added through those edge cases may seem
   *       excessive, it is actually rather small: It does add an one tile wide
   *       outline to the result set. But other than that, is only caused tiles
   *       to be added multiple times, and those duplicates are removed
   *       automatically since the result is a set.
   */
  getTilesInQuad: function(quad, zoom) {
    var minX =          (Math.min(quad[0][0], quad[1][0], quad[2][0], quad[3][0])) <<0;
    var maxX = Math.ceil(Math.max(quad[0][0], quad[1][0], quad[2][0], quad[3][0]));

    var minY =          (Math.min(quad[0][1], quad[1][1], quad[2][1], quad[3][1])) <<0;
    var maxY = Math.ceil(Math.max(quad[0][1], quad[1][1], quad[2][1], quad[3][1]));

    var tiles = {};
    tiles[[quad[0][0]<<0, quad[0][1]<<0, zoom]] = true;
    tiles[[quad[1][0]<<0, quad[1][1]<<0, zoom]] = true;
    tiles[[quad[2][0]<<0, quad[2][1]<<0, zoom]] = true;
    tiles[[quad[3][0]<<0, quad[3][1]<<0, zoom]] = true;

    for (var x = minX; x <= maxX; x++) {
      for (var y = minY; y <= maxY; y++) {
        if (isPointInTriangle(quad[0], quad[1], quad[2], [x + 0.5, y + 0.5]) ||
          isPointInTriangle(quad[0], quad[2], quad[3], [x + 0.5, y + 0.5])) {
          tiles[[x - 1, y - 1, zoom]] = true;
          tiles[[x,     y - 1, zoom]] = true;
          tiles[[x + 1, y - 1, zoom]] = true;
          tiles[[x - 1, y,     zoom]] = true;
          tiles[[x,     y,     zoom]] = true;
          tiles[[x + 1, y,     zoom]] = true;
          tiles[[x - 1, y + 1, zoom]] = true;
          tiles[[x,     y + 1, zoom]] = true;
          tiles[[x + 1, y + 1, zoom]] = true;
        }
      }
    }
    return tiles;
  },

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
      ];
      
    var viewQuad = render.getViewQuad(render.viewProjMatrix.data);
    for (var i = 0; i < 4; i++)
      viewQuad[i] = asTilePosition(viewQuad[i], zoom);
    
    
    this.visibleTiles = this.getTilesInQuad(viewQuad, zoom);

    for (var key in this.visibleTiles) {
      tile = key.split(',');
      tileX = tile[0];
      tileY = tile[1];

      if (this.tiles[key]) {
        continue;
      }

      tile = this.tiles[key] = new this.tileClass(tileX, tileY, zoom, this.tileOptions, this.tiles);

      // TODO: rotate anchor point
      queue.push({ tile:this.tiles[key], dist:distance2([tileX, tileY], tileAnchor) });
    }

    this.purge();

    queue.sort(function(a, b) {
      return a.dist-b.dist;
    });

    for (var i = 0; i < queue.length; i++) {
      tile = queue[i].tile;
      tile.load(this.getURL(tile.x, tile.y, tile.zoom));
    }

  },

  purge: function() {
    var
      zoom = Math.round(MAP.zoom),
      tile, parent, children;

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
