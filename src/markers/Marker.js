
// TODO: handle multiple markers
// A: cluster them into 'tiles' that give close reference point and allow simpler visibility tests or
// B: handle them as individual objects
// TODO: idea: attach marker to building: adopts its height & visibility
// TODO: vertical shading

class Marker {

  // TODO color

  constructor (position, data = null, options = {}) {
    this.data = data;

    const anchor = options.anchor; // TODO
    const scale = options.scale || 1; // TODO

    this.color = Qolor.parse(options.color || Marker.defaultColor).toArray();

    this.metersPerLon = METERS_PER_DEGREE_LATITUDE * Math.cos(position.latitude / 180 * Math.PI);

    this.longitude = position.longitude;
    this.latitude = position.latitude;
    this.altitude = (position.altitude || 0);

    this.matrix = new GLX.Matrix();
    this.matrix.scale(scale, scale, scale); // TODO currently ignored by shader?

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
    this.matrix.translateTo(
      (this.longitude - APP.position.longitude) * this.metersPerLon,
      (APP.position.latitude-this.latitude) * METERS_PER_DEGREE_LATITUDE,
      this.altitude
    );

    return this.matrix;
  }

  destroy () {
    APP.markers.remove(this);
  }
}

Marker.defaultColor = '#ffcc00';
