class Marker {

  // TODO color

  constructor (position, options = {}) {
    this.position = { altitude: 0, ...position };
    this.anchor = options.anchor || 'bottom';
    this.scale = options.scale || 1; // TODO -> size

    if (!options.url) {
      APP.icons.get(Icon.defaultURL, (err, icon) => {
        if (!err) {
          this.icon = icon;
          APP.markers.add(this);
        }
      });
      return;
    }

    APP.icons.get(options.url, (err, icon) => {
      if (!err) {
        this.icon = icon;
        APP.markers.add(this);
      }
    });
  }

  // const halfSize = this.size / 2;
  // const anchorsCoordPool = {
  //   center: [halfSize, halfSize, halfSize, halfSize],
  //   top: [0, halfSize, this.size, halfSize],
  //   bottom: [this.size, halfSize, 0, halfSize],
  //   left: [halfSize, 0, halfSize, this.size],
  //   right: [halfSize, this.size, halfSize, 0],
  //   top_left: [0, 0, this.size, this.size],
  //   top_right: [0, this.size, this.size, 0],
  //   bottom_left: [this.size, -this.size, 0, 0],
  //   bottom_right: [this.size, this.size, 0, 0]
  // };
  //
  // const anchorCoord = anchorsCoordPool[this.anchor] || anchorsCoordPool.center;
  //
  // const vertices = [
  //   -anchorCoord[1], -anchorCoord[0], 0, // upper left
  //    anchorCoord[3], -anchorCoord[0], 0, // upper right
  //   -anchorCoord[1],  anchorCoord[2], 0, // bottom left
  //    anchorCoord[3],  anchorCoord[2], 0, // bottom right
  //   -anchorCoord[1],  anchorCoord[2], 0, // bottom left
  //    anchorCoord[3], -anchorCoord[0], 0  // upper right
  // ];

  destroy () {
    APP.markers.remove(this);
  }
}
