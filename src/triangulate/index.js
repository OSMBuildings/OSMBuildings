
var triangulate = (function() {

  var
    DEFAULT_HEIGHT = 10,
    DEFAULT_COLOR = new Color('rgb(220, 210, 200)').toArray(),
    METERS_PER_LEVEL = 3;

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

  // number of windows per horizontal meter of building wall
  var WINDOWS_PER_METER = 0.5;

  // var EARTH_RADIUS_IN_METERS = 6378137;
  // var EARTH_CIRCUMFERENCE_IN_METERS = EARTH_RADIUS_IN_METERS * Math.PI * 2;
  // var METERS_PER_DEGREE_LATITUDE = EARTH_CIRCUMFERENCE_IN_METERS / 360;
  var METERS_PER_DEGREE_LATITUDE = 6378137 * Math.PI / 180;

  function triangulate(buffers, feature, origin, forcedColor, colorVariance) {
    // a single feature might split into several items
    var
      scale = [METERS_PER_DEGREE_LATITUDE*Math.cos(origin[1]/180*Math.PI), METERS_PER_DEGREE_LATITUDE],
      geometries = alignGeometry(feature.geometry),
      polygon;

    for (var i = 0, il = geometries.length; i<il; i++) {
      polygon = transform(geometries[i], origin, scale);
      addBuilding(buffers, feature.properties, polygon, forcedColor, colorVariance);
    }
  }

  //***************************************************************************

  // converts all coordinates of all rings in 'polygonRings' from lat/lon pairs to offsets from origin
  function transform(geometry, origin, scale) {
    return geometry.map(function(ring, i) {
      // outer ring (first ring) needs to be clockwise, inner rings
      // counter-clockwise. If they are not, make them by reverting order.
      if ((i === 0) !== isClockWise(ring)) {
        ring.reverse();
      }

      return ring.map(function(point) {
        return [
          (point[0]-origin[0])*scale[0],
          -(point[1]-origin[1])*scale[1]
        ];
      });
    });
  }

  function isClockWise(ring) {
    return 0 < ring.reduce(function(a, b, c, d) {
      return a + ((c < d.length - 1) ? (d[c+1][0] - b[0]) * (d[c+1][1] + b[1]) : 0);
    }, 0);
  }

  function getBBox(ring) {
    var
      x =  Infinity, y =  Infinity,
      X = -Infinity, Y = -Infinity;

    for (var i = 0; i < ring.length; i++) {
      x = Math.min(x, ring[i][0]);
      y = Math.min(y, ring[i][1]);

      X = Math.max(X, ring[i][0]);
      Y = Math.max(Y, ring[i][1]);
    }

    return { minX:x, minY:y, maxX:X, maxY:Y };
  }

  // TODO: handle GeometryCollection
  function alignGeometry(geometry) {
    switch (geometry.type) {
      case 'MultiPolygon': return geometry.coordinates;
      case 'Polygon': return [geometry.coordinates];
      default: return [];
    }
  }

  // TODO: colorVariance = (id/2%2 ? -1 : +1)*(id%2 ? 0.03 : 0.06)

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

  function varyColor(color, variance) {
    variance = variance || 0;
    var c = new Color(color).toArray();
    if (c === undefined) {
      c = DEFAULT_COLOR;
    }
    return [c[0]+variance, c[1]+variance, c[2]+variance];
  }

  //***************************************************************************

  // TODO: add floor polygons if items have a minHeight (or better: minHeight is greater than threshold)
  function addBuilding(buffers, properties, polygon, forcedColor, colorVariance) {
    var
      dim = getDimensions(properties, getBBox(polygon[0])),
      wallColor = varyColor((forcedColor || properties.wallColor || properties.color || getMaterialColor(properties.material)), colorVariance),
      roofColor = varyColor((forcedColor || properties.roofColor || getMaterialColor(properties.roofMaterial)), colorVariance);

    //*** process buildings that don't require a roof *************************

    switch (properties.shape) {
      case 'cone':
        split.cylinder(buffers, dim.center, dim.radius, 0, dim.wallHeight, dim.wallZ, wallColor);
        return;

      case 'dome':
        split.dome(buffers, dim.center, dim.radius, dim.wallHeight, dim.wallZ, wallColor);
        return;

      case 'pyramid':
        split.pyramid(buffers, polygon, dim.center, dim.wallHeight, dim.wallZ, wallColor);
        return;

      case 'sphere':
        split.sphere(buffers, dim.center, dim.radius, dim.wallHeight, dim.wallZ, wallColor);
        return;
    }

    //*** process roofs *******************************************************

    switch (properties.roofShape) {
      case 'cone':
        split.cylinder(buffers, dim.center, dim.radius, 0, dim.roofHeight, dim.roofZ, roofColor);
        break;

      case 'dome':
        split.dome(buffers, dim.center, dim.radius, dim.roofHeight, dim.roofZ, roofColor);
        break;

      case 'pyramid':
        if (properties.shape === 'cylinder') {
          split.cylinder(buffers, dim.center, dim.radius, 0, dim.roofHeight, dim.roofZ, roofColor);
        } else {
          split.pyramid(buffers, polygon, dim.center, dim.roofHeight, dim.roofZ, roofColor);
        }
        break;


//  var explicitRoofTagging = true;
//  if ((!properties.roofLines || properties.roofLines !== 'no') && this.building.hasComplexRoof) {
//    return new ComplexRoof();
//  }

      case 'skillion':
        addSkillionRoof(buffers, properties, polygon, dim, wallColor, roofColor);
        break; // no further processing

      case 'gabled':
        addRidgedRoof(buffers, properties, polygon, 0, dim, wallColor, roofColor);
        break;

      case 'hipped':
        addRidgedRoof(buffers, properties, polygon, 1/3, dim, wallColor, roofColor);
        break;

      case 'half-hipped':
        addRidgedRoof(buffers, properties, polygon, 0, dim, wallColor, roofColor);
        break;

      case 'gambrel':
     // addGambrelRoof(buffers, properties, polygon, dim, wallColor, roofColor);
        addRidgedRoof(buffers, properties, polygon, 0, dim, wallColor, roofColor);
        break;

      case 'mansard':
     // addMansardRoof(buffers, properties, polygon, dim, wallColor, roofColor);
        addRidgedRoof(buffers, properties, polygon, 0, dim, wallColor, roofColor);
        break;

      // case 'round':
      //   addRoundRoof(buffers, properties, polygon, dim, wallColor, roofColor);
      //   break;

      case 'onion':
        var rings = [
          { rScale: 1.0, hScale: 0.00 },
          { rScale: 0.8, hScale: 0.15 },
          { rScale: 1.0, hScale: 0.50 },
          { rScale: 0.8, hScale: 0.70 },
          { rScale: 0.4, hScale: 0.80 },
          { rScale: 0.0, hScale: 1.00 }
        ];

        var h1, h2;
        for (var i = 0, il = rings.length - 1; i<il; i++) {
          h1 = dim.roofHeight*rings[i].hScale;
          h2 = dim.roofHeight*rings[i + 1].hScale;
          split.cylinder(buffers, dim.center, dim.radius*rings[i].rScale, dim.radius*rings[i + 1].rScale, h2 - h1, dim.roofZ + h1, roofColor);
        }
        break;

      // case 'flat':
      default:
        if (properties.shape === 'cylinder') {
          split.circle(buffers, dim.center, dim.radius, dim.roofZ, roofColor);
        } else {
          split.polygon(buffers, polygon, dim.roofZ, roofColor);
        }
    }

    //*** process remaining buildings *****************************************

    switch(properties.roofShape) {
      case 'none':
        // no walls at all
        return;

      case 'cylinder':
        split.cylinder(buffers, dim.center, dim.radius, dim.radius, dim.wallHeight, dim.wallZ, wallColor);
        return;

      default: // extruded polygon
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
        split.extrusion(buffers, polygon, dim.wallHeight, dim.wallZ, wallColor, [0, WINDOWS_PER_METER, ty1/dim.wallHeight, ty2/dim.wallHeight]);
    }
  }

  function getDimensions(properties, bbox) {
    var dim = {};

    dim.center = [bbox.minX + (bbox.maxX - bbox.minX)/2, bbox.minY + (bbox.maxY - bbox.minY)/2];
    dim.radius = (bbox.maxX - bbox.minX)/2;

    //*** roof height *********************************************************

    dim.roofHeight = properties.roofHeight || (properties.roofLevels ? properties.roofLevels*METERS_PER_LEVEL : 0);

    switch (properties.roofShape) {
      case 'cone':
      case 'pyramid':
      case 'dome':
      case 'onion':
        dim.roofHeight = dim.roofHeight || 1*dim.radius;
        break;

      case 'gabled':
      case 'hipped':
      case 'half-hipped':
      case 'skillion':
      case 'gambrel':
      case 'mansard':
      case 'round':
         dim.roofHeight = dim.roofHeight || 1*METERS_PER_LEVEL;
         break;

      case 'flat':
        dim.roofHeight = 0;
        break;

      default:
        // roofs we don't handle should not affect wallHeight
        dim.roofHeight = 0;
    }

    //*** wall height *********************************************************

    var maxHeight;
    dim.wallZ = properties.minHeight || (properties.minLevel ? properties.minLevel*METERS_PER_LEVEL : 0);

    if (properties.height !== undefined) {
      maxHeight = properties.height;
      dim.roofHeight = Math.min(dim.roofHeight, maxHeight); // we don't want negative wall heights after subtraction
      dim.roofZ = maxHeight-dim.roofHeight;
      dim.wallHeight = maxHeight - dim.roofHeight - dim.wallZ;
    } else if (properties.levels !== undefined) {
      maxHeight = properties.levels*METERS_PER_LEVEL;
      // dim.roofHeight remains unchanged
      dim.roofZ = maxHeight;
      dim.wallHeight = maxHeight - dim.wallZ;
    } else {
      switch (properties.shape) {
        case 'cone':
        case 'dome':
        case 'pyramid':
          maxHeight = 2*dim.radius;
          dim.roofHeight = 0;
          break;

        case 'sphere':
          maxHeight = 4*dim.radius;
          dim.roofHeight = 0;
          break;

        // case 'none': // no walls at all
        // case 'cylinder':
        default:
          maxHeight = DEFAULT_HEIGHT;
      }
      dim.roofZ = maxHeight;
      dim.wallHeight = maxHeight - dim.wallZ;
    }

    return dim;
  }

  return triangulate;

}());
