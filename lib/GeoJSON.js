
// TODO: require Color.js

var GeoJSON = {};

(function() {

  //var EARTH_RADIUS_IN_METERS = 6378137;
  //var EARTH_CIRCUMFERENCE_IN_METERS = EARTH_RADIUS_IN_METERS * Math.PI * 2;
  //var METERS_PER_DEGREE_LATITUDE = EARTH_CIRCUMFERENCE_IN_METERS / 360;

  var METERS_PER_DEGREE_LATITUDE = 6378137 * Math.PI / 180;

  var DEFAULT_HEIGHT = 10;
  var DEFAULT_ROOF_HEIGHT = 3;
  var DEFAULT_COLOR = 'rgb(220, 210, 200)';

  // number of windows per horizontal meter of building wall
  var WINDOWS_PER_METER = 0.5;
  var METERS_PER_LEVEL = 3;

  var MATERIAL_COLORS = {
    brick: '#cc7755',
    bronze: '#ffeecc',
    canvas: '#fff8f0',
    concrete: '#999999',
    copper: '#a0e0d0',
    glass: '#e8f8f8',
    gold: '#ffcc00',
    plants: '#009933',
    metal: '#aaaaaa',
    panel: '#fff8f0',
    plaster: '#999999',
    roof_tiles: '#f08060',
    silver: '#cccccc',
    slate: '#666666',
    stone: '#996666',
    tar_paper: '#333333',
    wood: '#deb887'
  };

  var BASE_MATERIALS = {
    asphalt: 'tar_paper',
    bitumen: 'tar_paper',
    block: 'stone',
    bricks: 'brick',
    glas: 'glass',
    glassfront: 'glass',
    grass: 'plants',
    masonry: 'stone',
    granite: 'stone',
    panels: 'panel',
    paving_stones: 'stone',
    plastered: 'plaster',
    rooftiles: 'roof_tiles',
    roofingfelt: 'tar_paper',
    sandstone: 'stone',
    sheet: 'canvas',
    sheets: 'canvas',
    shingle: 'tar_paper',
    shingles: 'tar_paper',
    slates: 'slate',
    steel: 'metal',
    tar: 'tar_paper',
    tent: 'canvas',
    thatch: 'plants',
    tile: 'roof_tiles',
    tiles: 'roof_tiles'
    // cardboard
    // eternit
    // limestone
    // straw
  };

  GeoJSON.getPosition = function(geometry) {
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
  };

  GeoJSON.triangulate = function(res, id, feature, position, color) {
    var geometries = flattenGeometry(feature.geometry);
    for (var i = 0, il = geometries.length; i<il; i++) {
      process(res, id, feature.properties, geometries[i], position, color);
    }
  };

  function process(res, id, properties, geom, position, color) {
    var geometry = transform(geom, position),
      bbox = getBBox(geometry[0]),
      radius = (bbox.maxX - bbox.minX)/2,
      center = [bbox.minX + (bbox.maxX - bbox.minX)/2, bbox.minY + (bbox.maxY - bbox.minY)/2],

      height = properties.height || (properties.levels ? properties.levels*METERS_PER_LEVEL : DEFAULT_HEIGHT),
      minHeight = properties.minHeight || (properties.minLevel ? properties.minLevel*METERS_PER_LEVEL : 0),
      roofHeight = properties.roofHeight || DEFAULT_ROOF_HEIGHT,

      colorVariance = (id/2%2 ? -1 : +1)*(id%2 ? 0.03 : 0.06),
      roofColor = randomizeColor(color || properties.roofColor || properties.color || getMaterialColor(properties.roofMaterial), colorVariance),
      wallColor = randomizeColor(color || properties.wallColor || properties.color || getMaterialColor(properties.material), colorVariance);

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

    addWalls(res, properties, geometry, center, radius, height-minHeight, minHeight, wallColor);
    addRoof(res, properties, geometry, center, radius, roofHeight, height, roofColor);
  }

  function addWalls(res, properties, geometry, center, radius, H, Z, color) {
    switch (properties.shape) {
      case 'cylinder':
        Triangulate.cylinder(res, center, radius, radius, H, Z, color);
      break;

      case 'cone':
        Triangulate.cylinder(res, center, radius, 0, H, Z, color);
      break;

      case 'dome':
        Triangulate.dome(res, center, radius, (H || radius), Z, color);
      break;

      case 'sphere':
        Triangulate.sphere(res, center, radius, (H || 2*radius), Z, color);
      break;

      case 'pyramid':
      case 'pyramidal':
        Triangulate.pyramid(res, geometry, center, H, Z, color);
      break;

      case 'none':
        // skip walls entirely
        return;

      default:
        var ty1 = 0.2;
        var ty2 = 0.4;

        // non-continuous windows
        if (properties.material !== 'glass') {
          ty1 = 0;
          ty2 = 0;
          if (properties.levels) {
            ty2 = (parseFloat(properties.levels) - parseFloat(properties.minLevel || 0))<<0;
          }
        }

        Triangulate.extrusion(res, geometry, H, Z, color, [0, WINDOWS_PER_METER, ty1/H, ty2/H]);
    }
  }

  function addRoof(res, properties, geometry, center, radius, H, Z, color) {
    // skip roof entirely
    switch (properties.shape) {
      case 'cone':
      case 'pyramid':
      case 'pyramidal':
        return;
    }

    switch (properties.roofShape) {
      case 'cone':
        Triangulate.cylinder(res, center, radius, 0, H, Z, color);
        break;

      case 'dome':
      case 'onion':
        Triangulate.dome(res, center, radius, (H || radius), Z, color);
        break;

      case 'pyramid':
      case 'pyramidal':
        if (properties.shape === 'cylinder') {
          Triangulate.cylinder(res, center, radius, 0, H, Z, color);
        } else {
          Triangulate.pyramid(res, geometry, center, H, Z, color);
        }
        break;

      default:
        if (properties.shape === 'cylinder') {
          Triangulate.circle(res, center, radius, Z, color);
        } else {
          Triangulate.polygon(res, geometry, Z, color);
        }
    }
  }

  function randomizeColor(color, variance) {
    var c = new Color(color || DEFAULT_COLOR).toArray(); // TODO: don't parse default colors every time
    return [c[0]+variance, c[1]+variance, c[2]+variance];
  }

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
      case 'MultiPolygon': return geometry.coordinates;
      case 'Polygon': return [geometry.coordinates];
      default: return [];
    }
  }

  // converts all coordinates of all rings in 'polygonRings' from lat/lon pairs to meters-from-position
  function transform(polygon, position) {
    var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE*Math.cos(position[1]/180*Math.PI);

    return polygon.map(function(ring, i) {
      // outer ring (first ring) needs to be clockwise, inner rings
      // counter-clockwise. If they are not, make them by reverting order.
      if ((i === 0) !== isClockWise(ring)) {
        ring.reverse();
      }

      return ring.map(function(point) {
        return [
           (point[0]-position[0])*metersPerDegreeLongitude,
          -(point[1]-position[1])*METERS_PER_DEGREE_LATITUDE
        ];
      });
    });
  }

  function getBBox(polygon) {
    var
      x =  Infinity, y =  Infinity,
      X = -Infinity, Y = -Infinity;

    for (var i = 0; i < polygon.length; i++) {
      x = Math.min(x, polygon[i][0]);
      y = Math.min(y, polygon[i][1]);

      X = Math.max(X, polygon[i][0]);
      Y = Math.max(Y, polygon[i][1]);
    }

    return { minX:x, minY:y, maxX:X, maxY:Y };
  }

}());
