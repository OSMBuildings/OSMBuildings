
var Mesh = function(url, properties) {
  this.properties = properties || {};
  this.position = this.properties.position || {};
  this.scale = this.properties.scale || 1;

  // TODO: implement OBJ.request.abort()
  this.request = { abort: function() {} };
  OBJ.load(url, this.onLoad.bind(this));
//CityGML.load(url, this.onLoad.bind(this));

  Data.add(this);
};

(function() {

  function createColors(num, color) {
    var colors = [], c = color ? color : { r:255*0.75, g:255*0.75, b:255*0.75 };
    for (var i = 0; i < num; i++) {
      colors.push(c.r, c.g, c.b);
    }
    return colors;
  }

  Mesh.prototype.onLoad = function(items) {
    this.request = null;

    var data = {
      vertices: [],
      normals: [],
      colors: [],
      idColors: []
    };

    for (var i = 0, il = items.length; i < il; i++) {
      this.storeItem(data, items[i]);  
    }

    this.vertexBuffer  = GL.createBuffer(3, new Float32Array(data.vertices));
    this.normalBuffer  = GL.createBuffer(3, new Float32Array(data.normals));
    this.colorBuffer   = GL.createBuffer(3, new Uint8Array(data.colors));
    this.idColorBuffer = GL.createBuffer(3, new Uint8Array(data.idColors));

    items = null; data = null;
    this.isReady = true;
  };

  Mesh.prototype.storeItem = function(data, item) {
    // given color has precedence
    var color = this.properties.color ? Color.parse(this.properties.color).toRGBA() : item.color;
    // given id has precedence
    var idColor = Interaction.idToColor(this.properties.id ? this.properties.id : item.id);

    var numVertices = item.vertices.length/3;

    for (var i = 0, il = item.vertices.length-2; i < il; i+=3) {
      data.vertices.push(item.vertices[i], item.vertices[i+1], item.vertices[i+2]);
      data.normals.push(item.normals[i], item.normals[i+1], item.normals[i+2]);
      data.colors.push(color.r, color.g, color.b);
      data.idColors.push(idColor.r, idColor.g, idColor.b);
    }
  };
 
  Mesh.prototype.getMatrix = function() {
    if (!this.isReady || !this.isVisible()) {
      return;
    }

    var
      zoom = 16, // TODO: this shouldn't be a fixed value?
      ratio = 1 / Math.pow(2, zoom - Map.zoom) * this.scale,
      worldSize = TILE_SIZE*Math.pow(2, Map.zoom),
      position = project(this.position.latitude, this.position.longitude, worldSize),
      origin = Map.origin,
      matrix = Matrix.create();

    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.85);
    matrix = Matrix.translate(matrix, position.x-origin.x, position.y-origin.y, 0);

    return matrix;
  };

  Mesh.prototype.isVisible = function(key, buffer) {
    buffer = buffer || 0;



//    var
//      zoom = 16, // TODO: this shouldn't be a fixed value?
//      ratio = 1 / Math.pow(2, zoom - Map.zoom),
//      worldSize = TILE_SIZE*Math.pow(2, Map.zoom),
//      position = project(this.position.latitude, this.position.longitude, worldSize),
//      origin = Map.origin,
//      matrix = Matrix.create();
//
//    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.65);
//    matrix = Matrix.translate(matrix, position.x-origin.x, position.y-origin.y, 0);

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
