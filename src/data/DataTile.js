
var DataTile = function(tileX, tileY, zoom) {
  this.tileX = tileX;
  this.tileY = tileY;
  this.zoom = zoom;
};

DataTile.prototype = {

  load: function(url) {
    Activity.setBusy();
    this.request = Request.getJSON(url, function(geojson) {
      this.request = null;

      if (!geojson || geojson.type !== 'FeatureCollection' || !geojson.features.length) {
        return;
      }

      var
        coordinates0 = geojson.features[0].geometry.coordinates[0][0],
        position = { latitude:coordinates0[1], longitude:coordinates0[0] },
        data = GeoJSON.parse(position, TILE_SIZE<<this.zoom, geojson);
      this.mesh = new Mesh(data, position);

      Activity.setIdle();
    }.bind(this));
  },

  destroy: function() {
    if (this.request) {
      this.request.abort();
      this.request = null;
    }
    if (this.mesh) {
      this.mesh.destroy();
      this.mesh = null;
    }
  }
};
