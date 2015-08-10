
var OBJMesh = function(url, options) {
  Mesh.call(this, url, options);
  this.inMeters = TILE_SIZE / (Math.cos(this.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);

  this._baseURL = url.replace(/[^\/]+$/, '');
  this.request = Request.getText(url, this._convert.bind(this));
};

(function() {

  OBJMesh.prototype = Object.create(Mesh.prototype);

  OBJMesh.prototype._convert = function(objStr) {
    var mtlFile = objStr.match(/^mtllib\s+(.*)$/m);

    if (!mtlFile) {
      setTimeout(function() {
        OBJ.parse(objStr, null, function(itemList) {
          this._setItems(itemList);
          this._replaceItems();
          this.isReady = true;
        }.bind(this));
      }.bind(this), 1);
      return;
    }

    Request.getText(this._baseURL + mtlFile[1], function(mtlStr) {
      OBJ.parse(objStr, mtlStr, function(itemList) {
        this._setItems(itemList);
        this._replaceItems();
        this.isReady = true;
      }.bind(this));
    }.bind(this));
  };

  OBJMesh.prototype.getMatrix = function() {
    if (!this.isReady) {
      return;
    }

    var mMatrix = new glx.Matrix();

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
