
mesh.GeoJSON = (function() {

  var METERS_PER_LEVEL = 3;

  var materialColors = {
    brick:'#cc7755',
    bronze:'#ffeecc',
    canvas:'#fff8f0',
    concrete:'#999999',
    copper:'#a0e0d0',
    glass:'#e8f8f8',
    gold:'#ffcc00',
    plants:'#009933',
    metal:'#aaaaaa',
    panel:'#fff8f0',
    plaster:'#999999',
    roof_tiles:'#f08060',
    silver:'#cccccc',
    slate:'#666666',
    stone:'#996666',
    tar_paper:'#333333',
    wood:'#deb887'
  };

  var baseMaterials = {
    asphalt:'tar_paper',
    bitumen:'tar_paper',
    block:'stone',
    bricks:'brick',
    glas:'glass',
    glassfront:'glass',
    grass:'plants',
    masonry:'stone',
    granite:'stone',
    panels:'panel',
    paving_stones:'stone',
    plastered:'plaster',
    rooftiles:'roof_tiles',
    roofingfelt:'tar_paper',
    sandstone:'stone',
    sheet:'canvas',
    sheets:'canvas',
    shingle:'tar_paper',
    shingles:'tar_paper',
    slates:'slate',
    steel:'metal',
    tar:'tar_paper',
    tent:'canvas',
    thatch:'plants',
    tile:'roof_tiles',
    tiles:'roof_tiles'
    // cardboard
    // eternit
    // limestone
    // straw
  };

  var
    featuresPerChunk = 100,
    delayPerChunk = 66;

  function getMaterialColor(str) {
    if (typeof str !== 'string') {
      return null;
    }
    str = str.toLowerCase();
    if (str[0] === '#') {
      return str;
    }
    return materialColors[baseMaterials[str] || str] || null;
  }



  /* Converts a geometry of arbitrary type (GeometryCollection, MultiPolygon or Polygon)
   * to an array of Polygons.
   */
  function flattenGeometryHierarchy(geometry, origin) {
    switch (geometry.type) {
      case 'GeometryCollection':
        return geometry.geometries.map(function(geometry) {
          return flattenGeometryHierarchy(geometry.geometries[i]);
        });

      case 'MultiPolygon':
        return geometry.coordinates.map(function(polygon) {
          return flattenGeometryHierarchy({ type: 'Polygon', coordinates: polygon });
        });

      case 'Polygon':
        return transformPolygon(geometry.coordinates, origin);

      default:
        return [];
    }
  }

  // converts all coordinates of all rings in 'polygonRings' from lat/lng pairs
  // to meters-from-origin.
  function transformPolygon(polygonRings, origin) {
    var res = polygonRings.map(function(ring, ringIndex) {
      // outer rings (== the first ring) need to be clockwise, inner rings
      // counter-clockwise. If they are not, make them by reversing them.
      if ((ringIndex === 0) !== isClockWise(ring)) {
        ring.reverse();
      }
      return transform(ring, origin);
    });
    return [res];
  }

  // converts all coordinates of 'ring' from lat/lng to 'meters from reference point'
  function transform(ring, origin) {
    var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(origin.latitude / 180 * Math.PI);

    var p, res = [];
    for (var i = 0, len = ring.length; i < len; i++) {
      res[i] = [
         (ring[i][0]-origin.longitude) * metersPerDegreeLongitude,
        -(ring[i][1]-origin.latitude)  * METERS_PER_DEGREE_LATITUDE
      ];
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
          geometries = flattenGeometryHierarchy(feature.geometry, this.position)
            .filter(function(ring) {
              return ring.length > 0;
            });

          for (var j = 0, jl = geometries.length; j < jl; j++) {
            this.addItem(feature.id, feature.properties, geometries[j]);
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
        height    = properties.height    || (properties.levels   ? properties.levels  *METERS_PER_LEVEL : DEFAULT_HEIGHT),
        minHeight = properties.minHeight || (properties.minLevel ? properties.minLevel*METERS_PER_LEVEL : 0),
        roofHeight = properties.roofHeight ||  3,

        wallColor = properties.wallColor || properties.color || getMaterialColor(properties.material),
        roofColor = properties.roofColor || properties.color || getMaterialColor(properties.roofMaterial),

        i,
        skipRoof,
        vertexCount, vertexCountBefore, color,
        idColor = render.Interaction.idToColor(id),
        colorVariance = (id/2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06),
        bbox = getBBox(geometry[0]),
        radius = (bbox.maxX - bbox.minX)/2,
        center = [bbox.minX + (bbox.maxX - bbox.minX)/2, bbox.minY + (bbox.maxY - bbox.minY)/2],
        H, Z;

      // flat roofs or roofs we can't handle should not affect building's height
      switch (properties.roofShape) {
        case 'cone':
        case 'dome':
        case 'onion':
        case 'pyramid':
        case 'pyramidal':
          height = Math.max(0, height-roofHeight);
        break;
        default:
          roofHeight = 0;
      }

      //****** walls ******

      H = height-minHeight;
      Z = minHeight;

      vertexCountBefore = this.data.vertices.length;
      switch (properties.shape) {
        case 'cylinder':
          mesh.addCylinder(this.data, center, radius, radius, H, Z);
        break;

        case 'cone':
          mesh.addCylinder(this.data, center, radius, 0, H, Z);
          skipRoof = true;
        break;

        case 'dome':
          mesh.addDome(this.data, center, radius, (H || radius), Z);
        break;

        case 'sphere':
          mesh.addSphere(this.data, center, radius, (H || 2*radius), Z);
        break;

        case 'pyramid':
        case 'pyramidal':
          mesh.addPyramid(this.data, geometry, center, H, Z);
          skipRoof = true;
        break;

        default:
          mesh.addExtrusion(this.data, geometry, H, Z);
      }

      vertexCount = (this.data.vertices.length-vertexCountBefore)/3;
      color = new Color(this.color || wallColor || DEFAULT_COLOR).toArray();
      for (i = 0; i < vertexCount; i++) {
        this.data.colors.push(color[0]+colorVariance, color[1]+colorVariance, color[2]+colorVariance);
        this.data.ids.push(idColor[0], idColor[1], idColor[2]);
      }

      this.items.push({ id:id, vertexCount:vertexCount, data:properties.data });

      //****** roof ******

      if (skipRoof) {
        return;
      }

      H = roofHeight;
      Z = height;

      vertexCountBefore = this.data.vertices.length;
      switch (properties.roofShape) {
        case 'cone':
          mesh.addCylinder(this.data, center, radius, 0, H, Z);
        break;

        case 'dome':
        case 'onion':
          mesh.addDome(this.data, center, radius, (H || radius), Z);
        break;

        case 'pyramid':
        case 'pyramidal':
          if (properties.shape === 'cylinder') {
            mesh.addCylinder(this.data, center, radius, 0, H, Z);
          } else {
            mesh.addPyramid(this.data, geometry, center, H, Z);
          }
          break;

        //case 'skillion':
        //  // TODO: skillion
        //  mesh.addPolygon(this.data, geometry, Z);
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
        //  mesh.addPyramid(this.data, geometry, center, H, Z);
        //break;

//      case 'flat':
        default:
          if (properties.shape === 'cylinder') {
            mesh.addCircle(this.data, center, radius, Z);
          } else {
            mesh.addPolygon(this.data, geometry, Z);
          }
      }

      vertexCount = (this.data.vertices.length-vertexCountBefore)/3;
      color = new Color(this.color || roofColor || DEFAULT_COLOR).toArray();
      for (i = 0; i<vertexCount; i++) {
        this.data.colors.push(color[0] + colorVariance, color[1] + colorVariance, color[2] + colorVariance);
        this.data.ids.push(idColor[0], idColor[1], idColor[2]);
      }

      this.items.push({ id: id, vertexCount: vertexCount, data: properties.data });
    },

    fadeIn: function() {
      var item, filters = [];
      var start = Filter.getTime() + 250, end = start + 500;
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

      matrix.scale(this.scale, this.scale, this.scale*HEIGHT_SCALE);

      if (this.rotation) {
        matrix.rotateZ(-this.rotation);
      }

      var dLat = this.position.latitude - MAP.position.latitude;
      var dLon = this.position.longitude - MAP.position.longitude;
      
      var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(MAP.position.latitude / 180 * Math.PI);

      matrix.translate( dLon*metersPerDegreeLongitude, -dLat*METERS_PER_DEGREE_LATITUDE, 0);
      
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
