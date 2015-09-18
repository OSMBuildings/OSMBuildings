
mesh.GeoJSON = (function() {

  var
    zoom = 16,
    worldSize = TILE_SIZE <<zoom,
    featuresPerChunk = 150,
    delayPerChunk = 66;

  //***************************************************************************

  function isRotational(item, center) {
    var
      ring = item.geometry[0],
      length = ring.length;

    if (length < 16) {
      return false;
    }

    var
      width = item.max.x-item.min.x,
      height = item.max.y-item.min.y,
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

    this.id = options.id;
    if (options.color) {
      this.color = Color.parse(options.color).toRGBA(true);
    }

    this.replace   = !!options.replace;
    this.scale     = options.scale     || 1;
    this.rotation  = options.rotation  || 0;
    this.elevation = options.elevation || 0;
    this.position  = {};

    this.data = {
      vertices: [],
      normals: [],
      colors: [],
      idColors: []
    };

    Activity.setBusy();
    if (typeof url === 'object') {
      var json = url;
      this.onLoad(json);
    } else {
      this.request = Request.getJSON(url, function(json) {
        this.request = null;
        this.onLoad(json);
      }.bind(this));
    }
  }

  constructor.prototype = {

    onLoad: function(json) {
      if (!json || !json.features.length) {
        return;
      }

      var coordinates0 = json.features[0].geometry.coordinates[0][0];
      this.position = { latitude: coordinates0[1], longitude: coordinates0[0] };
      this.items = [];

      relax(function(startIndex, endIndex) {
        var features = json.features.slice(startIndex, endIndex);
        var geojson = { type: 'FeatureCollection', features: features };
        var data = GeoJSON.parse(this.position, worldSize, geojson);

        this.addItems(data);

        if (endIndex === json.features.length) {
          this.onReady();
        }
      }.bind(this), 0, json.features.length, featuresPerChunk, delayPerChunk);
    },

    addItems: function(items) {
      var
        item, color, idColor, center, radius,
        vertexCount,
        colorVariance,
        j;

      for (var i = 0, il = items.length; i < il; i++) {
        item = items[i];

//      item.numVertices = item.vertices.length/3;
//        this.items.push({ id:item.id, min:item.min, max:item.max });

        var id = this.id || item.id;

        idColor = Interaction.idToColor(id);
        colorVariance = (id/2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06);

        center = [item.min.x + (item.max.x - item.min.x)/2, item.min.y + (item.max.y - item.min.y)/2];

        //if ((item.roofShape === 'cone' || item.roofShape === 'dome') && !item.shape && isRotational(item, center)) {
        if (!item.shape && isRotational(item, center)) {
          item.shape = 'cylinder';
          item.isRotational = true;
        }

        if (item.isRotational) {
          radius = (item.max.x - item.min.x)/2;
        }

        switch (item.shape) {
          case 'cylinder': vertexCount = Triangulate.cylinder(this.data, center, radius, radius, item.minHeight, item.height); break;
          case 'cone':     vertexCount = Triangulate.cylinder(this.data, center, radius, 0, item.minHeight, item.height); break;
          case 'dome':     vertexCount = Triangulate.dome(this.data, center, radius, item.minHeight, item.height); break;
          case 'sphere':   vertexCount = Triangulate.cylinder(this.data, center, radius, radius, item.minHeight, item.height); break;
          case 'pyramid':  vertexCount = Triangulate.pyramid(this.data, item.geometry, center, item.minHeight, item.height); break;
          default:         vertexCount = Triangulate.extrusion(this.data, item.geometry, item.minHeight, item.height);
        }

        color = this.color || item.wallColor || DEFAULT_COLOR;
        for (j = 0; j < vertexCount; j++) {
          this.data.colors.push(color.r+colorVariance, color.g+colorVariance, color.b+colorVariance);
          this.data.idColors.push(idColor.r, idColor.g, idColor.b);
        }

        switch (item.roofShape) {
          case 'cone':     vertexCount = Triangulate.cylinder(this.data, center, radius, 0, item.height, item.height+item.roofHeight); break;
          case 'dome':     vertexCount = Triangulate.dome(this.data, center, radius, item.height, item.height + (item.roofHeight || radius)); break;
          case 'pyramid':  vertexCount = Triangulate.pyramid(this.data, item.geometry, center, item.height, item.height+item.roofHeight); break;
          default:
            if (item.shape === 'cylinder') {
              vertexCount = Triangulate.circle(this.data, center, radius, item.height);
            } else if (item.shape === undefined) {
              vertexCount = Triangulate.polygon(this.data, item.geometry, item.height);
            }
        }

        color = this.color || item.roofColor || DEFAULT_COLOR;
        for (j = 0; j < vertexCount; j++) {
          this.data.colors.push(color.r+colorVariance, color.g+colorVariance, color.b+colorVariance);
          this.data.idColors.push(idColor.r, idColor.g, idColor.b);
        }
      }
    },

//  modify: function() {
//    if (!this.items) {
//      return;
//    }
//
//    var item, hidden, visibilities = [];
//    for (var i = 0, il = this.items.length; i<il; i++) {
//      item = this.items[i];
        //hidden = data.Index.checkCollisions(item);
//        for (var j = 0, jl = item.numVertices; j<jl; j++) {
//          visibilities.push(item.hidden ? 1 : 0);
//        }
//    }
//
//    this.visibilityBuffer = new glx.Buffer(1, new Float32Array(visibilities));
//    visibilities = null;
//  },

    onReady: function() {
      //this.modify();

      this.vertexBuffer  = new glx.Buffer(3, new Float32Array(this.data.vertices));
      this.normalBuffer  = new glx.Buffer(3, new Float32Array(this.data.normals));
      this.colorBuffer   = new glx.Buffer(3, new Float32Array(this.data.colors));
      this.idColorBuffer = new glx.Buffer(3, new Float32Array(this.data.idColors));

      this.data = null;

      data.Index.add(this);
//    Events.on('modify', this.modify.bind(this));

      this.isReady = true;
      Activity.setIdle();
    },

    // TODO: switch to mesh.transform
    getMatrix: function() {
      var matrix = new glx.Matrix();

      if (this.elevation) {
        matrix.translate(0, 0, this.elevation);
      }

      var scale = 1 / Math.pow(2, zoom - MAP.zoom) * this.scale;
      matrix.scale(scale, scale, scale*HEIGHT_SCALE);

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
