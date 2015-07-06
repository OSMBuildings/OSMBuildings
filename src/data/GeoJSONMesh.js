
var GeoJSONMesh = function(url, options) {
  Mesh.call(this, url, options);
  this.zoom = 16;
//this.inMeters = TILE_SIZE / (Math.cos(1) * EARTH_CIRCUMFERENCE);
};

(function() {

  GeoJSONMesh.prototype = Object.create(Mesh.prototype);

  GeoJSONMesh.prototype.load = function(url) {
    this.request = Request.getJSON(url, function(geojson) {
      if (!geojson.features.length) {
        return;
      }

      var geoPos = geojson.features[0].geometry.coordinates[0][0];
      this.position = { latitude:geoPos[1], longitude:geoPos[0] };
      var position = project(geoPos[1], geoPos[0], TILE_SIZE<<this.zoom);

      GeoJSON.parse(position.x, position.y, this.zoom, geojson, this._onLoad.bind(this));
      geojson = null;

    }.bind(this));
  };

  GeoJSONMesh.prototype.getMatrix = function() {
    if (!this.isReady) {
      return;
    }

    var mMatrix = new Matrix();

    var scale = 1/Math.pow(2, this.zoom - Map.zoom);

    mMatrix = Matrix.scale(mMatrix, scale, scale, scale*0.65);

    var
      position = project(this.position.latitude, this.position.longitude, TILE_SIZE*Math.pow(2, Map.zoom)),
      mapCenter = Map.center;

    mMatrix = Matrix.translate(mMatrix, position.x-mapCenter.x, position.y-mapCenter.y, 0);

    return mMatrix;
  };

}());