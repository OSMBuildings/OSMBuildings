
mesh.OBJ = (function() {

  function constructor(url, position, options) {
    options = options || {};

    this.id = options.id;
    if (options.color) {
      this.color = new Color(options.color).toArray();
    }

    this.replace   = !!options.replace;
    this.scale     = options.scale     || 1;
    this.rotation  = options.rotation  || 0;
    this.elevation = options.elevation || 0;
    this.position  = position;

    this.minZoom = parseFloat(options.minZoom) || APP.minZoom;
    this.maxZoom = parseFloat(options.maxZoom) || APP.maxZoom;
    if (this.maxZoom < this.minZoom) {
      this.maxZoom = this.minZoom;
    }

    this.inMeters = TILE_SIZE / (Math.cos(this.position.latitude*Math.PI/180) * EARTH_CIRCUMFERENCE);

    this.data = {
      vertices: [],
      normals: [],
      colors: [],
      ids: []
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
      var
        item, color, idColor, j, jl,
        id, colorVariance,
        defaultColor = new Color(DEFAULT_COLOR).toArray();

        for (var i = 0, il = items.length; i < il; i++) {
        item = items[i];

        this.data.vertices.push.apply(this.data.vertices, item.vertices);
        this.data.normals.push.apply(this.data.normals, item.normals);

        id = this.id || item.id;
        colorVariance = (id/2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06);
        color = this.color || item.color || defaultColor;
        idColor = render.Interaction.idToColor(id);
        for (j = 0, jl = item.vertices.length - 2; j<jl; j += 3) {
          this.data.colors.push(color[0]+colorVariance, color[1]+colorVariance, color[2]+colorVariance);
          this.data.ids.push(idColor[0], idColor[1], idColor[2]);
        }
      }
    },

    setColors: function() {
      var item;
      for (var i = 0, il = this.items.length; i < il; i++) {
        item = this.items[i];
        //hidden = data.Index.checkCollisions(item);
      }
    },

    onReady: function() {
      this.vertexBuffer = new glx.Buffer(3, new Float32Array(this.data.vertices));
      this.normalBuffer = new glx.Buffer(3, new Float32Array(this.data.normals));
      this.idBuffer     = new glx.Buffer(3, new Float32Array(this.data.ids));
      this.colorBuffer  = new glx.Buffer(3, new Float32Array(this.data.colors));

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

      var scale = Math.pow(2, MAP.zoom) * this.inMeters * this.scale;
      matrix.scale(scale, scale, scale);

      if (this.rotation) {
        matrix.rotateZ(-this.rotation);
      }

      var
        position = project(this.position.latitude, this.position.longitude, TILE_SIZE*Math.pow(2, MAP.zoom)),
        mapCenter = MAP.center;

      matrix.translate(position.x-mapCenter.x, position.y-mapCenter.y, 0);

      return matrix;
    },

    destroy: function() {
      data.Index.remove(this);

      if (this.request) {
        this.request.abort();
      }

      this.items = [];

      if (this.isReady) {
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
        this.colorBuffer.destroy();
        this.idBuffer.destroy();
      }
    }
  };

  return constructor;

}());
