
mesh.GeoJSON = (function() {

  var
    featuresPerChunk = 100,
    delayPerChunk = 66;

  //***************************************************************************

  function getGeometries(geometry, origin) {
    var i, il, polygonRings, sub;
    switch (geometry.type) {
      case 'GeometryCollection':
        var geometries = [];
        for (i = 0, il = geometry.geometries.length; i < il; i++) {
          if ((sub = getGeometries(geometry.geometries[i]))) {
            geometries.push.apply(geometries, sub);
          }
        }
        return geometries;

      case 'MultiPolygon':
        var polygons = [];
        for (i = 0, il = geometry.coordinates.length; i < il; i++) {
          if ((sub = getGeometries({ type: 'Polygon', coordinates: geometry.coordinates[i] }))) {
            polygons.push.apply(geometries, sub);
          }
        }
        return polygons;

      case 'Polygon':
        polygonRings = geometry.coordinates;
        break;

      default: return [];
    }

    var ring;
    var res = [];

    for (i = 0, il = polygonRings.length; i < il; i++) {
      if (!i) {
        ring = isClockWise(polygonRings[i]) ? polygonRings[i] : polygonRings[i].reverse();
      } else {
        ring = !isClockWise(polygonRings[i]) ? polygonRings[i] : polygonRings[i].reverse();
      }

      res[i] = transform(ring, origin);
    }

    return [res];
  }

  function transform(ring, origin) {
    var metersPerDegreeLatitude =  EARTH_CIRCUMFERENCE_IN_METERS / 360;
    var metersPerDegreeLongitude = EARTH_CIRCUMFERENCE_IN_METERS / 360 * 
                                   Math.cos(origin.latitude / 180 * Math.PI);

    var p, res = [];
    for (var i = 0, len = ring.length; i < len; i++) {
      res[i] = [ (ring[i][0] - origin.longitude) * metersPerDegreeLongitude,
                -(ring[i][1] - origin.latitude) * metersPerDegreeLatitude];
    }

    return res;
  }

  //***************************************************************************

  function constructor(url, options) {
    options = options || {};

    this.id = options.id;
    this.color = options.color;

    this.replace   = !!options.replace;
    this.scale     = options.scale     || 1;
    this.rotation  = options.rotation  || 0;
    this.elevation = options.elevation || 0;
    this.position  = {};

    this.minZoom = parseFloat(options.minZoom) || APP.minZoom;
    this.maxZoom = parseFloat(options.maxZoom) || APP.maxZoom;
    if (this.maxZoom < this.minZoom) {
      this.maxZoom = this.minZoom;
    }

    this.data = {
      vertices: [],
      normals: [],
      colors: [],
      ids: []
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

      var
        startIndex = 0,
        dataLength = json.features.length,
        endIndex = startIndex + Math.min(dataLength, featuresPerChunk);

      var process = function() {
        var feature, geometries;
        for (var i = startIndex; i < endIndex; i++) {
          feature = json.features[i];
          geometries = getGeometries(feature.geometry, this.position);

          for (var j = 0, jl = geometries.length; j < jl; j++) {
            this.addItem(feature.id, patch.GeoJSON(feature.properties), geometries[j]);
          }
        }

        if (endIndex === dataLength) {
          this.onReady();
          return;
        }

        startIndex = endIndex;
        endIndex = startIndex + Math.min((dataLength-startIndex), featuresPerChunk);

        this.relaxedProcessing = setTimeout(process, delayPerChunk);
      }.bind(this);

      process();
    },

    addItem: function(id, properties, geometry) {
      id = this.id || properties.relationId || id || properties.id;

      var
        i,
        skipRoof,
        vertexCount, color,
        idColor = render.Interaction.idToColor(id),
        colorVariance = (id/2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06),
        bbox = getBBox(geometry[0]),
        radius = (bbox.maxX - bbox.minX)/2,
        center = [bbox.minX + (bbox.maxX - bbox.minX)/2, bbox.minY + (bbox.maxY - bbox.minY)/2];

      // flat roofs or roofs we can't handle should not affect building's height
      switch (properties.roofShape) {
        case 'cone':
        case 'dome':
        case 'onion':
        case 'pyramid':
        case 'pyramidal':
          properties.height = Math.max(0, properties.height-(properties.roofHeight || 3));
        break;
        default:
          properties.roofHeight = 0;
      }

      //****** walls ******

      vertexCount = 0; // ensures there is no mess when walls or roofs are not drawn (b/c of unknown tagging)
      switch (properties.shape) {
        case 'cylinder':
          vertexCount = Triangulate.cylinder(this.data, center, radius, radius, properties.minHeight, properties.height);
        break;

        case 'cone':
          vertexCount = Triangulate.cylinder(this.data, center, radius, 0, properties.minHeight, properties.height);
          skipRoof = true;
        break;

        case 'dome':
          vertexCount = Triangulate.dome(this.data, center, radius, properties.minHeight, properties.height);
        break;

        case 'sphere':
          vertexCount = Triangulate.cylinder(this.data, center, radius, radius, properties.minHeight, properties.height);
        break;

        case 'pyramid':
        case 'pyramidal':
          vertexCount = Triangulate.cylinder(this.data, center, radius, radius, properties.minHeight, properties.height);
          skipRoof = true;
        break;

        default:
          if (isCircular(geometry[0], bbox, center)) {
            vertexCount = Triangulate.cylinder(this.data, center, radius, radius, properties.minHeight, properties.height);
          } else {
            vertexCount = Triangulate.extrusion(this.data, geometry, properties.minHeight, properties.height);
          }
      }

      color = new Color(this.color || properties.wallColor || DEFAULT_COLOR).toArray();
      for (i = 0; i < vertexCount; i++) {
        this.data.colors.push(color[0]+colorVariance, color[1]+colorVariance, color[2]+colorVariance);
        this.data.ids.push(idColor[0], idColor[1], idColor[2]);
      }

      this.items.push({ id:id, vertexCount:vertexCount, data:properties.data });

      //****** roof ******

      if (skipRoof) {
        return;
      }

      vertexCount = 0; // ensures there is no mess when walls or roofs are not drawn (b/c of unknown tagging)

      switch (properties.roofShape) {
        case 'cone':
          vertexCount = Triangulate.cylinder(this.data, center, radius, 0, properties.height, properties.height + properties.roofHeight);
        break;

        case 'dome':
        case 'onion':
          vertexCount = Triangulate.dome(this.data, center, radius, properties.height, properties.height + (properties.roofHeight || radius));
        break;

        case 'pyramid':
        case 'pyramidal':
          if (properties.shape === 'cylinder') {
            vertexCount = Triangulate.cylinder(this.data, center, radius, 0, properties.height, properties.height + properties.roofHeight);
          } else {
            vertexCount = Triangulate.pyramid(this.data, geometry, center, properties.height, properties.height + properties.roofHeight);
          }
          break;

        //case 'skillion':
        //  // TODO: skillion
        //  vertexCount = Triangulate.polygon(this.data, geometry, properties.height);
        //break;
        //
        //case 'gabled':
        //case 'hipped':
        //case 'half-hipped':
        //case 'gambrel':
        //case 'mansard':
        //case 'round':
        //case 'saltbox':
        //  // TODO: gabled
        //  vertexCount = Triangulate.pyramid(this.data, geometry, center, properties.height, properties.height + properties.roofHeight);
        //break;

//      case 'flat':
        default:
          if (properties.shape === 'cylinder') {
            vertexCount = Triangulate.circle(this.data, center, radius, properties.height);
          } else {
            vertexCount = Triangulate.polygon(this.data, geometry, properties.height);
          }
        }

      color = new Color(this.color || properties.roofColor || DEFAULT_COLOR).toArray();
      for (i = 0; i<vertexCount; i++) {
        this.data.colors.push(color[0] + colorVariance, color[1] + colorVariance, color[2] + colorVariance);
        this.data.ids.push(idColor[0], idColor[1], idColor[2]);
      }

      this.items.push({ id: id, vertexCount: vertexCount, data: properties.data });
    },

    fadeIn: function() {
      var item, filters = [];
      var start = Filter.time() + 250, end = start + 500;
      for (var i = 0, il = this.items.length; i < il; i++) {
        item = this.items[i];
        item.filter = [start, end, 0, 1];
        for (var j = 0, jl = item.vertexCount; j < jl; j++) {
          filters.push.apply(filters, item.filter);
        }
      }
      this.filterBuffer = new glx.Buffer(4, new Float32Array(filters));
    },

    applyFilter: function() {
      var item, filters = [];
      for (var i = 0, il = this.items.length; i < il; i++) {
        item = this.items[i];
        for (var j = 0, jl = item.vertexCount; j < jl; j++) {
          filters.push.apply(filters, item.filter);
        }
      }
      this.filterBuffer = new glx.Buffer(4, new Float32Array(filters));
    },

    onReady: function() {
      this.vertexBuffer = new glx.Buffer(3, new Float32Array(this.data.vertices));
      this.normalBuffer = new glx.Buffer(3, new Float32Array(this.data.normals));
      this.colorBuffer  = new glx.Buffer(3, new Float32Array(this.data.colors));
      this.idBuffer     = new glx.Buffer(3, new Float32Array(this.data.ids));
      this.fadeIn();
      this.data = null;

      Filter.apply(this);
      data.Index.add(this);

      this.isReady = true;
      Activity.setIdle();
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      var matrix = new glx.Matrix();

      if (this.elevation) {
        matrix.translate(0, 0, this.elevation);
      }

      matrix.scale(1, 1, HEIGHT_SCALE);

      if (this.rotation) {
        matrix.rotateZ(-this.rotation);
      }

      var dLat = this.position.latitude - MAP.center.latitude;
      var dLon = this.position.longitude - MAP.center.longitude;
      
      var metersPerDegreeLatitude = EARTH_CIRCUMFERENCE_IN_METERS / 360;
      var metersPerDegreeLongitude = EARTH_CIRCUMFERENCE_IN_METERS / 360 * 
                                     Math.cos(MAP.center.latitude / 180 * Math.PI);

      matrix.translate( dLon*metersPerDegreeLongitude, -dLat*metersPerDegreeLatitude, 0);
      
      return matrix;
    },

    destroy: function() {
      this.isReady = false;

      clearTimeout(this.relaxedProcessing);

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
