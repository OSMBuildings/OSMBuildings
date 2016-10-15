
mesh.GeoJSON = (function() {

  var FEATURES_PER_CHUNK = 90;
  var DELAY_PER_CHUNK = 75;

  function constructor(url, options) {
    options = options || {};

    this.forcedId = options.id;
    // no Color.toArray() needed as Triangulation does it internally
    this.forcedColor = options.color;

    this.replace      = !!options.replace;
    this.scale        = options.scale     || 1;
    this.rotation     = options.rotation  || 0;
    this.elevation    = options.elevation || 0;
    this.shouldFadeIn = 'fadeIn' in options ? !!options.fadeIn : true;

    this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), APP.minZoom);
    this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), APP.maxZoom);
    if (this.maxZoom < this.minZoom) {
      this.minZoom = MIN_ZOOM;
      this.maxZoom = MAX_ZOOM;
    }

    this.items = [];

    Activity.setBusy();
    if (typeof url === 'object') {
      var collection = url;
      this.setData(collection);
    } else {
      this.request = Request.getJSON(url, function(collection) {
        this.request = null;
        this.setData(collection);
      }.bind(this));
    }
  }

  constructor.prototype = {

    setData: function(collection) {
      if (!collection || !collection.features.length) {
        return;
      }

      var res = {
        vertices: [],
        texCoords: [],
        normals: [],
        colors: []
      };

      var
        resPickingColors = [],
        position = this.getOrigin(collection.features[0].geometry),
        feature, id, properties,
        vertexCountBefore, vertexCount, pickingColor,
        startIndex = 0,
        numFeatures = collection.features.length,
        endIndex = startIndex + Math.min(numFeatures, FEATURES_PER_CHUNK);

      this.position = { latitude:position[1], longitude:position[0] };

      var process = function() {
        for (var i = startIndex; i < endIndex; i++) {
          feature = collection.features[i];

          /**
           * Fired when a 3d object has been loaded
           * @event OSMBuildings#loadfeature
           */
          APP.emit('loadfeature', feature);
          
          properties = feature.properties;
          id = this.forcedId || properties.relationId || feature.id || properties.id;

          vertexCountBefore = res.vertices.length;

          triangulate(res, feature, position, this.forcedColor);

          vertexCount = (res.vertices.length - vertexCountBefore)/3;

          pickingColor = render.Picking.idToColor(id);
          for (var j = 0; j < vertexCount; j++) {
            [].push.apply(resPickingColors, pickingColor);
          }

          this.items.push({ id:id, vertexCount:vertexCount, data:properties.data });
        }

        if (endIndex === numFeatures) {
          this.vertexBuffer   = new GLX.Buffer(3, new Float32Array(res.vertices));
          this.normalBuffer   = new GLX.Buffer(3, new Float32Array(res.normals));
          this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(res.texCoords));
          this.colorBuffer    = new GLX.Buffer(3, new Float32Array(res.colors));
          this.idBuffer       = new GLX.Buffer(3, new Float32Array(resPickingColors));
          this.fadeIn();

          Filter.apply(this);
          data.Index.add(this);

          this.isReady = true;
          Activity.setIdle();

          return;
        }

        startIndex = endIndex;
        endIndex = startIndex + Math.min((numFeatures-startIndex), FEATURES_PER_CHUNK);

        this.relaxTimer = setTimeout(process, DELAY_PER_CHUNK);
      }.bind(this);

      process();
    },

    fadeIn: function() {
      var item, filters = [];
      var start = Filter.getTime(), end = start;
      if (this.shouldFadeIn) {
        start += 250;
        end += 750;
      }
      for (var i = 0, il = this.items.length; i < il; i++) {
        item = this.items[i];
        item.filter = [start, end, 0, 1];
        for (var j = 0, jl = item.vertexCount; j < jl; j++) {
          filters.push.apply(filters, item.filter);
        }
      }
      this.filterBuffer = new GLX.Buffer(4, new Float32Array(filters));
    },

    applyFilter: function() {
      var item, filters = [];
      for (var i = 0, il = this.items.length; i < il; i++) {
        item = this.items[i];
        for (var j = 0, jl = item.vertexCount; j < jl; j++) {
          filters.push.apply(filters, item.filter);
        }
      }
      this.filterBuffer = new GLX.Buffer(4, new Float32Array(filters));
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      var matrix = new GLX.Matrix();

      if (this.elevation) {
        matrix.translate(0, 0, this.elevation);
      }

      matrix.scale(this.scale, this.scale, this.scale*HEIGHT_SCALE);

      if (this.rotation) {
        matrix.rotateZ(-this.rotation);
      }

      // this position is available once geometry processing is complete.
      // should not be failing before because of this.isReady
      var dLat = this.position.latitude - APP.position.latitude;
      var dLon = this.position.longitude - APP.position.longitude;

      var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);

      matrix.translate( dLon*metersPerDegreeLongitude, -dLat*METERS_PER_DEGREE_LATITUDE, 0);

      return matrix;
    },

    getOrigin: function(geometry) {
      var coordinates = geometry.coordinates;
      switch (geometry.type) {
        case 'Point':
          return coordinates;

        case 'MultiPoint':
        case 'LineString':
          return coordinates[0];

        case 'MultiLineString':
        case 'Polygon':
          return coordinates[0][0];

        case 'MultiPolygon':
          return coordinates[0][0][0];
      }
    },

    destroy: function() {
      this.isReady = false;

      clearTimeout(this.relaxTimer);

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
