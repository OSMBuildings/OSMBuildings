
var TileGrid = {};

(function() {

  var
    source,
    tiles = {},
    isDelayed;

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
      zoom = Math.round(Map.zoom),
      ratio = Math.pow(2, zoom-Map.zoom)/TILE_SIZE,
      mapBounds = Map.bounds;

    TileGrid.bounds = {
      zoom: zoom,
      minX: mapBounds.minX*ratio <<0,
      minY: mapBounds.minY*ratio <<0,
      maxX: Math.ceil(mapBounds.maxX*ratio),
      maxY: Math.ceil(mapBounds.maxY*ratio)
    };
  }

  function loadTiles() {
    var
      bounds = TileGrid.bounds,
      tileX, tileY, zoom = bounds.zoom,
      key,
      queue = [], queueLength,
      tileAnchor = [
        bounds.minX + (bounds.maxX-bounds.minX-1)/2,
        bounds.maxY
      ];
    for (tileY = bounds.minY; tileY < bounds.maxY; tileY++) {
      for (tileX = bounds.minX; tileX < bounds.maxX; tileX++) {
        key = [tileX, tileY, zoom].join(',');
        if (tiles[key]) {
          continue;
        }
        tiles[key] = new MapTile(tileX, tileY, zoom);
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

  function getURL(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(source, { s:s, x:x, y:y, z:z });
  }

  function purge() {
    for (var key in tiles) {
      if (!tiles[key].isVisible(1)) {
        tiles[key].destroy();
        delete tiles[key];
      }
    }
  }

  //***************************************************************************

  TileGrid.setSource = function(src) {
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

  TileGrid.getTiles = function() {
    return tiles;
  };

  TileGrid.destroy = function() {
    clearTimeout(isDelayed);
    for (var key in tiles) {
      tiles[key].destroy();
    }
    tiles = null;
  };

}());
