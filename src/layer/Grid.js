
class Grid {

  constructor (source, tileClass, options = {}, maxThreads = 2) {
    this.source = source;
    this.tileClass = tileClass;

    this.tiles = {};
    this.buffer = 1;

    this.fixedZoom = options.fixedZoom;

    this.bounds = options.bounds || { w: -180, s: -90, e: 180, n: 90 };
    this.minZoom = Math.max(parseFloat(options.minZoom || APP.minZoom), APP.minZoom);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || APP.maxZoom), APP.maxZoom);

    if (this.maxZoom < this.minZoom) {
      this.minZoom = APP.minZoom;
      this.maxZoom = APP.maxZoom;
    }

    this.queue = [];
    // TODO: should be more flexible, also connected to # of webworkers, could increase when idle
    for (let i = 0; i < maxThreads; i++) {
      this.queueNext();
    }

    this.update();
  }

  getURL (x, y, z) {
    const s = 'abcd'[(x + y) % 4];
    return pattern(this.source, { s: s, x: x, y: y, z: z });
  }

  getClosestTiles (tileList, referencePoint) {
    return tileList;

    // tileList.sort((a, b) => {
    //   // tile coordinates correspond to the tile's upper left corner, but for
    //   // the distance computation we should rather use their center; hence the 0.5 offsets
    //   const distA = Math.pow(a[0] + 0.5 - referencePoint[0], 2.0) + Math.pow(a[1] + 0.5 - referencePoint[1], 2.0);
    //   const distB = Math.pow(b[0] + 0.5 - referencePoint[0], 2.0) + Math.pow(b[1] + 0.5 - referencePoint[1], 2.0);
    //   return distA > distB;
    // });
    //
    // // remove duplicates
    // let prevX, prevY;
    // return tileList.filter(tile => {
    //   if (tile[0] === prevX && tile[1] === prevY) {
    //     return false;
    //   }
    //   prevX = tile[0];
    //   prevY = tile[1];
    //   return true;
    // });
  }

  /* Returns a set of tiles based on 'tiles' (at zoom level 'zoom'),
   * but with those tiles recursively replaced by their respective parent tile
   * (tile from zoom level 'zoom'-1 that contains 'tile') for which said parent
   * tile covers less than 'pixelAreaThreshold' pixels on screen based on the
   * current view-projection matrix.
   *
   * The returned tile set is duplicate-free even if there were duplicates in
   * 'tiles' and even if multiple tiles from 'tiles' got replaced by the same parent.
   */
  mergeTiles (tiles, zoom, pixelAreaThreshold) {
    const
      parentTiles = {},
      tileSet = {},
      tileList = [];

    // if there is no parent zoom level
    let key;
    if (zoom === 0 || zoom <= this.minZoom) {
      for (key in tiles) {
        tiles[key][2] = zoom;
      }
      return tiles;
    }

    for (key in tiles) {
      const tile = tiles[key];

      const parentX = (tile[0] << 0) / 2;
      const parentY = (tile[1] << 0) / 2;

      if (parentTiles[[parentX, parentY]] === undefined) { //parent tile screen size unknown
        const numParentScreenPixels = getTileSizeOnScreen(parentX, parentY, zoom - 1, APP.view.viewProjMatrix);
        parentTiles[[parentX, parentY]] = (numParentScreenPixels < pixelAreaThreshold);
      }

      if (!parentTiles[[parentX, parentY]]) { //won't be replaced by a parent tile -->keep
        if (tileSet[[tile[0], tile[1]]] === undefined) {  //remove duplicates
          tileSet[[tile[0], tile[1]]] = true;
          tileList.push([tile[0], tile[1], zoom]);
        }
      }
    }

    let parentTileList = [];

    for (key in parentTiles) {
      if (parentTiles[key]) {
        const parentTile = key.split(',');
        parentTileList.push([parseInt(parentTile[0]), parseInt(parentTile[1]), zoom - 1]);
      }
    }

    if (parentTileList.length > 0) {
      parentTileList = this.mergeTiles(parentTileList, zoom - 1, pixelAreaThreshold);
    }

    return tileList.concat(parentTileList);
  }

  getDistance (a, b) {
    const dx = a[0] - b[0], dy = a[1] - b[1];
    return dx * dx + dy * dy;
  }

  // getAnglePoint (point, angle, distance) {
  //   let rad = angle * Math.PI / 180;
  //   return [distance * Math.cos(rad) + point[0], distance * Math.sin(rad) + point[1]];
  // }
  //
  // // inspired by polygon.js (https://github.com/tmpvar/polygon.js/blob/master/polygon.js
  // pointInPolygon (point, polygon) {
  //   let
  //     res = false,
  //     curr, prev;
  //   for (let i = 1; i < polygon.length; i++) {
  //     curr = polygon[i];
  //     prev = polygon[i - 1];
  //
  //     ((prev[1] <= point[1] && point[1] < curr[1]) || (curr[1] <= point[1] && point[1] < prev[1]))
  //     && (point[0] < (curr[0] - prev[0]) * (point[1] - prev[1]) / (curr[1] - prev[1]) + prev[0])
  //     && (res = !res);
  //   }
  //   return res;
  // }

  update () {
    if (APP.zoom < this.minZoom || APP.zoom > this.maxZoom) {
      return;
    }

    const zoom = Math.round(this.fixedZoom || APP.zoom);
    // TODO: respect bounds
    // min = project(this.bounds.s, this.bounds.w, 1<<zoom),
    // max = project(this.bounds.n, this.bounds.e, 1<<zoom),
    // bounds = {
    //   zoom: zoom,
    //   minX: min.x <<0,
    //   minY: min.y <<0,
    //   maxX: max.x <<0,
    //   maxY: max.y <<0
    // };

    let
      viewQuad = APP.view.getViewQuad(APP.view.viewProjMatrix.data),
      center = project([APP.position.longitude, APP.position.latitude], 1<< zoom);

    for (let i = 0; i < 4; i++) {
      viewQuad[i] = getTilePositionFromLocal(viewQuad[i], zoom);
    }

    let tiles = rasterConvexQuad(viewQuad);
    tiles = this.fixedZoom ? this.getClosestTiles(tiles, center) : this.mergeTiles(tiles, zoom, 0.5 * TILE_SIZE * TILE_SIZE);

    const visibleTiles = {};
    tiles.forEach(pos => {
      if (pos[2] === undefined) {
        pos[2] = zoom;
      }
      visibleTiles[pos.join(',')] = true;
    });

    this.visibleTiles = visibleTiles; // TODO: remove from this. Currently needed for basemap renderer collecting items

    //*****************************************************
    //*****************************************************

    for (let key in visibleTiles) {
      const
        pos = key.split(','),
        x = parseInt(pos[0]),
        y = parseInt(pos[1]),
        zoom = parseInt(pos[2]);

      // TODO: check why some other zoom levels are loaded!

      if (this.tiles[key]) {
        continue;
      }

      // create tile if it doesn't exist
      this.tiles[key] = new this.tileClass(x, y, zoom);
      this.queue.push(this.tiles[key]);
    }

    this.purge(visibleTiles);

    // update all distances
    this.queue.forEach(tile => {
      tile.distance = this.getDistance([tile.x, tile.y], center);
    });

    this.queue.sort((a, b) => {
      return b.distance - a.distance;
    });

    setTimeout(() => {
      this.update();
    }, 100);
  }

  queueNext () {
    if (!this.queue.length) {
      setTimeout(this.queueNext.bind(this), 200);
      return;
    }

    const tile = this.queue.pop();

    tile.load(this.getURL(tile.x, tile.y, tile.zoom), () => {
      this.queueNext();
    });
  }

  purge (visibleTiles) {
    const zoom = Math.round(APP.zoom);

    for (let key in this.tiles) {
      let tile = this.tiles[key];

      // tile is visible: keep
      if (visibleTiles[key]) {
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
        let parentKey = [tile.x/2<<0, tile.y/2<<0, zoom].join(',');
        if (visibleTiles[parentKey]) {
          continue;
        }
      }

      // any of tile's children would be visible: keep
      if (tile.zoom === zoom-1) {
        if (
          visibleTiles[[tile.x*2,     tile.y*2,     zoom].join(',')] ||
          visibleTiles[[tile.x*2 + 1, tile.y*2,     zoom].join(',')] ||
          visibleTiles[[tile.x*2,     tile.y*2 + 1, zoom].join(',')] ||
          visibleTiles[[tile.x*2 + 1, tile.y*2 + 1, zoom].join(',')]) {
          continue;
        }
      }

      // drop anything else
      delete this.tiles[key];
    }

    // remove dead tiles from queue
    this.queue = this.queue.filter(tile => !!tile);
  }

  destroy () {
    for (let key in this.tiles) {
      this.tiles[key].destroy();
    }
    this.tiles = {};
    this.queue = [];

    // TODO: stop update timer, stop queue timers
  }
}
