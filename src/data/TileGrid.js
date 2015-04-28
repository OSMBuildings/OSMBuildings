
function TileGrid(url, options) {
  this._url = url;

  options = options || {};
  this._tileSize  = options.tileSize || TILE_SIZE;

  this._tiles = {};

  this._shader = new Shader('tileplane');
}

OSMBuildings.TileLayer = TileGrid;

TileGrid.prototype = {

  _updateTileBounds: function() {
    var
      bounds = Map.bounds,
      tileSize = this._tileSize,
      zoom = this._zoom = Math.round(this._map.getZoom()),
      worldSize = tileSize <<zoom,
      min = project(bounds.n, bounds.w, worldSize),
      max = project(bounds.s, bounds.e, worldSize);

    this.bounds = {
      zoom: zoom,
      minX: min.x/tileSize <<0,
      minY: min.y/tileSize <<0,
      maxX: Math.ceil(max.x/tileSize),
      maxY: Math.ceil(max.y/tileSize)
    };
  },

  _loadTiles: function() {
    var
      tileBounds = this.bounds,
      zoom = this._zoom,
      tiles = this._tiles,
      x, y, key,
      queue = [], queueLength;

    var tileAnchor = [
      tileBounds.minX + (tileBounds.maxX-tileBounds.minX-1)/2,
      tileBounds.maxY
    ];

    for (y = tileBounds.minY; y < tileBounds.maxY; y++) {
      for (x = tileBounds.minX; x < tileBounds.maxX; x++) {
        key = [x, y, zoom].join(',');
        if (tiles[key]) {
          continue;
        }
        tiles[key] = new MapTile(this, x, y, zoom);
        queue.push({ tile:tiles[key], dist:distance2([x, y], tileAnchor) });
      }
    }

    if (!(queueLength = queue.length)) {
      return;
    }

    queue.sort(function(a, b) {
      return a.dist-b.dist;
    });

    for (var i = 0; i < queueLength; i++) {
      queue[i].tile.load(this._getURL(queue[i].tile.tileX, queue[i].tile.tileY, queue[i].tile.zoom));
    }

    this._purge();
  },

  _getURL: function(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(this._url, { s:s, x:x, y:y, z:z });
  },

  _purge: function() {
    var
      key,
      tiles = this._tiles;
    for (key in tiles) {
      if (!tiles[key].isVisible(1)) {
        tiles[key].destroy();
        delete tiles[key];
      }
    }
  },

  addTo: function(map) {
    this._map = map;

    map.addLayer(this);

    this._updateTileBounds();
    this.update();

    map.on('change', function() {
      this._updateTileBounds();
      this.update(100);
    }.bind(this));

    map.on('resize', function() {
      this._updateTileBounds();
      this.update();
    }.bind(this));
  },

  remove: function() {
    this._map.remove(this);
    this._map = null;
  },

  update: function(delay) {
    if (!delay) {
      this._loadTiles();
      return;
    }

    if (!this._isWaiting) {
      this._isWaiting = setTimeout(function() {
        this._isWaiting = null;
        this._loadTiles();
      }.bind(this), delay);
    }
  },

  // TODO: try to use tiles from other zoom levels when some are missing
  render: function(projection) {
    var program = this._shader.use();
    var tiles = this._tiles;
    for (var key in tiles) {
      tiles[key].render(program, projection, this._map);
    }
    program.end();
  },

  destroy: function() {
    clearTimeout(this._isWaiting);

    for (var key in this._tiles) {
      this._tiles[key].destroy();
    }
    this._tiles = null;
  }
};
