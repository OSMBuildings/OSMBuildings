
mesh.OBJ = (function() {

  function constructor(url, position, options) {
    options = options || {};

    this._id = options.id;
    if (options.color) {
      this._color = Color.parse(options.color).toRGBA(true);
    }
    this.replaces  = options.replaces || [];

    this.scale     = options.scale     || 1;
    this.rotation  = options.rotation  || 0;
    this.elevation = options.elevation || 0;
    this.position  = position;

    this._inMeters = TILE_SIZE / (Math.cos(this.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);

    this._vertices = [];
    this._normals = [];
    this._colors = [];
    this._idColors = [];

    Activity.setBusy();
    this._request = Request.getText(url, function(obj) {
      this._request = null;
      var match;
      if ((match = obj.match(/^mtllib\s+(.*)$/m))) {
        this._request = Request.getText(url.replace(/[^\/]+$/, '') + match[1], function(mtl) {
          this._request = null;
          this._onLoad(obj, mtl);
        }.bind(this));
      } else {
        this._onLoad(obj, null);
      }
    }.bind(this));
  }

  constructor.prototype = {
    _onLoad: function(obj, mtl) {
      var data = new OBJ.parse(obj, mtl);
      this._addItems(data);
      this._onReady();
    },

    _addItems: function(items) {
      var item, color, idColor, j, jl;

      for (var i = 0, il = items.length; i<il; i++) {
        item = items[i];

        this._vertices.push.apply(this._vertices, item.vertices);
        this._normals.push.apply(this._normals, item.normals);

        color = this._color || item.color || DEFAULT_COLOR;
        idColor = Interaction.idToColor(this._id || item.id);

        for (j = 0, jl = item.vertices.length - 2; j<jl; j += 3) {
          this._colors.push(color.r, color.g, color.b);
          this._idColors.push(idColor.r/255, idColor.g/255, idColor.b/255);
        }
      }
    },

    _onReady: function() {
      this.vertexBuffer  = new glx.Buffer(3, new Float32Array(this._vertices));
      this.normalBuffer  = new glx.Buffer(3, new Float32Array(this._normals));
      this.colorBuffer   = new glx.Buffer(3, new Float32Array(this._colors));
      this.idColorBuffer = new glx.Buffer(3, new Float32Array(this._idColors));

      this._vertices = null;
      this._normals = null;
      this._colors = null;
      this._idColors = null;

      data.Index.add(this);
      this._isReady = true;

      Activity.setIdle();
    },

    // TODO: switch to mesh.transform
    getMatrix: function() {
      var matrix = new glx.Matrix();

      if (this.elevation) {
        matrix.translate(0, 0, this.elevation);
      }

      var scale = Math.pow(2, Map.zoom) * this._inMeters * this.scale;
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
      if (this._request) {
        this._request.abort();
      }

      if (this._isReady) {
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
