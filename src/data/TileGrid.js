
var TileGrid = {};

(function() {

  var
    tileSize = TILE_SIZE,
    source,
    tiles = {},
    isDelayed,
    shader;

  function updateTileBounds() {
    var
      bounds = Map.bounds,
      zoom = Math.round(Map.zoom),
      worldSize = tileSize <<zoom,
      min = project(bounds.n, bounds.w, worldSize),
      max = project(bounds.s, bounds.e, worldSize);

    TileGrid.bounds = {
      zoom: zoom,
      minX: min.x/tileSize <<0,
      minY: min.y/tileSize <<0,
      maxX: Math.ceil(max.x/tileSize),
      maxY: Math.ceil(max.y/tileSize)
    };
  }

  function loadTiles() {
    var
      bounds = TileGrid.bounds,
      x, y, zoom = bounds.zoom,
      key,
      queue = [], queueLength,
      tileAnchor = [
        bounds.minX + (bounds.maxX-bounds.minX-1)/2,
        bounds.maxY
      ];

    for (y = bounds.minY; y < bounds.maxY; y++) {
      for (x = bounds.minX; x < bounds.maxX; x++) {
        key = [x, y, zoom].join(',');
        if (tiles[key]) {
          continue;
        }
        tiles[key] = new MapTile(x, y, zoom);
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
      queue[i].tile.load(getURL(queue[i].tile.tileX, queue[i].tile.tileY, queue[i].tile.zoom));
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

  //***************************************************************************

  TileGrid.setSource = function(src) {
    source = src;
    shader = new Shader('tileplane');

    Events.on('change', function() {
      update(100);
    });

    Events.on('resize', function() {
      update();
    });

    update();
  };

  // TODO: try to use tiles from other zoom levels when some are missing
  TileGrid.render = function(projection) {
    var program = shader.use();
    for (var key in tiles) {
      tiles[key].render(program, projection);
    }
    program.end();
  };

  TileGrid.destroy = function() {
    clearTimeout(isDelayed);
    for (var key in tiles) {
      tiles[key].destroy();
    }
    tiles = null;
  };

}());
