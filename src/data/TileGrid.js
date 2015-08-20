
var TileGrid = {};

(function() {

  var
    source,
    isDelayed,
    zoom,
    minX,
    minY,
    maxX,
    maxY,
    tiles = {};

  function update(delay) {
    updateTileBounds();

    if (!delay) {
      loadTiles();
      return;
    }

    // strategy: start loading after {delay}, skip any attempts until then
    // effectively loads in intervals during movement

    if (isDelayed) {
      return;
    }

    isDelayed = setTimeout(function() {
      isDelayed = null;
      loadTiles();
    }, delay);
  }

  // TODO: signal, if bbox changed => for loadTiles() + Tile.isVisible()
  function updateTileBounds() {
    zoom = Math.round(Map.zoom);

    var
      ratio = Math.pow(2, zoom-Map.zoom)/TILE_SIZE,
      mapBounds = Map.bounds,
      perspectiveBuffer = 1;

    minX = (mapBounds.minX*ratio <<0) - perspectiveBuffer;
    minY = (mapBounds.minY*ratio <<0) - perspectiveBuffer;
    maxX = Math.ceil(mapBounds.maxX*ratio) + perspectiveBuffer;
    maxY = Math.ceil(mapBounds.maxY*ratio) + perspectiveBuffer;
  }

  function loadTiles() {
    var
      tileX, tileY,
      key,
      queue = [], queueLength,
      tileAnchor = [
        minX + (maxX-minX-1)/2,
        maxY
      ];

    for (tileY = minY; tileY < maxY; tileY++) {
      for (tileX = minX; tileX < maxX; tileX++) {
        key = [tileX, tileY, zoom].join(',');
        if (tiles[key]) {
          continue;
        }
        tiles[key] = new MapTile(tileX, tileY, zoom);
        // TODO: rotate anchor point
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
      if (!isVisible(tiles[key], 1)) {
        tiles[key].destroy();
        delete tiles[key];
      }
    }
  }

  function isVisible(tile, buffer) {
    buffer = buffer || 0;

    var
      tileX = tile.tileX,
      tileY = tile.tileY;

    return (tile.zoom === zoom &&
      // TODO: factor in tile origin
    (tileX >= minX-buffer && tileX <= maxX+buffer && tileY >= minY-buffer && tileY <= maxY+buffer));
  }

  function getURL(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(source, { s:s, x:x, y:y, z:z });
  }

  //***************************************************************************

  TileGrid.setSource = function(src) {
    if (!src) {
      return;
    }

    source = src;

    Events.on('change', function() {
      update(500);
    });

    Events.on('resize', update);

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
