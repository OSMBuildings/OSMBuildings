
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

  onLoad: function(geojson) {
    this.request = null;
    this.items = [];

    var
      itemList = GeoJSON.read(this.tileX*TILE_SIZE, this.tileY*TILE_SIZE, this.zoom, geojson),
      item, idColor,
      allVertices = [], allNormals = [], allColors = [], allIDColors = [];

    for (var i = 0, il = itemList.length; i < il; i++) {
      item = itemList[i];
      idColor = Interaction.idToColor(item.id);
      item.numVertices = item.vertices.length/3;

      for (var j = 0, jl = item.vertices.length-2; j < jl; j+=3) {
        allVertices.push(item.vertices[j], item.vertices[j+1], item.vertices[j+2]);
        allNormals.push(item.normals[j], item.normals[j+1], item.normals[j+2]);
        allIDColors.push(idColor.r, idColor.g, idColor.b);
      }

      delete item.vertices;
      delete item.normals;

      this.items.push(item);
    }

    this.vertexBuffer  = GL.createBuffer(3, new Float32Array(allVertices));
    this.normalBuffer  = GL.createBuffer(3, new Float32Array(allNormals));
    this.idColorBuffer = GL.createBuffer(3, new Uint8Array(allIDColors));

    this.modify(Data.modifier);

    geojson = null;
    itemList = null;
    allVertices = null;
    allNormals = null;
    allIDColors = null;

    this.isReady = true;
  },

  modify: function(callback) {
    if (!this.items) {
      return;
    }

    var allColors = [], item;
    for (var i = 0, il = this.items.length; i < il; i++) {
      item = this.items[i];
      callback(item);
      for (var j = 0, jl = item.numVertices; j < jl; j++) {
        allColors.push(item.color.r, item.color.g, item.color.b);
      }
    }

    this.colorBuffer = GL.createBuffer(3, new Uint8Array(allColors));
    allColors = null;
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
