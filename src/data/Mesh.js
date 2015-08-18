
// TODO: when and how to destroy mesh?

var Mesh = function(data, position, options) {
  this.position = position;

  options = options || {};

  this.id        = options.id;
  this.scale     = options.scale     || 1;
  this.rotation  = options.rotation  || 0;
  this.elevation = options.elevation || 0;
  if (options.color) {
    this.color = Color.parse(options.color).toRGBA(true);
  }
  this.replaces  = options.replaces || [];

  this.createBuffers(data);

  // OBJ
  // this.inMeters = TILE_SIZE / (Math.cos(this.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);

  // object at lat position
  // var metersAtLatitude = (Math.cos(Map.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);
  // var pixelsAtZoom = TILE_SIZE * Math.pow(2, Map.zoom);
  // var scale = pixelsAtZoom / metersAtLatitude;

  // GeoJSON
  // this.zoom = 16;
  // this.inMeters = TILE_SIZE / (Math.cos(1) * EARTH_CIRCUMFERENCE);

  Data.add(this);
};

(function() {

  Mesh.prototype = {

    createBuffers: function(data) {
      var
        vertices = [], normals = [], colors = [], idColors = [],
        item, color, idColor, i, il, j, jl;

      for (i = 0, il = data.length; i<il; i++) {
        item = data[i];

        vertices.push.apply(vertices, item.vertices);
        normals.push.apply(normals, item.normals);

        color = this.color || item.color || DEFAULT_COLOR;
        idColor = Interaction.idToColor(this.id || item.id);
        for (j = 0, jl = item.vertices.length - 2; j<jl; j += 3) {
          colors.push(color.r, color.g, color.b);
          idColors.push(idColor.r, idColor.g, idColor.b);
        }
      }

      data = null;

      this.vertexBuffer  = new glx.Buffer(3, new Float32Array(vertices));
      this.normalBuffer  = new glx.Buffer(3, new Float32Array(normals));
      this.colorBuffer   = new glx.Buffer(3, new Float32Array(colors));
      this.idColorBuffer = new glx.Buffer(3, new Float32Array(idColors));

      vertices = null;
      normals = null;
      colors = null;
      idColors = null;
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

      if (this.rotation) {
        mMatrix.rotateZ(-this.rotation);
      }

      var
        position = project(this.position.latitude, this.position.longitude, TILE_SIZE*Math.pow(2, Map.zoom)),
        mapCenter = Map.center;

      mMatrix.translate(position.x-mapCenter.x, position.y-mapCenter.y, 0);

      return mMatrix;
    },

  //_replaceItems: function() {
    //  if (this.replaces.length) {
    //    var replaces = this.replaces;
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
    }
  };

}());
