
var DataTile = function(tileX, tileY, zoom) {
  this.tileX = tileX;
  this.tileY = tileY;
  this.zoom = zoom;

  Data.add(this);

  Events.on('modify', this.modify.bind(this));
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

    this.vertexBuffer  = new GL.Buffer(3, new Float32Array(allVertices));
    this.normalBuffer  = new GL.Buffer(3, new Float32Array(allNormals));
    this.idColorBuffer = new GL.Buffer(3, new Uint8Array(allIDColors));

    this.modify();

    geojson = null;
    itemList = null;
    allVertices = null;
    allNormals = null;
    allIDColors = null;

    this.isReady = true;
  },

  modify: function() {
    if (!this.items) {
      return;
    }

    var allColors = [];
    var hiddenStates = [];
    var clonedItem;
    for (var i = 0, il = this.items.length; i < il; i++) {
      clonedItem = Data.applyModifiers(this.items[i]);
      for (var j = 0, jl = clonedItem.numVertices; j < jl; j++) {
        allColors.push(clonedItem.color.r, clonedItem.color.g, clonedItem.color.b);
        hiddenStates.push(clonedItem.hidden ? 1 : 0);
      }
    }

    this.colorBuffer = new GL.Buffer(3, new Uint8Array(allColors));
    this.hiddenStatesBuffer = new GL.Buffer(1, new Float32Array(hiddenStates));
    allColors = null;
    hiddenStates = null;
    return this;
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
    if (this.isReady) {
      this.vertexBuffer.destroy();
      this.normalBuffer.destroy();
      this.colorBuffer.destroy();
      this.idColorBuffer.destroy();
      this.hiddenStatesBuffer.destroy();
    }

    if (this.request) {
      this.request.abort();
      this.request = null;
    }

    Data.remove(this);
  }
};
