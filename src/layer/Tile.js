class Tile {

  constructor (x, y, zoom) {
    this.x = x;
    this.y = y;
    this.zoom = zoom;
    this.key = [x, y, zoom].join(',');

    this.distance = Infinity;
  }

  // parent () {
  //   return {
  //     x: this.x / 2,
  //     y: this.y / 2,
  //     z: this.zoom - 1
  //   };
  // }

  // children () {
  //   return [
  //     { x: this.x * 2,     y: this.y * 2,     z: this.zoom + 1 },
  //     { x: this.x * 2 + 1, y: this.y * 2,     z: this.zoom + 1 },
  //     { x: this.x * 2,     y: this.y * 2 + 1, z: this.zoom + 1 },
  //     { x: this.x * 2 + 1, y: this.y * 2 + 1, z: this.zoom + 1 }
  //   ];
  // }

  load () {}

  destroy () {}
}
