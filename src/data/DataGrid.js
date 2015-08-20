
var DataGrid = {};

(function() {

  var
    source,
    isDelayed,

    zoom,
    minX,
    minY,
    maxX,
    maxY,

    tiles = {},
    fixedZoom = 16;

  function update(delay) {
    updateTileBounds();

    if (!delay) {
      loadTiles();
      return;
    }

    // strategy: start loading in {delay} after movement ends, skip any attempts until then

    if (isDelayed) {
      clearTimeout(isDelayed);
    }

    isDelayed = setTimeout(function() {
      isDelayed = null;
      loadTiles();
    }, delay);
  }

  // TODO: signal, if bbox changed => for loadTiles() + Tile.isVisible()
  function updateTileBounds() {
    zoom = Math.round(fixedZoom || Map.zoom);

    var
      scale = Math.pow(2, zoom-Map.zoom)/TILE_SIZE,
      mapBounds = Map.bounds,
      perspectiveBuffer = 1;

    minX = (mapBounds.minX*scale <<0) - perspectiveBuffer;
    minY = (mapBounds.minY*scale <<0) + 1 - perspectiveBuffer;
    maxX = Math.ceil(mapBounds.maxX*scale) + perspectiveBuffer;
    maxY = Math.ceil(mapBounds.maxY*scale) + 1 + perspectiveBuffer;

//console.log('rect', minX, maxX, minY, maxY);
//
//
//var scale = Math.pow(2, Map.zoom) / (Math.cos(Map.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);
//var scale2 = Math.pow(2, zoom-Map.zoom);
//
//    var
//      mapCenter = Map.center,
//      fogRadius = Renderer.fogRadius*scale;
//
//    var minX2 = ((mapCenter.x/TILE_SIZE-fogRadius)*scale2 <<0) - 0 - perspectiveBuffer;
//    var minY2 = ((mapCenter.y/TILE_SIZE+fogRadius)*scale2 <<0) - 1 - perspectiveBuffer;
//    var maxX2 = Math.ceil(mapCenter.x/TILE_SIZE-fogRadius)*scale2 + 2 +perspectiveBuffer;
//    var maxY2 = Math.ceil(mapCenter.y/TILE_SIZE+fogRadius)*scale2 + perspectiveBuffer;
//
//    console.log('circle', minX2, maxX2, minY2, maxY2, fogRadius);

  }

  function loadTiles() {
    if (Map.zoom < MIN_ZOOM) {
      return;
    }

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
      if (!isVisible(tiles[key], 1)) { // testing with buffer of n tiles around viewport TODO: this is bad with fixedTileSIze
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

  DataGrid.setSource = function(src, dataKey) {
    if (src === undefined || src === false || src === '') {
      src = DATA_SRC.replace('{k}', dataKey);
    }

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

  DataGrid.destroy = function() {
    clearTimeout(isDelayed);
    for (var key in tiles) {
      tiles[key].destroy();
    }
    tiles = null;
  };

}());
