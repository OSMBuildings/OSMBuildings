
var OBJMesh = function(url, options) {
  Mesh.call(this, url, options);
  this.inMeters = TILE_SIZE / (Math.cos(this.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);
};

(function() {

  OBJMesh.prototype = Object.create(Mesh.prototype);

  OBJMesh.prototype.load = function(url) {
    var onLoad = this._onLoad.bind(this);

    this.request = Request.getText(url, function(objData) {
      var mtlFile = objData.match(/^mtllib\s+(.*)$/m);

      if (!mtlFile) {
        setTimeout(function() {
          OBJ.parse(objData, null, onLoad);
        }, 1);
        return;
      }

      var baseURL = url.replace(/[^\/]+$/, '');
      Request.getText(baseURL + mtlFile[1], function(mtlData) {
        OBJ.parse(objData, mtlData, onLoad);
      });
    });
  };

  OBJMesh.prototype.getMatrix = function() {
    if (!this.isReady) {
      return;
    }

    var mMatrix = new Matrix();

    if (this.elevation) {
      mMatrix.translate(0, 0, this.elevation);
    }

    var scale = Math.pow(2, Map.zoom) * this.inMeters * this.scale;
    mMatrix.scale(scale, scale, scale);

    mMatrix.rotateZ(-this.rotation);

    var
      position = project(this.position.latitude, this.position.longitude, TILE_SIZE*Math.pow(2, Map.zoom)),
      mapCenter = Map.center;

    mMatrix.translate(position.x-mapCenter.x, position.y-mapCenter.y, 0);

    return mMatrix;
  };

}());
