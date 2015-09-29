
var DataGrid = function(src, options) {
  this.options = options || {};

  this.tiles = {};
  this.fixedZoom = 16;

  if (src === undefined || src === false || src === '') {
    src = DATA_SRC.replace('{k}', options.dataKey || DATA_KEY);
  }

  this.source = src;

  MAP.on('change', function() {
    this.update(2000);
  }.bind(this));

  MAP.on('resize', this.update.bind(this));

  this.update();
};

DataGrid.prototype = {

  // strategy: start loading in {delay} ms after movement ends, ignore any attempts until then

  update: function(delay) {
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

  updateTileBounds: function() {
    this.zoom = Math.round(this.fixedZoom || MAP.zoom);

    var
      radius = 1500, // SkyDome.radius,
      ratio = Math.pow(2, this.zoom-MAP.zoom)/TILE_SIZE,
      mapCenter = MAP.center;

    this.minX = ((mapCenter.x-radius)*ratio <<0);
    this.minY = ((mapCenter.y-radius)*ratio <<0);
    this.maxX = Math.ceil((mapCenter.x+radius)*ratio);
    this.maxY = Math.ceil((mapCenter.y+radius)*ratio);
  },

  loadTiles: function() {
    if (MAP.zoom < MIN_ZOOM) {
      return;
    }

    this.updateTileBounds();

    var
      tileX, tileY,
      key,
      queue = [], queueLength,
      tileAnchor = [
        MAP.center.x/TILE_SIZE <<0,
        MAP.center.y/TILE_SIZE <<0
      ];

    for (tileY = this.minY; tileY < this.maxY; tileY++) {
      for (tileX = this.minX; tileX < this.maxX; tileX++) {
        key = [tileX, tileY, this.zoom].join(',');
        if (this.tiles[key]) {
          continue;
        }
        this.tiles[key] = new DataTile(tileX, tileY, this.zoom, this.options);
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
      tile.load(this.getURL(tile.tileX, tile.tileY, tile.zoom));
    }

    this.purge();
  },

  purge: function() {
    for (var key in this.tiles) {
      if (!this.isVisible(this.tiles[key], 1)) { // testing with buffer of n tiles around viewport TODO: this is bad with fixedTileSIze
        this.tiles[key].destroy();
        delete this.tiles[key];
      }
    }
  },

  isVisible: function(tile, buffer) {
    buffer = buffer || 0;

    var
      tileX = tile.tileX,
      tileY = tile.tileY;

    return (tile.zoom === this.zoom &&
      // TODO: factor in tile origin
    (tileX >= this.minX-buffer && tileX <= this.maxX+buffer && tileY >= this.minY-buffer && tileY <= this.maxY+buffer));
  },

  getURL: function(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(this.source, { s:s, x:x, y:y, z:z });
  },

  destroy: function() {
    clearTimeout(this.isDelayed);
    for (var key in this.tiles) {
      this.tiles[key].destroy();
    }
    this.tiles = null;
  }
};
