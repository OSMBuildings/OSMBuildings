
mesh.OBJ = (function() {

  function constructor(url, position, options) {
    options = options || {};

    this.id = options.id;
    if (options.color) {
      this.color = Color.parse(options.color).toRGBA(true);
    }

    this.replace   = !!options.replace;
    this.scale     = options.scale     || 1;
    this.rotation  = options.rotation  || 0;
    this.elevation = options.elevation || 0;
    this.position  = position;

    this.inMeters = TILE_SIZE / (Math.cos(this.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);

    this.data = {
      vertices: [],
      normals: [],
      colors: [],
      idColors: []
    };

    Activity.setBusy();
    this.request = Request.getText(url, function(obj) {
      this.request = null;
      var match;
      if ((match = obj.match(/^mtllib\s+(.*)$/m))) {
        this.request = Request.getText(url.replace(/[^\/]+$/, '') + match[1], function(mtl) {
          this.request = null;
          this.onLoad(obj, mtl);
        }.bind(this));
      } else {
        this.onLoad(obj, null);
      }
    }.bind(this));
  }

  constructor.prototype = {
    onLoad: function(obj, mtl) {
      var data = new OBJ.parse(obj, mtl);
      this.items = [];
      this.addItems(data);
      this.onReady();
    },

    addItems: function(items) {
      var item, color, idColor, j, jl;

      for (var i = 0, il = items.length; i < il; i++) {
        item = items[i];

//      item.numVertices = item.vertices.length/3;
        this.items.push(item);

        this.data.vertices.push.apply(this.data.vertices, item.vertices);
        this.data.normals.push.apply(this.data.normals, item.normals);

        color = this.color || item.color || DEFAULT_COLOR;
        idColor = Interaction.idToColor(this.id || item.id);
        for (j = 0, jl = item.vertices.length - 2; j<jl; j += 3) {
          this.data.colors.push(color.r, color.g, color.b);
          this.data.idColors.push(idColor.r, idColor.g, idColor.b);
        }
      }
    },

    modify: function() {
      if (!this.items) {
        return;
      }

      var item, visibilities = [];
      for (var i = 0, il = this.items.length; i<il; i++) {
        item = this.items[i];
//        Data.applyModifiers(item);
//        for (var j = 0, jl = item.numVertices; j<jl; j++) {
//          newVisibilities.push(item.hidden ? 1 : 0);
//        }
      }

      this.visibilityBuffer = new glx.Buffer(1, new Float32Array(visibilities));
      visibilities = null;
    },

    onReady: function() {
      this.modify();

      this.vertexBuffer  = new glx.Buffer(3, new Float32Array(this.data.vertices));
      this.normalBuffer  = new glx.Buffer(3, new Float32Array(this.data.normals));
      this.colorBuffer   = new glx.Buffer(3, new Float32Array(this.data.colors));
      this.idColorBuffer = new glx.Buffer(3, new Float32Array(this.data.idColors));

      this.data = null;

      data.Index.add(this);
      this.isReady = true;

      Activity.setIdle();
    },

    // TODO: switch to mesh.transform
    getMatrix: function() {
      var matrix = new glx.Matrix();

      if (this.elevation) {
        matrix.translate(0, 0, this.elevation);
      }

      var scale = Math.pow(2, Map.zoom) * this.inMeters * this.scale;
      matrix.scale(scale, scale, scale);

      if (this.rotation) {
        matrix.rotateZ(-this.rotation);
      }

      var
        position = project(this.position.latitude, this.position.longitude, TILE_SIZE*Math.pow(2, Map.zoom)),
        mapCenter = Map.center;

      matrix.translate(position.x-mapCenter.x, position.y-mapCenter.y, 0);

      return matrix;
    },

    destroy: function() {
      if (this.request) {
        this.request.abort();
      }

      this.items = null;

      if (this.isReady) {
        data.Index.remove(this);
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
        this.colorBuffer.destroy();
        this.idColorBuffer.destroy();
      }
    }
  };

  return constructor;

}());
