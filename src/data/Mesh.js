
var Mesh = function(dataOrURL, properties) {
  this.properties = properties || {};

  if (typeof dataOrURL === 'object') {
    this.onLoad(dataOrURL);
  } else {
    this.load(dataOrURL);
  }

  Data.add(this);
};

(function() {

  Mesh.prototype.load = function(url) {
    this.request = XHR.loadJSON(url, this.onLoad.bind(this));
  };

  Mesh.prototype.onLoad = function(json) {
    this.request = null;

    this.position = json.position || this.properties.position || {};

    var geom = JS3D.read(json, this.properties);
    this.vertexBuffer  = GL.createBuffer(3, new Float32Array(geom.vertices));
    this.normalBuffer  = GL.createBuffer(3, new Float32Array(geom.normals));
    this.colorBuffer   = GL.createBuffer(3, new Uint8Array(geom.colors));
    this.idColorBuffer = GL.createBuffer(3, new Uint8Array(geom.idColors));
    geom = null; json = null;
    this.isReady = true;
  };

  Mesh.prototype.getMatrix = function() {
    if (!this.isReady || !this.isVisible()) {
      return;
    }

    var
      zoom = 16, // TODO: this shouldn't be a fixed value?
      ratio = 1 / Math.pow(2, zoom - Map.zoom),
      worldSize = TILE_SIZE*Math.pow(2, Map.zoom),
      position = project(this.position.latitude, this.position.longitude, worldSize),
      origin = Map.origin,
      matrix = Matrix.create();

    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.65);
    matrix = Matrix.translate(matrix, position.x-origin.x, position.y-origin.y, 0);

    return matrix;
  };

  Mesh.prototype.isVisible = function(key, buffer) {
    buffer = buffer || 0;
return true;
  };

  Mesh.prototype.destroy = function() {
    GL.deleteBuffer(this.vertexBuffer);
    GL.deleteBuffer(this.normalBuffer);
    GL.deleteBuffer(this.colorBuffer);
    GL.deleteBuffer(this.idColorBuffer);

    if (this.request) {
      this.request.abort();
      this.request = null;
    }

    Data.remove(this);
  };

}());
