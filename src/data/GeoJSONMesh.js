
var GeoJSONMesh = function(url, options) {
  Mesh.call(this, url, options);
//this.tileX = options.tileX;
//this.tileY = options.tileY;
////this.inMeters = TILE_SIZE / (Math.cos(1) * EARTH_CIRCUMFERENCE);
};

(function() {

  GeoJSONMesh.prototype = Object.create(Mesh.prototype);

  GeoJSONMesh.prototype.load = function(url) {
    this.request = Request.getJSON(url, function(geojson) {
      var data = GeoJSON.parse(geojson);
      this.position = data.position;
      this.inMeters = TILE_SIZE / (Math.cos(this.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);
      this._onLoad(data.items);
    }.bind(this));
  };

  GeoJSONMesh.prototype.getMatrix = function() {
    if (!this.isReady) {
      return;
    }

    var mMatrix = Matrix.create();

    var scale = Math.pow(2, Map.zoom) * this.inMeters;
    mMatrix = Matrix.scale(mMatrix, scale, scale, scale);

    var
      worldSize = TILE_SIZE*Math.pow(2, Map.zoom),
      position = project(this.position.latitude, this.position.longitude, worldSize),
      mapCenter = Map.center;
    mMatrix = Matrix.translate(mMatrix, position.x - mapCenter.x, position.y - mapCenter.y, 0);

//var
//  ratio = 1 / Math.pow(2, 16 - Map.zoom),
//  mapCenter = Map.center;
//mMatrix = Matrix.scale(mMatrix, ratio, ratio, ratio*0.65);
//mMatrix = Matrix.translate(mMatrix, this.tileX * TILE_SIZE * ratio - mapCenter.x, this.tileY * TILE_SIZE * ratio - mapCenter.y, 0);

    return mMatrix;
  };

}());
