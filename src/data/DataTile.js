
var DataTile = function(tileX, tileY, zoom) {
  this.tileX = tileX;
  this.tileY = tileY;
  this.zoom = zoom;

  Data.add(this);
};

DataTile.prototype = {

  load: function(url) {
    this.request = Request.getJSON(url, this.onLoad.bind(this));
  },

  onLoad: function(json) {
    this.request = null;
    this.items = [];

    var geom = GeoJSON.read(this.tileX * TILE_SIZE, this.tileY * TILE_SIZE, this.zoom, json);

    this.vertexBuffer  = GL.createBuffer(3, new Float32Array(geom.vertices));
    this.normalBuffer  = GL.createBuffer(3, new Float32Array(geom.normals));
    this.idColorBuffer = GL.createBuffer(3, new Uint8Array(geom.idColors));
this.colorBuffer = GL.createBuffer(3, new Uint8Array(geom.colors));

    this.modify(Data.modifier);

    geom = null; json = null;
    this.isReady = true;
  },

//  storeItem = function(data, item) {
//  // given color has precedence
//  var color = this.properties.color ? Color.parse(this.properties.color).toRGBA() : item.color;
//
//  var numVertices = item.vertices.length/3;
//
//  item.color = color;
//  item.id = this.properties.id ? this.properties.id : item.id;
//  item.numVertices = numVertices;
//
//  this.items.push(item);
//};

  modify: function(fn) {
return;
    if (!this.items) {
      return;
    }

    var colors = [], item;
    for (var i = 0, il = this.items.length; i < il; i++) {
      item = this.items[i];
      fn(item);
      for (var j = 0, jl = item.numVertices; j < jl; j++) {
        colors.push(item.color.r, item.color.g, item.color.b);
      }
    }
    this.colorBuffer = GL.createBuffer(3, new Uint8Array(colors));
  },

  getMatrix: function() {
    if (!this.isReady || !this.isVisible()) {
      return;
    }

    var
      ratio = 1 / Math.pow(2, this.zoom - Map.zoom),
      mapCenter = Map.center,
      matrix = Matrix.create();

    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.65);
    matrix = Matrix.translate(matrix, this.tileX * TILE_SIZE * ratio - mapCenter.x, this.tileY * TILE_SIZE * ratio - mapCenter.y, 0);
    return matrix;
  },

  isVisible: function(buffer) {
    buffer = buffer || 0;
    var
      gridBounds = DataGrid.bounds,
      tileX = this.tileX,
      tileY = this.tileY;

    return (this.zoom === gridBounds.zoom &&
      // TODO: factor in tile origin
      (tileX >= gridBounds.minX-buffer && tileX <= gridBounds.maxX+buffer && tileY >= gridBounds.minY-buffer && tileY <= gridBounds.maxY+buffer));
  },

  destroy: function() {
    GL.deleteBuffer(this.vertexBuffer);
    GL.deleteBuffer(this.normalBuffer);
    GL.deleteBuffer(this.colorBuffer);
    GL.deleteBuffer(this.idColorBuffer);

    if (this.request) {
      this.request.abort();
      this.request = null;
    }

    Data.remove(this);
  }
};
