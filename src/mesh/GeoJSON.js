
mesh.GeoJSON = (function() {

  var
    zoom = 16,
    worldSize = TILE_SIZE <<zoom,
    featuresPerChunk = 150,
    delayPerChunk = 66;

  //***************************************************************************

  function isRotational(coordinates, bbox, center) {
    var
      ring = coordinates[0],
      length = ring.length;

    if (length < 16) {
      return false;
    }

    var
      width = bbox.maxX-bbox.minX,
      height = bbox.maxY-bbox.minY,
      ratio = width/height;

    if (ratio < 0.85 || ratio > 1.15) {
      return false;
    }

    var
      radius = (width+height)/4,
      sqRadius = radius*radius,
      dist;


    for (var i = 0; i < length; i++) {
      dist = distance2(ring[i], center);
      if (dist/sqRadius < 0.75 || dist/sqRadius > 1.25) {
        return false;
      }
    }

    return true;
  }

  //***************************************************************************

  function constructor(url, options) {
    options = options || {};

    this._id = options.id;
    if (options.color) {
      this._color = Color.parse(options.color).toRGBA(true);
    }
    //this._replaces = options.replaces || [];

    this.scale     = options.scale     || 1;
    this.rotation  = options.rotation  || 0;
    this.elevation = options.elevation || 0;
    this.position  = {};

    this._data = {
      vertices: [],
      normals: [],
      colors: [],
      idColors: []
    };

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
      if (!json || !json.features.length) {
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
      var
        item, color, idColor, bbox, center, radius,
        vertexCount,
        j;

      for (var i = 0, il = items.length; i < il; i++) {
        item = items[i];

        idColor = Interaction.idToColor(this._id || item.id);

        bbox = getBBox(item.geometry);
        center = [bbox.minX + (bbox.maxX - bbox.minX)/2, bbox.minY + (bbox.maxY - bbox.minY)/2];

        //if ((item.roofShape === 'cone' || item.roofShape === 'dome') && !item.shape && isRotational(item.geometry, bbox, center)) {
        if (!item.shape && isRotational(item.geometry, bbox, center)) {
          item.shape = 'cylinder';
          item.isRotational = true;
        }

        if (item.isRotational) {
          radius = (bbox.maxX - bbox.minX)/2;
        }

        switch (item.shape) {
          case 'cylinder': vertexCount = Triangulate.cylinder(this._data, center, radius, radius, item.minHeight, item.height); break;
          case 'cone':     vertexCount = Triangulate.cylinder(this._data, center, radius, 0, item.minHeight, item.height); break;
          case 'dome':     vertexCount = Triangulate.dome(this._data, center, radius, item.minHeight, item.height); break;
          case 'sphere':   vertexCount = Triangulate.cylinder(this._data, center, radius, radius, item.minHeight, item.height); break;
          case 'pyramid':  vertexCount = Triangulate.pyramid(this._data, item.geometry, center, item.minHeight, item.height); break;
          default:         vertexCount = Triangulate.extrusion(this._data, item.geometry, item.minHeight, item.height);
        }

        color = this._color || item.wallColor || DEFAULT_COLOR;
        for (j = 0; j < vertexCount; j++) {
          this._data.colors.push(color.r, color.g, color.b);
          this._data.idColors.push(idColor.r/255, idColor.g/255, idColor.b/255);
        }

        switch (item.roofShape) {
          case 'cone':     vertexCount = Triangulate.cylinder(this._data, center, radius, 0, item.height, item.height+item.roofHeight); break;
          case 'dome':     vertexCount = Triangulate.dome(this._data, center, radius, item.height, item.height + (item.roofHeight || radius)); break;
          case 'pyramid':  vertexCount = Triangulate.pyramid(this._data, item.geometry, center, item.height, item.height+item.roofHeight); break;
          default:
            if (item.shape === 'cylinder') {
              vertexCount = Triangulate.circle(this._data, center, radius, item.height);
            } else if (item.shape === undefined) {
              vertexCount = Triangulate.polygon(this._data, item.geometry, item.height);
            }
        }

        color = this._color || item.roofColor || DEFAULT_COLOR;
        for (j = 0; j < vertexCount; j++) {
          this._data.colors.push(color.r, color.g, color.b);
          this._data.idColors.push(idColor.r/255, idColor.g/255, idColor.b/255);
        }
      }
    },

    _onReady: function() {
      this.vertexBuffer  = new glx.Buffer(3, new Float32Array(this._data.vertices));
      this.normalBuffer  = new glx.Buffer(3, new Float32Array(this._data.normals));
      this.colorBuffer   = new glx.Buffer(3, new Float32Array(this._data.colors));
      this.idColorBuffer = new glx.Buffer(3, new Float32Array(this._data.idColors));

      this._data = null;

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
      matrix.scale(scale, scale, scale*HEIGHT_SCALE);

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
