
mesh.GeoJSON = (function() {

  var
    zoom = 16,
    worldSize = TILE_SIZE <<zoom,
    featuresPerChunk = 100,
    delayPerChunk = 33;

  //***************************************************************************

  function constructor(url, options) {
    options = options || {};

    this._id = options.id;
    if (options.color) {
      this._color = Color.parse(options.color).toRGBA(true);
    }
    this._replaces = options.replaces || [];

    this.scale     = options.scale     || 1;
    this.rotation  = options.rotation  || 0;
    this.elevation = options.elevation || 0;
    this.position  = {};

    this._vertices = [];
    this._normals = [];
    this._colors = [];
    this._idColors = [];

    Activity.setBusy();
    if (typeof url === 'object') {
      var json = url;
      this._onLoad(json);
    } else {
      this._request = Request.getJSON(url, function(json) {
        this._request = null;
        this._onLoad(json);
      }.bind(this));
    }
  }

  constructor.prototype = {

    _onLoad: function(json) {
      if (!json.features.length) {
        return;
      }

      var coordinates0 = json.features[0].geometry.coordinates[0][0];
      this.position = { latitude: coordinates0[1], longitude: coordinates0[0] };

      relax(function(startIndex, endIndex) {
        var features = json.features.slice(startIndex, endIndex);
        var geojson = { type: 'FeatureCollection', features: features };
        var data = GeoJSON.parse(this.position, worldSize, geojson);

        this._addItems(data);

        if (endIndex === json.features.length) {
          this._onReady();
        }
      }.bind(this), 0, json.features.length, featuresPerChunk, delayPerChunk);
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
          this._idColors.push(idColor.r, idColor.g, idColor.b);
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

      var scale = 1 / Math.pow(2, zoom - Map.zoom) * this.scale;
      matrix.scale(scale, scale, scale*0.7);

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
