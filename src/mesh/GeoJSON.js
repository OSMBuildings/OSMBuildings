
mesh.GeoJSON = (function() {

  var DEFAULT_HEIGHT = 10;

  // number of windows per horizontal meter of building wall
  var WINDOWS_PER_METER = 0.5;

  var DEFAULT_COLOR = 'rgb(220, 210, 200)';

  var METERS_PER_LEVEL = 3;

  var MATERIAL_COLORS = {
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

  var BASE_MATERIALS = {
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
    featuresPerChunk = 90,
    delayPerChunk = 75;

  function getMaterialColor(str) {
    if (typeof str !== 'string') {
      return null;
    }
    str = str.toLowerCase();
    if (str[0] === '#') {
      return str;
    }
    return MATERIAL_COLORS[BASE_MATERIALS[str] || str] || null;
  }

  function flattenGeometry(geometry) {
    // TODO: handle GeometryCollection
    switch (geometry.type) {
      case 'MultiPoint':
      case 'MultiLineString':
      case 'MultiPolygon':
        return geometry.coordinates;

      case 'Point':
      case 'LineString':
      case 'Polygon':
        return [geometry.coordinates];

      default:
        return [];
    }
  }

  // converts all coordinates of all rings in 'polygonRings' from lat/lon pairs to meters-from-position
  function transform(polygon, position) {
    var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(position.latitude / 180 * Math.PI);

    return polygon.map(function(ring, i) {
      // outer ring (first ring) needs to be clockwise, inner rings
      // counter-clockwise. If they are not, make them by reverting order.
      if ((i === 0) !== isClockWise(ring)) {
        ring.reverse();
      }

      return ring.map(function(point) {
        return [
           (point[0]-position.longitude) * metersPerDegreeLongitude,
          -(point[1]-position.latitude)  * METERS_PER_DEGREE_LATITUDE
        ];
      });
    });
  }

  //***************************************************************************

  function constructor(url, options) {
    options = options || {};

    this.id = options.id;
    this.color = options.color;
    this.colorizer = options.colorizer;

    this.replace   = !!options.replace;
    this.scale     = options.scale     || 1;
    this.rotation  = options.rotation  || 0;
    this.elevation = options.elevation || 0;

    this.minZoom = parseFloat(options.minZoom) || APP.minZoom;
    this.maxZoom = parseFloat(options.maxZoom) || APP.maxZoom;
    if (this.maxZoom < this.minZoom) {
      this.maxZoom = this.minZoom;
    }

    this.data = {
      vertices: [],
      texCoords: [],
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

      this.items = [];

      var
        startIndex = 0,
        dataLength = json.features.length,
        endIndex = startIndex + Math.min(dataLength, featuresPerChunk);

      var process = function() {
        var feature, geometries;
        for (var i = startIndex; i < endIndex; i++) {
          feature = json.features[i];
          geometries = flattenGeometry(feature.geometry);

          if (this.position === undefined) {
            // schema: geometries[polygon][ring][point][lat/lon]
            this.position = { latitude:geometries[0][0][0][1], longitude:geometries[0][0][0][0] };
          }

          for (var j = 0, jl = geometries.length; j < jl; j++) {
            this.addItem(feature.id, feature.properties, transform(geometries[j], this.position));
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
        roofHeight = properties.roofHeight || 3,

        colors = {
          wall: properties.wallColor || properties.color || getMaterialColor(properties.material),
          roof: properties.roofColor || properties.color || getMaterialColor(properties.roofMaterial)
        },

        i,
        skipWalls, skipRoof,
        vertexCount, vertexCountBefore, color,
        idColor = render.Picking.idToColor(id),
        colorVariance = (id/2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06),
        bbox = getBBox(geometry[0]),
        radius = (bbox.maxX - bbox.minX)/2,
        center = [bbox.minX + (bbox.maxX - bbox.minX)/2, bbox.minY + (bbox.maxY - bbox.minY)/2],
        H, Z;

      // add ID to item properties to allow user-defined colorizers to color
      // buildings based in their OSM ID
      properties.id = properties.id | id;

      //let user-defined colorizer overwrite the colors
      if (this.colorizer) {
        this.colorizer(properties, colors);
      }

      var wallColor = colors.wall;
      var roofColor = colors.roof;

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
          Triangulate.cylinder(this.data, center, radius, radius, H, Z);
          break;

        case 'cone':
          Triangulate.cylinder(this.data, center, radius, 0, H, Z);
          skipRoof = true;
          break;

        case 'dome':
          Triangulate.dome(this.data, center, radius, (H || radius), Z);
          break;

        case 'sphere':
          Triangulate.sphere(this.data, center, radius, (H || 2*radius), Z);
          break;

        case 'pyramid':
        case 'pyramidal':
          Triangulate.pyramid(this.data, geometry, center, H, Z);
          skipRoof = true;
          break;

        case 'none':
          skipWalls = true;
          break;

        default:
          var ty1 = 0.2;
          var ty2 = 0.4;

          // non-continuous windows
          if (properties.material !== 'glass') {
            ty1 = 0;
            ty2 = 0;
            if (properties.levels) {
              ty2 = (parseFloat(properties.levels) - parseFloat(properties.minLevel || 0)) <<0;
            }
          }

          Triangulate.extrusion(this.data, geometry, H, Z, [0, WINDOWS_PER_METER, ty1/H, ty2/H]);
      }

      if (!skipWalls) {
        vertexCount = (this.data.vertices.length - vertexCountBefore)/3;
        color = new Color(this.color || wallColor || DEFAULT_COLOR).toArray();
        for (i = 0; i<vertexCount; i++) {
          this.data.colors.push(color[0] + colorVariance, color[1] + colorVariance, color[2] + colorVariance);
          this.data.ids.push(idColor[0], idColor[1], idColor[2]);
        }

        this.items.push({ id: id, vertexCount: vertexCount, data: properties.data });
      }

      if (skipRoof) {
        return;
      }

      //****** roof ******

      H = roofHeight;
      Z = height;

      vertexCountBefore = this.data.vertices.length;
      switch (properties.roofShape) {
        case 'cone':
          Triangulate.cylinder(this.data, center, radius, 0, H, Z);
        break;

        case 'dome':
        case 'onion':
          Triangulate.dome(this.data, center, radius, (H || radius), Z);
        break;

        case 'pyramid':
        case 'pyramidal':
          if (properties.shape === 'cylinder') {
            Triangulate.cylinder(this.data, center, radius, 0, H, Z);
          } else {
            Triangulate.pyramid(this.data, geometry, center, H, Z);
          }
          break;

        //case 'skillion':
        //  // TODO: skillion
        //  Triangulate.polygon(this.data, geometry, Z);
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
        //  Triangulate.pyramid(this.data, geometry, center, H, Z);
        //break;

//      case 'flat':
        default:
          if (properties.shape === 'cylinder') {
            Triangulate.circle(this.data, center, radius, Z);
          } else {
            Triangulate.polygon(this.data, geometry, Z);
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
      this.vertexBuffer   = new glx.Buffer(3, new Float32Array(this.data.vertices));
      this.normalBuffer   = new glx.Buffer(3, new Float32Array(this.data.normals));
      this.texCoordBuffer = new glx.Buffer(2, new Float32Array(this.data.texCoords));
      this.colorBuffer    = new glx.Buffer(3, new Float32Array(this.data.colors));
      this.idBuffer       = new glx.Buffer(3, new Float32Array(this.data.ids));
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

      // this position is be available once geometry processing is complete.
      // should not be failing before because of this.isReady
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
