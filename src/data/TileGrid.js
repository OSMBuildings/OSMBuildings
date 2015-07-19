
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

    if (!isDelayed) {
      isDelayed = setTimeout(function() {
        isDelayed = null;
        loadTiles();
      }, delay);
    }
  }

  function transform(x, y, z, matrix) {
    // apply matrix, see http://webglfundamentals.org/webgl/lessons/webgl-2d-matrices.html
    var X = x*matrix[0] + y*matrix[4] + z*matrix[8] + matrix[12];
    var Y = x*matrix[1] + y*matrix[5] + z*matrix[9] + matrix[13];
    var Z = x*matrix[2] + y*matrix[6] + z*matrix[10] + matrix[14];
//  var W = x*matrix[3] + y*matrix[7] + z*matrix[11] + matrix[15];

    var f = 20;
// var projection = Matrix.perspective(20, Scene.width, Scene.height, 40000);
// matrix = Matrix.multiply(matrix, projection);
    var zToDivideBy = z*f;

    // Divide x and y by z.

    var m = matrix;
    var X = x*m[0] + y*m[4] + z*m[8] + m[12];
    var Y = x*m[1] + y*m[5] + z*m[9] + m[13];

    X /= Z;
    Y /= Z;

    return { x:X, y:Y };
  }

  // TODO: signal, if bbox changed => for loadTiles() + Tile.isVisible()
  function updateTileBounds() {
    zoom = Math.round(Map.zoom);

    var
      ratio = Math.pow(2, zoom-Map.zoom) / TILE_SIZE,
      mapCenter = Map.center,
      radius = SkyDome.getRadius() / TILE_SIZE;

    minX = ((mapCenter.x*ratio - Scene.width*ratio) <<0) -1;
    minY = ((mapCenter.y*ratio - Scene.height*ratio) <<0) -1;
    maxX = Math.ceil(mapCenter.x*ratio + Scene.width*ratio) +1;
    maxY = Math.ceil(mapCenter.y*ratio + Scene.height*ratio) +1;







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
return
    var mapCenter = Map.center;
    var maxDistance = SkyDome.getRadius() + TILE_SIZE;
    var cx = mapCenter.x / TILE_SIZE;
    var cy = mapCenter.y / TILE_SIZE;
//console.log(cx, cy, 'minmax', minX+(maxX-minX)/2, minY+(maxY-minY)/2)

    for (tileY = minY; tileY < maxY; tileY++) {
      for (tileX = minX; tileX < maxX; tileX++) {
//console.log((tileX+0.5)*TILE_SIZE-mapCenter.x, (tileY+0.5)*TILE_SIZE-mapCenter.y)
//        if ((tileX+0.5)*TILE_SIZE-mapCenter.x, (tileY+0.5)*TILE_SIZE], [mapCenter.x, mapCenter.y]) > maxDistance2) {
//console.log('cont')
//          continue;
//        }

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
      update(100);
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
