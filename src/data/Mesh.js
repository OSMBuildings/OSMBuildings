
var Mesh = function(data, options) {
  options = options || {};

  this.isReady = false;

  this.id        = options.id;
  this.position  = options.position  || {};
  this.scale     = options.scale     || 1;
  this.rotation  = options.rotation  || 0;
  this.elevation = options.elevation || 0;
  if (options.color) {
    this.color = Color.parse(options.color).toRGBA();
  }
  this.replaces  = options.replaces || [];

  Data.add(this);
  Events.on('modify', this.modify.bind(this));

  this.createBuffers(data);
};

(function() {

  Mesh.prototype = {

    createBuffers: function(data) {
      this.items = [];

      var vertices = [], normals = [], colors = [], idColors = [];
      var item, idColor, j, jl;

      for (var i = 0, il = data.length; i<il; i++) {
        item = data[i];
        item.color = this.color || item.color || DEFAULT_COLOR;
        item.id = this.id || item.id;
        item.numVertices = item.vertices.length/3;

        idColor = Interaction.idToColor(item.id);
        for (j = 0, jl = item.vertices.length - 2; j<jl; j += 3) {
//          vertices.push(item.vertices[j], item.vertices[j + 1], item.vertices[j + 2]);
//          normals.push(item.normals[j], item.normals[j + 1], item.normals[j + 2]);
          idColors.push(idColor.r, idColor.g, idColor.b);
        }

        vertices.push.apply(vertices, item.vertices);
        normals.push.apply(normals, item.normals);

        delete item.vertices;
        delete item.normals;

        this.items.push(item);
      }

      this.vertexBuffer = new glx.Buffer(3, new Float32Array(vertices));
      this.normalBuffer = new glx.Buffer(3, new Float32Array(normals));
      this.idColorBuffer = new glx.Buffer(3, new Uint8Array(idColors));

      this.modify();

      vertices = null;
      normals = null;
      idColors = null;

      itemList = null;
    },

    _replaceItems: function() {
      if (this.replaces.length) {
        var replaces = this.replaces;
        Data.addModifier(function(item) {
          if (replaces.indexOf(item.id)>=0) {
            item.hidden = true;
          }
        });
      }
    },

    modify: function() {
      if (!this.items) {
        return;
      }

      var
        newColors = [],
        newVisibilities = [],
        clonedItem;

      for (var i = 0, il = this.items.length; i<il; i++) {
        clonedItem = Data.applyModifiers(this.items[i]);
        for (var j = 0, jl = clonedItem.numVertices; j<jl; j++) {
          newColors.push(clonedItem.color.r, clonedItem.color.g, clonedItem.color.b);
          newVisibilities.push(clonedItem.hidden ? 1 : 0);
        }
      }

      this.colorBuffer = new glx.Buffer(3, new Uint8Array(newColors));
      this.visibilityBuffer = new glx.Buffer(1, new Float32Array(newVisibilities));

      newColors = null;
      newVisibilities = null;

      return this;
    },

    destroy: function() {
      Data.remove(this);

      if (this.isReady) {
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
        this.colorBuffer.destroy();
        this.idColorBuffer.destroy();
        this.visibilityBuffer.destroy();
      }

      if (this.request) {
        this.request.abort();
        this.request = null;
      }
    }
  };

}());





//
//
//// when and how to destroy mesh?
//
//var GeoJSONMesh = function(json, options) {
//  Mesh.call(this, options);
//  this.zoom = 16;
////this.inMeters = TILE_SIZE / (Math.cos(1) * EARTH_CIRCUMFERENCE);
//};
//


//relax(function(startIndex, endIndex) {
//  var
//    features = json.features.slice(startIndex, endIndex),
//    geojson = { type: 'FeatureCollection', features: features },
//    position = features[0].geometry.coordinates[0][0],
//    origin = project(position[1], position[0], TILE_SIZE<<this.zoom),
//    items = GeoJSON.parse(origin.x, origin.y, this.zoom, geojson);
//
//  if (!items.length) {
//    return;
//  }
//
//  this.position = { latitude: position[1], longitude: position[0] };
//  this._setItems(items);
//  this._replaceItems();


//(function() {
//
//  GeoJSONMesh.prototype = Object.create(Mesh.prototype);
//
//  GeoJSONMesh.prototype.getMatrix = function() {
//    var mMatrix = new glx.Matrix();
//
//    if (this.elevation) {
//      mMatrix.translate(0, 0, this.elevation);
//    }
//
//    var scale = 1/Math.pow(2, this.zoom - Map.zoom) * this.scale;
//    mMatrix.scale(scale, scale, scale*0.65);
//
//    mMatrix.rotateZ(-this.rotation);
//
//    var
//      position = project(this.position.latitude, this.position.longitude, TILE_SIZE*Math.pow(2, Map.zoom)),
//      mapCenter = Map.center;
//
//    mMatrix.translate(position.x-mapCenter.x, position.y-mapCenter.y, 0);
//
//    return mMatrix;
//  };
//
//}());
//
//
//
//
//var OBJMesh = function(str, options) {
//  options = options || {};
//  Mesh.call(this, options);
//  this.inMeters = TILE_SIZE / (Math.cos(this.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);
//
//  OBJ.parse(str, options.mtl, function(items) {
//    this._setItems(items);
//    this._replaceItems();
//  }.bind(this));
//};
//
//(function() {
//
//  OBJMesh.prototype = Object.create(Mesh.prototype);
//
//  OBJMesh.prototype.getMatrix = function() {
//    var mMatrix = new glx.Matrix();
//
//    if (this.elevation) {
//      mMatrix.translate(0, 0, this.elevation);
//    }
//
//    var scale = Math.pow(2, Map.zoom) * this.inMeters * this.scale;
//    mMatrix.scale(scale, scale, scale);
//
//    mMatrix.rotateZ(-this.rotation);
//
//    var
//      position = project(this.position.latitude, this.position.longitude, TILE_SIZE*Math.pow(2, Map.zoom)),
//      mapCenter = Map.center;
//
//    mMatrix.translate(position.x-mapCenter.x, position.y-mapCenter.y, 0);
//
//    return mMatrix;
//  };
//
//}());
