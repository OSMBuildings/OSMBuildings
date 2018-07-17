
// TODO: handle multiple markers
// A: cluster them into 'tiles' that give close reference point and allow simpler visibility tests or
// B: handle them as individual objects
// TODO: idea: attach marker to building: adopts its height & visibility
// TODO: vertical shading

class Marker {

  // TODO color

  constructor (position, options = {}) {
    this.position = { altitude: 0, ...position };
    this.anchor = options.anchor; // TODO

    this.matrix = new GLX.Matrix();
    this.matrix.translate(0, 0, this.position.altitude);

    // TODO apply scale - currently ignored by shader?
    const scale = options.scale || 1;
    this.matrix.scale(scale, scale, scale);

    this.prevX = 0;
    this.prevY = 0;

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

  getMatrix () {
    const
      metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(this.position.latitude / 180 * Math.PI),
      currX = (this.position.longitude - APP.position.longitude),
      currY = (this.position.latitude - APP.position.latitude),
      dx = currX - this.prevX,
      dy = currY - this.prevY;

    this.matrix.translate(dx * metersPerDegreeLongitude, -dy * METERS_PER_DEGREE_LATITUDE, 0);

    this.prevX = currX;
    this.prevY = currY;

    return this.matrix;
  }

  destroy () {
    APP.markers.remove(this);
  }
}
