
var Grid = {};

(function() {

  var isDelayed;
  var index = {};

  function update(delay) {
    var zoom = Grid.fixedZoom || Math.round(Map.zoom);

    var
      mapBounds = Map.bounds,
      worldSize = TILE_SIZE <<zoom,
      min = project(mapBounds.n, mapBounds.w, worldSize),
      max = project(mapBounds.s, mapBounds.e, worldSize);

    Grid.bounds = {
      zoom: zoom,
      minX: min.x/TILE_SIZE <<0,
      minY: min.y/TILE_SIZE <<0,
      maxX: Math.ceil(max.x/TILE_SIZE),
      maxY: Math.ceil(max.y/TILE_SIZE)
    };

    // TODO: signal, if bbox changed => for loadTiles() + Data.getVisibleItems()

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

  function loadTiles() {
    var tileX, tileY;
    var queue = [], queueLength;
    var gridBounds = Grid.bounds;
    var key;

    for (tileY = gridBounds.minY; tileY <= gridBounds.maxY; tileY++) {
      for (tileX = gridBounds.minX; tileX <= gridBounds.maxX; tileX++) {
        key = [tileX, tileY, gridBounds.zoom].join(',');
        if (index[key]) {
          continue;
        }
        queue.push({ tileX:tileX, tileY:tileY, zoom:gridBounds.zoom, key:key });
      }
    }

    if (!(queueLength = queue.length)) {
      return;
    }

    // TODO: currently viewport center but could be aligned to be camera pos
    var tileAnchor = {
      x:gridBounds.minX + (gridBounds.maxX-gridBounds.minX-1)/2,
      y:gridBounds.minY + (gridBounds.maxY-gridBounds.minY-1)/2
    };

    queue.sort(function(b, a) {
      return distance2(a, tileAnchor) - distance2(b, tileAnchor);
    });

    var tile, q;
    for (var i = 0; i < queueLength; i++) {
      q = queue[i];
      Data.add( tile = new Tile(q.tileX, q.tileY, q.zoom) );
      tile.load(getURL(q.tileX, q.tileY, q.zoom));
      index[q.key] = tile;
    }

    purge();
  }

  function purge() {
    for (var key in index) {
      if (!index[key].isVisible(1)) { // testing with buffer of n tiles around viewport TODO: this is bad with fixedTileSIze
        Data.remove(index[key]);
        delete index[key];
      }
    }
  }

  function getURL(x, y, z) {
    var s = 'abcd'[(x+y) % 4];
    return pattern(Grid.src, { s:s, x:x, y:y, z:z });
  }
  //***************************************************************************

  Grid.onMapChange = function() {
    if (!this.src) {
      return;
    }
    update(100);
  };

  Grid.onMapResize = function() {
    if (!this.src) {
      return;
    }
    update();
  };

  Grid.destroy = function() {
    clearTimeout(isDelayed);
  };

}());
