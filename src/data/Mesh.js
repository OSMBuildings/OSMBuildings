
// TODO: when and how to destroy mesh?

var Mesh = function(data, position, options) {
  this.position = position;

  options = options || {};

  this.id        = options.id;
  this.scale     = options.scale     || 1;
  this.rotation  = options.rotation  || 0;
  this.elevation = options.elevation || 0;
  if (options.color) {
    this.color = Color.parse(options.color).toRGBA();
  }
  this.replaces  = options.replaces || [];

  this.items = []; // TODO: remove the need to keep items -> drop modifiers
  this.createBuffers(data);

  // OBJ
  // this.inMeters = TILE_SIZE / (Math.cos(this.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);

  // GeoJSON
  // this.zoom = 16;
  // this.inMeters = TILE_SIZE / (Math.cos(1) * EARTH_CIRCUMFERENCE);

  Data.add(this);
};

(function() {

  Mesh.prototype = {

    createBuffers: function(data) {
      var vertices = [], normals = [], colors = [], idColors = [];
      var item, idColor, i, il, j, jl;

      for (i = 0, il = data.length; i<il; i++) {
        item = data[i];
        item.color = this.color || item.color || DEFAULT_COLOR;
        item.id = this.id || item.id;
        item.numVertices = item.vertices.length/3;

        idColor = Interaction.idToColor(item.id);
        for (j = 0, jl = item.vertices.length - 2; j<jl; j += 3) {
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

      var
        newColors = [],
        newVisibilities = [];

      for (i = 0, il = this.items.length; i<il; i++) {
        item = this.items[i];
        for (j = 0, jl = item.numVertices; j<jl; j++) {
          newColors.push(item.color.r, item.color.g, item.color.b);
          newVisibilities.push(item.hidden ? 1 : 0);
        }
      }

      this.colorBuffer = new glx.Buffer(3, new Uint8Array(newColors));
      this.visibilityBuffer = new glx.Buffer(1, new Float32Array(newVisibilities));

      newColors = null;
      newVisibilities = null;

      vertices = null;
      normals = null;
      idColors = null;

      itemList = null;
    },

    // TODO: switch to mesh.transform
    getMatrix: function() {
      var mMatrix = new glx.Matrix();

      if (this.elevation) {
        mMatrix.translate(0, 0, this.elevation);
      }

      // GeoJSON
      this.zoom = 16;
      var scale = 1/Math.pow(2, this.zoom - Map.zoom) * this.scale;
      // OBJ
      // var scale = Math.pow(2, Map.zoom) * this.inMeters * this.scale;
      mMatrix.scale(scale, scale, scale*0.65);

      mMatrix.rotateZ(-this.rotation);

      var
        position = project(this.position.latitude, this.position.longitude, TILE_SIZE*Math.pow(2, Map.zoom)),
        mapCenter = Map.center;

      mMatrix.translate(position.x-mapCenter.x, position.y-mapCenter.y, 0);

      return mMatrix;
    },

  //_replaceItems: function() {
    //  if (this.replaces.length) {
    //    var replaces = this.replaces;
    //    Data.addModifier(function(item) {
    //      if (replaces.indexOf(item.id)>=0) {
    //        item.hidden = true;
    //      }
    //    });
    //  }
    //},

    destroy: function() {
      Data.remove(this);
      this.vertexBuffer.destroy();
      this.normalBuffer.destroy();
      this.colorBuffer.destroy();
      this.idColorBuffer.destroy();
      this.visibilityBuffer.destroy();
    }
  };

}());
