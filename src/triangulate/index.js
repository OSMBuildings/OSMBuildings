
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
      geometry;

    for (var i = 0, il = geometries.length; i<il; i++) {
      geometry = transform(geometries[i], origin, scale);
      addBuilding(buffers, feature.properties, geometry, forcedColor, colorVariance);
    }
  }

  //***************************************************************************

  // converts all coordinates of all rings in 'polygonRings' from lat/lon pairs to offsets from origin
  function transform(polygon, origin, scale) {
    return polygon.map(function(ring, i) {
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
  function addBuilding(buffers, properties, geometry, forcedColor, colorVariance) {
    var
      bbox = getBBox(geometry[0]),
      // radius = (bbox.maxX - bbox.minX)/2 * scale[0];
      // center = [
      //   (bbox.minX + (bbox.maxX - bbox.minX)/2 - origin[0]) * scale[0],
      //   (bbox.minY + (bbox.maxY - bbox.minY)/2 - origin[1]) * scale[1]
      // ];
      center = [bbox.minX + (bbox.maxX - bbox.minX)/2, bbox.minY + (bbox.maxY - bbox.minY)/2],
      radius = (bbox.maxX - bbox.minX)/2,

      vp = getVerticalParameters(properties),

      wallColor = varyColor((forcedColor || properties.wallColor || properties.color || getMaterialColor(properties.material)), colorVariance),
      roofColor = varyColor((forcedColor || properties.roofColor || getMaterialColor(properties.roofMaterial)), colorVariance);


    //*** process buildings that don't require a roof *************************

    switch (properties.shape) {
      case 'cone':
        split.cylinder(buffers, center, radius, 0, vp.wallHeight, vp.wallZ, wallColor);
        return;

      case 'dome':
        split.dome(buffers, center, radius, vp.wallHeight, vp.wallZ, wallColor);
        return;

      case 'pyramid':
        split.pyramid(buffers, geometry, center, vp.wallHeight, vp.wallZ, wallColor);
        return;

      case 'sphere':
        split.sphere(buffers, center, radius, vp.wallHeight, vp.wallZ, wallColor);
        return;
    }

    //*** process roofs which modify walls and don't require further processing

//  var explicitRoofTagging = true;
//  if ((!properties.roofLines || properties.roofLines !== 'no') && this.building.hasComplexRoof) {
//    return new ComplexRoof();
//  }

    switch (properties.roofShape) {
      case 'skillion':
        // TODO: modify inner rings too
        var roof = SkillionRoof(properties, geometry, center, vp.roofHeight);
        geometry = roof.geometry;
        split.polygon(buffers, roof.geometry, vp.roofZ, roofColor);
        return; // no further processing

      case 'gabled':
        //   // TODO: modify inner rings too
        //   var roof = GabledRoof(properties, geometry, center, vp.roofHeight);
        //   split.polygon(buffers, roof, vp.roofZ, roofColor);
        //// geometry = SkillionRoof(properties, geometry, center, properties.vp.roofHeight);
        return;

      // case 'hipped': // TODO: provide ridge segment and minor segments
      //   return new HippedRoof(properties, geometry);

      // case 'half-hipped': // TODO: provide ridge segment and minor segments
      //   return new HalfHippedRoof(properties, geometry);

      // case 'gambrel': // TODO: provide ridge segment and minor segments (individual roof line on client side)
      //   return new GambrelRoof(properties, geometry);

      // case 'mansard':  // TODO: provide ridge segments and their minor segments
      //   return new MansardRoof(properties, geometry);

      // case 'round': // TODO: extended version of gambrel for now. there should be a specific mechanism for lying cylinders
      //   return new RoundRoof(properties, geometry);
    }

    //*** process remaining roofs *********************************************

    switch (properties.roofShape) {
      case 'cone':
        split.cylinder(buffers, center, radius, 0, vp.roofHeight, vp.roofZ, roofColor);
        break;

      case 'dome':
        split.dome(buffers, center, radius, vp.roofHeight, vp.roofZ, roofColor);
        break;

      case 'pyramid':
        if (properties.shape === 'cylinder') {
          split.cylinder(buffers, center, radius, 0, vp.roofHeight, vp.roofZ, roofColor);
        } else {
          split.pyramid(buffers, geometry, center, vp.roofHeight, vp.roofZ, roofColor);
        }
        break;

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
          h1 = vp.roofHeight*rings[i].hScale;
          h2 = vp.roofHeight*rings[i + 1].hScale;
          split.cylinder(buffers, center, radius*rings[i].rScale, radius*rings[i + 1].rScale, h2 - h1, vp.roofZ + h1, roofColor);
        }
        break;

      case 'flat':
      default:
        if (properties.shape === 'cylinder') {
          split.circle(buffers, center, radius, vp.roofZ, roofColor);
        } else {
          split.polygon(buffers, geometry, vp.roofZ, roofColor);
        }
    }

    //*** process remaining buildings *****************************************

    switch(properties.roofShape) {
      case 'none':
        // no walls at all
        return;

      case 'cylinder':
        split.cylinder(buffers, center, radius, radius, vp.wallHeight, vp.wallZ, wallColor);
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
        split.extrusion(buffers, geometry, vp.wallHeight, vp.wallZ, wallColor, [0, WINDOWS_PER_METER, ty1/vp.wallHeight, ty2/vp.wallHeight]);
    }
  }

  function getVerticalParameters(properties) {
    var vp = {};
    var totalHeight = properties.height || (properties.levels ? properties.levels*METERS_PER_LEVEL : 0);

    //*** wall height *********************************************************

    vp.wallZ = properties.minHeight || (properties.minLevel ? properties.minLevel*METERS_PER_LEVEL : 0);
    vp.wallHeight = Math.max(0, totalHeight - vp.wallZ);

    switch (properties.shape) {
      case 'cone':
      case 'dome':
      case 'pyramid':
        vp.wallHeight = vp.wallHeight || 2*radius;
        break;

      case 'sphere':
        vp.wallHeight = vp.wallHeight || 4*radius;
        break;

      case 'none': // no walls at all
      case 'cylinder':
      default:
        vp.wallHeight = vp.wallHeight || DEFAULT_HEIGHT;
    }

    //*** roof height and update wall height **********************************

    vp.roofHeight = properties.roofHeight || (properties.roofLevels ? properties.roofLevels*METERS_PER_LEVEL : 0);

    switch (properties.roofShape) {
      case 'cone':
      case 'dome':
      case 'pyramid':
      case 'onion':
        vp.roofHeight = vp.roofHeight || 2*radius;
        break;

      case 'sphere':
        vp.roofHeight = vp.roofHeight || 4*radius;
        break;

      case 'skillion':
        vp.roofHeight = vp.roofHeight || 1*METERS_PER_LEVEL;
        break;

      case 'flat':
        vp.roofHeight = 0;
        break;

      default:
        // roofs we can't handle should not affect wallHeight
        vp.roofHeight = 0;
    }

    vp.roofHeight = Math.min(vp.roofHeight, vp.wallHeight);
    vp.wallHeight = vp.wallHeight - vp.roofHeight;

    vp.roofZ = vp.wallHeight + vp.wallZ;

    return vp;
  }

  return triangulate;

}());
