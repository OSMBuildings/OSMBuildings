
var Grid = function(source, tileClass, options) {
  this.tiles = {};
  this.buffer = 1;

  this.source = source;
  this.tileClass = tileClass;
  options = options || {};

  this.bounds = options.bounds;
  this.fixedZoom = options.fixedZoom;

  this.tileOptions = { color:options.color, fadeIn:options.fadeIn };

  this.minZoom = parseFloat(options.minZoom) || APP.minZoom;
  this.maxZoom = parseFloat(options.maxZoom) || APP.maxZoom;
  if (this.maxZoom < this.minZoom) {
    this.maxZoom = this.minZoom;
  }

  APP.on('change', this._onChange = function() {
    this.update(500);
  }.bind(this));

  APP.on('resize', this._onResize = this.update.bind(this));

  this.update();
};

Grid.prototype = {

  // strategy: start loading after {delay}ms, skip any attempts until then
  // effectively loads in intervals during movement
  update: function(delay) {
    if (APP.zoom < this.minZoom || APP.zoom > this.maxZoom) {
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
  
  getClosestTiles: function(tileList, referencePoint) {
    tileList.sort(function(a, b) {
      // tile coordinates correspond to the tile's upper left corner, but for
      // the distance computation we should rather use their center; hence the 0.5 offsets
      var distA = Math.pow(a[0] + 0.5 - referencePoint[0], 2.0) +
                  Math.pow(a[1] + 0.5 - referencePoint[1], 2.0);

      var distB = Math.pow(b[0] + 0.5 - referencePoint[0], 2.0) +
                  Math.pow(b[1] + 0.5 - referencePoint[1], 2.0);
      
      return distA > distB;
    });

    var prevX, prevY;

    // removes duplicates
    return tileList.filter(function(tile) {
      if (tile[0] === prevX && tile[1] === prevY) {
        return false;
      }
      prevX = tile[0];
      prevY = tile[1];
      return true;
    });
  },
  
  /* Returns a set of tiles based on 'tiles' (at zoom level 'zoom'),
   * but with those tiles recursively replaced by their respective parent tile
   * (tile from zoom level 'zoom'-1 that contains 'tile') for which said parent
   * tile covers less than 'pixelAreaThreshold' pixels on screen based on the 
   * current view-projection matrix.
   *
   * The returned tile set is duplicate-free even if there were duplicates in
   * 'tiles' and even if multiple tiles from 'tiles' got replaced by the same parent.
   */
  mergeTiles: function(tiles, zoom, pixelAreaThreshold) {
    var parentTiles = {};
    var tileSet = {};
    var tileList = [];
    var key;
    
    //if there is no parent zoom level
    if (zoom === 0 || zoom <= this.minZoom) {
      for (key in tiles) {
        tiles[key][2] = zoom;
      }
      return tiles;
    }
    
    for (key in tiles) {
      var tile = tiles[key];

      var parentX = (tile[0] <<0) / 2;
      var parentY = (tile[1] <<0) / 2;
      
      if (parentTiles[ [parentX, parentY] ] === undefined) { //parent tile screen size unknown
        var numParentScreenPixels = getTileSizeOnScreen(parentX, parentY, zoom-1, render.viewProjMatrix);
        parentTiles[ [parentX, parentY] ] = (numParentScreenPixels < pixelAreaThreshold);
      }
      
      if (! parentTiles[ [parentX, parentY] ]) { //won't be replaced by a parent tile -->keep
        if (tileSet[ [tile[0], tile[1]] ] === undefined) {  //remove duplicates
          tileSet[ [tile[0], tile[1]]] = true;
          tileList.push( [tile[0], tile[1], zoom]);
        }
      }
    }
    
    var parentTileList = [];
    
    for (key in parentTiles) {
      if (parentTiles[key]) {
        var parentTile = key.split(',');
        parentTileList.push( [parseInt(parentTile[0]), parseInt(parentTile[1]), zoom-1]);
      }
    }
    
    if (parentTileList.length > 0) {
      parentTileList = this.mergeTiles(parentTileList, zoom - 1, pixelAreaThreshold);
    }
      
    return tileList.concat(parentTileList);
  },

  loadTiles: function() {
    var zoom = Math.round(this.fixedZoom || APP.zoom);

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
      tile, tileX, tileY, tileZoom,
      queue = [],
      i,
      viewQuad = render.getViewQuad(render.viewProjMatrix.data),
      mapCenterTile = [ long2tile(APP.position.longitude, zoom),
                        lat2tile (APP.position.latitude,  zoom)];

    for (i = 0; i < 4; i++) {
      viewQuad[i] = getTilePositionFromLocal(viewQuad[i], zoom);
    }

    var tiles = rasterConvexQuad(viewQuad);
    tiles = ( this.fixedZoom ) ?
      this.getClosestTiles(tiles, mapCenterTile) :
      this.mergeTiles(tiles, zoom, 0.5 * TILE_SIZE * TILE_SIZE);
    
    this.visibleTiles = {};
    for (i = 0; i < tiles.length; i++) {
      if (tiles[i][2] === undefined) {
        tiles[i][2] = zoom;
      }
      this.visibleTiles[ tiles[i] ] = true;
    }

    for (var key in this.visibleTiles) {
      tile = key.split(',');
      tileX = parseInt(tile[0]);
      tileY = parseInt(tile[1]);
      tileZoom = parseInt(tile[2]);

      if (this.tiles[key]) {
        continue;
      }

      this.tiles[key] = new this.tileClass(tileX, tileY, tileZoom, this.tileOptions, this.tiles);

      queue.push({ tile:this.tiles[key], dist:distance2([tileX, tileY], mapCenterTile) });
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
      zoom = Math.round(APP.zoom),
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
    APP.off('change', this._onChange);
    APP.off('resize', this._onResize);

    clearTimeout(this.debounce);
    for (var key in this.tiles) {
      this.tiles[key].destroy();
    }
    this.tiles = [];
    this.visibleTiles = {};
  }
};
