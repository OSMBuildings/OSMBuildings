
var DataTile = function(tileX, tileY, zoom) {
  this.tileX = tileX;
  this.tileY = tileY;
  this.zoom = zoom;
};

DataTile.prototype = {

  load: function(url) {
    this.request = Request.getJSON(url, function(geojson) {
      this.request = null;
      var data = GeoJSON.parse(geojson);
      this.mesh = new Mesh(data);
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
