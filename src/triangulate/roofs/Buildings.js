
var jsts = require('jsts');

//*****************************************************************************

var wktReader = new jsts.io.WKTReader();

function toWKT(coordinates) {
  var points = [];
  for (var i = 0; i < coordinates.length; i++) {
    points.push(coordinates[i][0] + ' ' + coordinates[i][1]);
  }
  return wktReader.read('POLYGON((' + points.join(',') + '))');
}

//*****************************************************************************

var Buildings = module.exports = {};

Buildings.isValid = function(feature, modifier) {
  if (feature.geometry.type !== 'Polygon') {
    return false;
  }

  var properties = feature.properties;

  if (properties === undefined || properties.building === 'no') {
    return false;
  }

  if (properties.building === undefined && properties.buildingPart === undefined && (properties.barrier === undefined || properties.barrier !== 'city_wall')) {
    return false;
  }

  // TODO: perhaps let clients filter this
  if (properties.layer !== undefined && parseFloat(properties.layer) < 0) {
    return false;
  }

  var relationId = checkRelations(properties);

  if (relationId === false) {
    return false;
  }

  if (typeof relationId !== 'boolean') {
    properties.relationId = relationId;
  }

  feature.properties = alignProperties(properties, feature.geometry.coordinates, modifier);
  return true;
};

Buildings.resolveIntersections = function(collection) {
  var i, j, length = collection.length;

  for (i = 0; i < length; i++) {
    collection[i].wkt = toWKT(collection[i].geometry.coordinates[0]);
  }

  for (i = 0; i < length; i++) {
    // use regular buildings only
    if (collection[i].properties.buildingPart) {
      continue;
    }

    for (j = 0; j < length; j++) {
      if (collection[j] === null) {
        continue;
      }

      // compare with building parts only
      if (collection[j].properties.buildingPart === undefined) {
        continue;
      }

      if (collection[i].wkt.contains(collection[j].wkt) && (hasVerticalIntersection(collection[i].properties, collection[j].properties) === true)) {
        collection[i] = null;
        break;
      }
    }
  }

  return collection.map(function(feature) {
    if (feature) {
      feature.wkt = undefined;
    }
    return feature;
  });
};

//*****************************************************************************

var yardToMeter = 0.9144;
var footToMeter = 0.3048;
var inchToMeter = 0.0254;

var baseMaterials = {
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
};

function getMaterial(str) {
  if (str === undefined) {
    return;
  }
  return baseMaterials[str] || str;
}

function getMeters(str) {
  if (str === undefined) {
    return;
  }
  var value = parseFloat(str);
  // no units given
  if (value == str) {
    return Math.round(value);
  }
  if (~str.indexOf('m')) {
    return Math.round(value);
  }
  if (~str.indexOf('yd')) {
    return Math.round(value*yardToMeter);
  }
  if (~str.indexOf('ft')) {
    return Math.round(value*footToMeter);
  }
  if (~str.indexOf('\'')) {
    var footInch = str.split('\'');
    return Math.round(footInch[0]*footToMeter + footInch[1]*inchToMeter);
  }
}

function getLevels(str) {
  if (str === undefined) {
    return;
  }
  return parseInt(str, 10);
}

function checkRelations(properties) {
  var relations = properties.relations;

  // no relations but valid
  if (relations === undefined) {
    return true;
  }

  for (var i = 0; i < relations.length; i++) {
    // relation forms a building
    if (relations[i].tags.type === 'building' || relations[i].tags.building !== undefined) {

      // valid: declared as building part
      if (properties.buildingPart !== undefined) {
        return relations[i].id;
      }

      // TODO: anything is valid if it's the only member

      // invalid: item is just the outline
      if (relations[i].role === 'outline') {
        return false;
      }

      // a building among parts is likely just an outline. Do intersection checks later on.
      if (properties.building !== undefined && relations[i].role === 'part') {
        return relations[i].id;
      }
    }
  }

  // if not returned earlier, item is just part of logical relations
  // i.e. buildings on Alexanderplatz

  return true;
}

function hasVerticalIntersection(a, b) {
  if (a.height !== undefined && b.height !== undefined) {
    return (a.height > (b.minHeight || 0) && (a.minHeight || 0) < b.height);
  }

  if (a.levels !== undefined && b.levels !== undefined) {
    return (a.levels > (b.minLevel || 0) && (a.minLevel || 0) < b.levels);
  }
}

function alignProperties(srcProperties, coordinates, modifier) {
  var dstProperties = modifier ? modifier(srcProperties) : {};

  dstProperties.height = getMeters(srcProperties.height || srcProperties.buildingHeight);
  dstProperties.levels = getLevels(srcProperties.levels || srcProperties.buildingLevels);

  dstProperties.minHeight = getMeters(srcProperties.minHeight || srcProperties.buildingMinHeight);
  dstProperties.minLevel  = getLevels(srcProperties.minLevel  || srcProperties.buildingMinLevel);

  // wall material
  dstProperties.material = getMaterial(srcProperties.buildingMaterial || srcProperties.buildingFacadeMaterial || srcProperties.buildingCladding);

  // wall color
  dstProperties.color = srcProperties.buildingColor || srcProperties.buildingColour;

  dstProperties.roof = {};

  // roof material
  dstProperties.roofMaterial = getMaterial(srcProperties.roofMaterial || srcProperties.buildingRoofMaterial); // LEGACY
  dstProperties.roof.material = dstProperties.roofMaterial;

  // roof color
  dstProperties.roofColor = srcProperties.roofColor || srcProperties.roofColour || srcProperties.buildingRoofColor || srcProperties.buildingRoofColour; // LEGACY
  dstProperties.roof.color = dstProperties.roofColor;

  if (srcProperties.building === 'roof') {
    dstProperties.shape = 'none';
  }

  dstProperties.roofShape = srcProperties.roofShape || srcProperties.buildingRoofShape; // LEGACY
  if (dstProperties.roofShape === 'pyramidal') {
    dstProperties.roofShape = 'pyramid'; // LEGACY
  }
  dstProperties.roof.shape = dstProperties.roofShape;

  dstProperties.roofHeight = getMeters(srcProperties.roofHeight || srcProperties.buildingRoofHeight);
  dstProperties.roofLevels = getLevels(srcProperties.roofLevels || srcProperties.buildingRoofLevels);

  dstProperties.roof.height = dstProperties.roofHeight;
  dstProperties.roof.levels = dstProperties.roofLevels;

  setRoofProperties(dstProperties, coordinates);

  dstProperties.relationId = srcProperties.relationId;

  // TODO: combine this with relationId
  dstProperties.buildingPart = !!srcProperties.buildingPart ? true : undefined;

  return dstProperties;
}

function setRoofProperties(properties, coordinates) {
  // skip if building shape tops in a point
  if (properties.shape === 'cone' || properties.shape === 'pyramid') {
    return;
  }

  var
    bbox = getBBox(coordinates),
    center = getCenter(bbox),
    radius = getRadius(bbox),
    height = properties.roof.height,
    zPos = properties.height;

  switch (properties.roof.shape) {
    case 'cone':
    case 'dome':
      // nothing to do here: clients already calculate center+radius
      // TODO: perhaps always calculate radius on backend
      // properties.radius = radius;
      // properties.roof.apex = [center[0], center[1], zPos+properties.roof.height];
      return;

    case 'onion':
      var rings = [
        { rScale: 1.0, hScale: 0.00 },
        { rScale: 0.8, hScale: 0.15 },
        { rScale: 1.0, hScale: 0.50 },
        { rScale: 0.8, hScale: 0.70 },
        { rScale: 0.4, hScale: 0.80 },
        { rScale: 0.0, hScale: 1.00 }
      ];

      var h;
      properties.roof.segments = [];
      for (var i = 0, il = rings.length; i < il; i++) {
        h = height*rings[i].hScale;
        properties.roof.segments.push({ radius:radius*rings[i].rScale, zPos:zPos+h });
      }

      properties.roof.apex = [center[0], center[1], zPos+properties.roof.height];
      return;

    case 'pyramid':
      properties.roof.apex = [center[0], center[1], zPos+properties.roof.height];
      if (properties.shape === 'cylinder') {
        properties.radius = radius;
        properties.roof.shape = 'cone';
      }
      return;

    case 'skillion':
      // TODO: modify inner rings too
      var roof = SkillionRoof(properties, coordinates, center, height);
      // or modify footprint with z
      properties.roof.edge = roof.edge;
      return;

    case 'gabled':
      var roof = GabledRoof(properties, geometry, center, height);
      // or modify footprint with z
      properties.roof.edge = roof.edge;
      properties.roof.ridge = roof.ridge;
      return;
/*
    case 'hipped': // TODO: provide ridge segment and minor segments
      var roof = new HippedRoof(properties, geometry, center, height);
      properties.roof.ridge = roof.ridge;
      return;

    case 'half-hipped': // TODO: provide ridge segment and minor segments
      var roof = new HalfHippedRoof(properties, geometry, center, height);
      properties.roof.ridge = roof.ridge;
      return;

    case 'gambrel': // TODO: provide ridge segment and minor segments (individual roof line on client side)
      var roof = new GambrelRoof(properties, geometry, center, height);
      properties.roof.ridge = roof.ridge;
      return;

    case 'mansard':  // TODO: provide ridge segments and their minor segments
      var roof = new MansardRoof(properties, geometry, center, height);
      properties.roof.ridge = roof.ridge;
      return;

    case 'round': // TODO: extended version of gambrel for now. there should be a specific mechanism for lying cylinders
      var roof = new RoundRoof(properties, geometry, center, height);
      properties.roof.ridge = roof.ridge;
      return;
*/
  }
}

//  var explicitRoofTagging = true;
//  if ((!properties.roofLines || properties.roofLines !== 'no') && this.building.hasComplexRoof) {
//    return new ComplexRoof();
//  }
