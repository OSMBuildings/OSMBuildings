
var Mesh = function(url, properties) {
  properties = properties || {};
  this.id = properties.id;

  this.position  = properties.position  || {};
  //this.scale     = properties.scale     || 1;
  this.rotation  = properties.rotation  || 0;
  this.elevation = properties.elevation || 0;

  this.color = properties.color ? Color.parse(properties.color).toRGBA() : DEFAULT_COLOR;
  this.replaces = properties.replaces  || [];

  // TODO: implement OBJ.request.abort()
  this.request = { abort: function() {} };
  OBJ.load(url, this.onLoad.bind(this));

  Data.add(this);

  Events.on('modify', this.modify.bind(this));
};

(function() {

  function createColors(num, color) {
    var colors = [], c = color ? color : { r:255*0.75, g:255*0.75, b:255*0.75 };
    for (var i = 0; i < num; i++) {
      colors.push(c.r, c.g, c.b);
    }
    return colors;
  }

  Mesh.prototype.onLoad = function(itemList) {
    this.request = null;
    this.items = [];

    var
      item, idColor,
      allVertices = [], allNormals = [], allColors = [], allIDColors = [];

    for (var i = 0, il = itemList.length; i < il; i++) {
      item = itemList[i];

      // given color has precedence
      item.color = this.color ? this.color : item.color;

      // given id has precedence
      item.id = this.id ? this.id : item.id;

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

    // replace original models
    var replaces = this.replaces || [];
    Data.addModifier(function(item) {
      if (replaces.indexOf(item.id) >= 0) {
        item.hidden = true;
      }
    });

    this.vertexBuffer  = new GL.Buffer(3, new Float32Array(allVertices));
    this.normalBuffer  = new GL.Buffer(3, new Float32Array(allNormals));
    this.idColorBuffer = new GL.Buffer(3, new Uint8Array(allIDColors));

    this.modify();

    itemList = null;
    allVertices = null;
    allNormals = null;
    allIDColors = null;

    this.isReady = true;
  };

  Mesh.prototype.getMatrix = function() {
    if (!this.isReady || !this.isVisible()) {
      return;
    }

    var R = 6378137;
    var C = R * Math.PI * 2;
    var scale = (Math.cos(this.position.latitude * Math.PI/180) * C) / (TILE_SIZE*Math.pow(2, Map.zoom));

    var
      ratio = 1 / scale,
      worldSize = TILE_SIZE*Math.pow(2, Map.zoom),
      position = project(this.position.latitude, this.position.longitude, worldSize),
      mapCenter = Map.center,
      mMatrix = Matrix.create();

    if (this.elevation) {
      mMatrix = Matrix.translate(mMatrix, 0, 0, this.elevation);
    }
    mMatrix = Matrix.scale(mMatrix, ratio, ratio, ratio*0.85);
    mMatrix = Matrix.rotateZ(mMatrix, -this.rotation);
    mMatrix = Matrix.translate(mMatrix, position.x-mapCenter.x, position.y-mapCenter.y, 0);

    return mMatrix;
  };

  Mesh.prototype.modify = function() {
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
  };

  Mesh.prototype.isVisible = function(key, buffer) {
    buffer = buffer || 0;
    return true;
  };

  Mesh.prototype.destroy = function() {
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
  };

}());
