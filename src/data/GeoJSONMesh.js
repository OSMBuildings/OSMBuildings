
var GeoJSONMesh = function(url, options) {
  Mesh.call(this, url, options);
};

(function() {

  GeoJSONMesh.prototype = Object.create(Mesh.prototype);

  GeoJSONMesh.prototype.load = function(url) {
    this.request = Request.getJSON(url, function(geojson) {
      this._onLoad(GeoJSON.read(0, 0, 0, geojson));
    }.bind(this));
  };

  GeoJSONMesh.prototype.getMatrix = function() {
    if (!this.isReady || !this.isVisible()) {
      return;
    }

    var mMatrix = Matrix.create();

    var scale = Math.pow(2, Map.zoom);
    mMatrix = Matrix.scale(mMatrix, scale, scale, scale * this.inMeters);

    var mapCenter = Map.center;
    mMatrix = Matrix.translate(mMatrix, -mapCenter.x, -mapCenter.y, 0);

    return mMatrix;
  };

}());
