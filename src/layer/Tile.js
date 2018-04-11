class Tile {

  constructor (x, y, zoom) {
    this.x = x;
    this.y = y;
    this.zoom = zoom;
    this.key = [x, y, zoom].join(',');
  };

  load () {}

  destroy () {}
}
