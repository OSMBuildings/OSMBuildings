
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
  
  getClosestTiles: function(tileList, referencePoint, maxNumTiles) {
    var tilesOut = [];

    tileList.sort( function(a, b) {
    
      // tile coordinates correspond to the tile's upper left corner, but for 
      // the distance computation we should rather use their center; hence the 0.5 offsets
      var distA = Math.pow(a[0] + 0.5 - referencePoint[0], 2.0) +
                  Math.pow(a[1] + 0.5 - referencePoint[1], 2.0);

      var distB = Math.pow(b[0] + 0.5 - referencePoint[0], 2.0) +
                  Math.pow(b[1] + 0.5 - referencePoint[1], 2.0);
      
      return distA > distB;
    });
    
    var prevX = -1;
    var prevY = -1;
    var numTiles = 0;
    
    for (var i = 0; i < tileList.length && numTiles < maxNumTiles; i++)
    {
      var tile = tileList[i];
      if (tile[0] == prevX && tile[1] == prevY) //remove duplicates
        continue;
      
      tilesOut.push(tile);
      numTiles += 1;
      prevX = tile[0];
      prevY = tile[1];
    }
    return tilesOut;

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
      i,
      viewQuad = render.getViewQuad(render.viewProjMatrix.data),
      mapCenterTile = [ long2tile(MAP.center.longitude, zoom),
                        lat2tile (MAP.center.latitude,  zoom)];

    for (i = 0; i < 4; i++) {
      viewQuad[i] = getTilePositionFromLocal(viewQuad[i], zoom);
    }

    /*
    tiles = [];
    var centerX = mapCenterTile[0] | 0;
    var centerY = mapCenterTile[1] | 0;
    
    for (var x = centerX - 3; x < centerX + 3; x++)
      for (var y = centerY - 3; y < centerY + 3; y++)
        tiles.push( [x, y] );*/

    var tiles = this.getClosestTiles(rasterConvexQuad(viewQuad), 
                                     mapCenterTile, 
                                     MAX_TILES_PER_GRID);
                                       
    this.visibleTiles = {};
    for (i = 0; i < tiles.length; i++) {
      this.visibleTiles[ tiles[i] ] = true;
    }
    
    for (var key in this.visibleTiles) {
      tile = key.split(',');
      tileX = parseInt(tile[0]);
      tileY = parseInt(tile[1]);
      if (this.tiles[key]) {
        continue;
      }

      this.tiles[key] = new this.tileClass(tileX, tileY, zoom, this.tileOptions, this.tiles);

      queue.push({ tile:this.tiles[key], dist:distance2([tileX, tileY], mapCenterTile) });
    }
    
    //console.log("%s tiles at zoom level %s", tiles.length, zoom);

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
