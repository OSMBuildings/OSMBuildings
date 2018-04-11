
class DataTile extends Tile {

  constructor(x, y, zoom, options) {
    super(x, y, zoom);
    this.options = options;
  }

  load (url) {
    this.mesh = new mesh.GeoJSON(url, this.options);
  }

  destroy () {
    if (this.mesh) {
      this.mesh.destroy();
    }
  }
}
