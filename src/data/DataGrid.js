
var DataGrid = {};

(function() {

  var
    source,
    isDelayed,
    tiles = {},
    fixedZoom = 16;

  function update(delay) {
    updateTileBounds();

    if (!delay) {
      loadTiles();
      return;
    }

    if (!isDelayed) {
      isDelayed = setTimeout(function() {
        isDelayed = null;
        loadTiles();
      }, delay);
    }
  }

  // TODO: signal, if bbox changed => for loadTiles() + Tile.isVisible()
  function updateTileBounds() {
    var
      zoom = fixedZoom || Math.round(Map.zoom),
      bounds = Map.bounds,
      worldSize = TILE_SIZE <<zoom,
      min = project(bounds.n, bounds.w, worldSize),
      max = project(bounds.s, bounds.e, worldSize);

    DataGrid.bounds = {
      zoom: zoom,
      minX: min.x/TILE_SIZE <<0,
      minY: min.y/TILE_SIZE <<0,
      maxX: Math.ceil(max.x/TILE_SIZE),
      maxY: Math.ceil(max.y/TILE_SIZE)
    };
  }

  function loadTiles() {
    var
      bounds = DataGrid.bounds,
      tileX, tileY, zoom = bounds.zoom,
      key,
      queue = [], queueLength,
      tileAnchor = [
        bounds.minX + (bounds.maxX-bounds.minX-1)/2,
        bounds.maxY
      ];

    for (tileY = bounds.minY; tileY <= bounds.maxY; tileY++) {
      for (tileX = bounds.minX; tileX <= bounds.maxX; tileX++) {
        key = [tileX, tileY, zoom].join(',');
        if (tiles[key]) {
          continue;
        }
        tiles[key] = new DataTile(tileX, tileY, zoom);
        queue.push({ tile:tiles[key], dist:distance2([tileX, tileY], tileAnchor) });
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
      tile.load(getURL(tile.tileX, tile.tileY, tile.zoom));
    }

    purge();
  }

  function purge() {
    for (var key in tiles) {
      if (!tiles[key].isVisible(1)) { // testing with buffer of n tiles around viewport TODO: this is bad with fixedTileSIze
        Data.remove(tiles[key]);
        delete tiles[key];
      }
    }
  }

  function getURL(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(source, { s:s, x:x, y:y, z:z });
  }

  //***************************************************************************

  DataGrid.setSource = function(src, dataKey) {
    if (src === undefined || src === false || src === '') {
      src = DATA_SRC.replace('{k}', dataKey);
    }

    if (!src) {
      return;
    }

    source = src;

    Events.on('change', function() {
      update(100);
    });

    Events.on('resize', function() {
      update();
    });

    update();
  };

  DataGrid.destroy = function() {
    clearTimeout(isDelayed);
    for (var key in tiles) {
      tiles[key].destroy();
    }
    tiles = null;
  };

}());
