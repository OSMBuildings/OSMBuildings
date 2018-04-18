
class GeoJSONTile extends Tile {

  constructor(x, y, zoom, options) {
    super(x, y, zoom);
    this.options = options;
  }

  load (url, callback) {
    this.content = new DataItem('GeoJSON', url, this.options, callback);
  }

  destroy () {
    if (this.content) {
      this.content.destroy();
    }
  }
}
