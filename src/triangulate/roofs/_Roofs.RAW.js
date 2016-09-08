

function Building(tags, parts) {
  this.hasComplexRoof = false;
  for (var i = 0, len = parts.length; i < len; i++) {
    var partTags = parts[i].tags;
    if ((partTags.roofRidge && partTags.roofRidge === 'yes') || (partTags.roofEdge && partTags.roofEdge === 'yes')) {
      this.hasComplexRoof = true;
      break;
    }
  }

  for (var i = 0, len = parts.length; i < len; i++) {
    var part = new BuildingPart(this, parts[i], parts[i].getPolygon());
    part.renderTo();
  }
}

//*************************************************************************************************

function BuildingPart(building, area, polygon) {
  this.building = building.tags;
  this.area = area;
  this.polygon = polygon;
  this.setAttributes();
}

BuildingPart.prototype.getPolygon = function() {
  return this.polygon;
};

BuildingPart.prototype.renderTo = function() {
  this.renderWalls(this.roof);
  this.roof.renderTo();
};

BuildingPart.prototype.renderWalls = function(roof) {
  var floorHeight = this.calculateFloorHeight(roof);
  this.renderWalls(roof.getPolygon(), floorHeight, roof);
};

BuildingPart.prototype.calculateFloorHeight = function(roof) {
  if (getValue('minHeight') !== null) {
    var minHeight = parseMeasure(getValue('minHeight'));
    if (minHeight !== null) {
      return minHeight;
    }
  }

  if (minLevel > 0) {
    return (heightWithoutRoof / buildingLevels) * minLevel;
  }

  if ((this.area.tags.building && this.area.tags.building === 'roof') || (this.area.tags.buildingPart && this.area.tags.buildingPart === 'roof')) {
    return heightWithoutRoof - 0.3;
  }

  return 0;
};

BuildingPart.prototype.renderWalls = function(p, floorHeight,	roof) {
  this.drawWallPolygon(floorHeight, roof, p.getOuter().makeCounterclockwise());
  for (var polygon in p.getHoles()) {
    this.drawWallPolygon(floorHeight, roof, polygon.makeClockwise());
  }
};

BuildingPart.prototype.drawWallPolygon = function(floorHeight, roof, polygon) {
  var floorEle = floorHeight;

  var textureDataList = this.materialWallWithWindows.getTextureDataList();
  var vertices = polygon.getVertexLoop();

  var mainWallVectors = [];
  var roofWallVectors = [];

  var mainWallTexCoordLists = [];

  for (var texLayer = 0; texLayer < textureDataList.length; texLayer ++) {
    mainWallTexCoordLists.push([]);
  }

  var accumulatedLength = 0;
  var previousS = [];

  for (var i = 0; i < vertices.length; i++) {
    var coord = vertices[i];

    /* update accumulated wall length */

    if (i > 0) {
      accumulatedLength += coord.distanceTo(vertices[i-1]);
    }

    /* add wall vectors */

    var upperVector = coord.xyz(roof.getRoofEleAt(coord));
    var middleVector = coord.xyz(heightWithoutRoof);

    var upperEle = upperVector.y;
    var middleEle = middleVector.y;

    mainWallVectors.push(middleVector);
    mainWallVectors.push(new VectorXYZ(coord.x, Math.min(floorEle, middleEle), coord.z));

    roofWallVectors.push(upperVector);
    roofWallVectorspush(new VectorXYZ(coord.x, Math.min(middleEle, upperEle), coord.z));

    /* add texture coordinates */

    for (var texLayer = 0; texLayer < textureDataList.length; texLayer ++) {
      var textureData = textureDataList[texLayer];
      var texCoordList = mainWallTexCoordLists[texLayer];

      var s, lowerT, middleT;

      // determine s (width dimension) coordinate

      if (textureData.height > 0) {
        s = accumulatedLength / textureData.width;
      } else {
        if (i === 0) {
          s = 0;
        } else {
          s = previousS[texLayer] + Math.round(vertices[i-1].distanceTo(coord) / textureData.width);
        }
      }

      previousS[texLayer] = s;

      // determine t (height dimension) coordinates

      if (textureData.height > 0) {
        lowerT = floorEle / textureData.height;
        middleT = middleEle / textureData.height;
      } else {
        lowerT = buildingLevels *	floorEle / middleEle;
        middleT = buildingLevels;
      }

      // set texture coordinates

      texCoordList.push(new VectorXZ(s, middleT));
      texCoordList.push(new VectorXZ(s, lowerT));
    }
  }

  drawTriangleStrip(this.materialWallWithWindows, mainWallVectors, mainWallTexCoordLists);
  drawTriangleStrip(this.materialWall, roofWallVectors,	texCoordLists(roofWallVectors, this.materialWall, STRIP_WALL));
};

/**
 * sets the building part attributes (height, colors) depending on
 * the building's and building part's tags.
 * If available, explicitly tagged data is used, with tags of the building part overriding building tags.
 * Otherwise, the values depend on indirect assumptions (level height) or ultimately the building class
 * as determined by the 'building' key.
 */
BuildingPart.prototype.setAttributes = function() {
  var
    defaultLevels = 3,
    defaultHeightPerLevel = 2.5,
    defaultMaterialWall = Materials.BUILDING_DEFAULT,
    defaultMaterialRoof = Materials.ROOF_DEFAULT,
    defaultMaterialWindows = Materials.BUILDING_WINDOWS,
    defaultRoofShape = 'flat',

    tags = this.area.tags,
    buildingTags = this.building.tags;

  switch (this.getValue('building')) {
    case 'greenhouse':
      defaultLevels = 1;
      defaultMaterialWall = Materials.GLASS;
      defaultMaterialRoof = Materials.GLASS_ROOF;
      defaultMaterialWindows = null;
      break;
    case 'garage':
    case 'garages':
      defaultLevels = 1;
      defaultMaterialWall = Materials.CONCRETE;
      defaultMaterialRoof = Materials.CONCRETE;
      defaultMaterialWindows = null;
      break;
    case 'hut':
    case 'shed':
      defaultLevels = 1;
      break;
    case 'cabin':
      defaultLevels = 1;
      defaultMaterialWall = Materials.WOOD_WALL;
      defaultMaterialRoof = Materials.WOOD;
      break;
    case 'roof':
      defaultLevels = 1;
      defaultMaterialWindows = null;
      break;
    case 'church':
    case 'hangar':
    case 'industrial':
      defaultMaterialWindows = null;
      break;
    default:
      if (this.getValue('buildingLevels') === null) {
        defaultMaterialWindows = null;
      }
  }

  /* determine levels */

  buildingLevels = defaultLevels;

  if (this.getValue('buildingLevels') !== null) {
    parsedLevels = parseMeasure(this.getValue('buildingLevels'), false);
  }

  if (parsedLevels !== null) {
    buildingLevels = parsedLevels;
  } else if (parseHeight(tags, parseHeight(buildingTags, -1)) > 0) {
    buildingLevels = Math.max(1, (parseHeight(tags, parseHeight(buildingTags, -1)) / defaultHeightPerLevel));
  }

  minLevel = 0;

  if (this.getValue('buildingMinLevel') !== null) {
    var parsedMinLevel = parseMeasure(this.getValue('buildingMinLevel'), false);
    if (parsedMinLevel !== null) {
      minLevel = parsedMinLevel;
    }
  }

  /* determine roof shape */

  var explicitRoofTagging = true;

  if ((!this.area.tags.roofLines || this.area.tags.roofLines !== 'no') && this.building.hasComplexRoof) {
    roof = new ComplexRoof();
  } else {
    var roofShape = this.getValue('roofShape');
    if (roofShape === null) {
      roofShape = this.getValue('buildingRoofShape');
    }

    if (roofShape === null) {
      roofShape = defaultRoofShape;
      explicitRoofTagging = false;
    }

    switch (roofShape) {
      case 'pyramidal':
        roof = new PyramidalRoof();
        break;
      case 'onion':
        roof = new OnionRoof();
        break;
      case 'skillion':
        roof = new SkillionRoof();
        break;
      case 'gabled':
        roof = new GabledRoof();
        break;
      case 'hipped':
        roof = new HippedRoof();
        break;
      case 'half-hipped':
        roof = new HalfHippedRoof();
        break;
      case 'gambrel':
        roof = new GambrelRoof();
        break;
      case 'mansard':
        roof = new MansardRoof();
        break;
      case 'dome':
        roof = new DomeRoof();
        break;
      case 'round':
        roof = new RoundRoof();
        break;
      default:
        roof = new FlatRoof();
    }
  }

  /* determine height */

  var fallbackHeight = buildingLevels * defaultHeightPerLevel;
  fallbackHeight += roof.getRoofHeight();
  fallbackHeight = parseHeight(buildingTags, fallbackHeight);

  var height = parseHeight(tags, fallbackHeight);
    heightWithoutRoof = height - roof.getRoofHeight();

  /* determine materials */
  if (defaultMaterialRoof === Materials.ROOF_DEFAULT && explicitRoofTagging && roof instanceof FlatRoof) {
    defaultMaterialRoof = Materials.CONCRETE;
  }

  this.materialWall = this.buildMaterial(this.getValue('buildingMaterial'), this.getValue('buildingColour'), defaultMaterialWall, false);
  this.materialRoof = this.buildMaterial(this.getValue('roofMaterial'), this.getValue('roofColour'), defaultMaterialRoof, true);

  if (this.materialWall === Materials.GLASS) {
    defaultMaterialWindows = null;
  }

  this.materialWallWithWindows = this.materialWall;
};

BuildingPart.prototype.buildMaterial = function(materialString,	colorString, defaultMaterial,	roof) {
  var material = defaultMaterial;

  switch (materialString) {
    case null:
      break;
    case 'brick':
      material = Materials.BRICK;
      break;
    case 'glass':
      material = roof ? Materials.GLASS_ROOF : Materials.GLASS;
      break;
    case 'wood':
      material = Materials.WOOD_WALL;
      break;
    default:
      if (Materials.getSurfaceMaterial(materialString) !== null) {
        material = Materials.getSurfaceMaterial(materialString);
      }
  }

  return material;
};

/**
 * returns the value for a key from the building part's tags or the
 * building's tags (if the part doesn't have a tag with this key)
 */
BuildingPart.prototype.getValue = function(key) {
  if (this.area.tags[key]) {
    return this.area.tags[key];
  }
  return this.building.tags[key]
};

//*************************************************************************************************

var Roof = {
  DEFAULT_RIDGE_HEIGHT: 5
};

/**
* superclass for roofs based on roof:type tags.
* Contains common functionality, such as roof height parsing.
*/
function TaggedRoof() {
  var taggedHeight;

  if (this.area.tags.roofHeight) {
    this.valueString = this.getValue('roofHeight');
    taggedHeight = parseMeasure(this.valueString);
  } else if (this.getValue('roofLevels') !== null) {
    try {
      taggedHeight = 2.5 * parseFloat(this.getValue('roofLevels'));
    } catch (ex) {}
  }

  this.roofHeight = taggedHeight !== null ? taggedHeight : this.getDefaultRoofHeight();
}

TaggedRoof.prototype = {};

/**
* default roof height if no value is tagged explicitly.
* Can optionally be overwritten by subclasses.
*/
TaggedRoof.prototype.getDefaultRoofHeight = function() {
 if (this.buildingLevels === 1) {
   return 1;
 }

 return Roof.DEFAULT_RIDGE_HEIGHT;
};

/**
* returns the outline (with holes) of the roof.
* The shape will be generally identical to that of the
* building itself, but additional vertices might have
* been inserted into segments.
*/
TaggedRoof.prototype.getPolygon = function() {};

/**
* returns roof elevation at a position.
*/
TaggedRoof.prototype.getRoofEleAt = function(coord) {};

/**
* returns maximum roof height
*/
TaggedRoof.prototype.getRoofHeight = function() {
 return this.roofHeight;
};

/**
* returns maximum roof elevation
*/
TaggedRoof.prototype.getMaxRoofEle = function() {
 return this.heightWithoutRoof + this.roofHeight;
};

//*************************************************************************************************

/**
* superclass for roofs that have exactly one height value
* for each point within their XZ polygon
*/
function HeightfieldRoof() {
 TaggedRoof.apply(this, arguments);
}

HeightfieldRoof.prototype = Object.create(TaggedRoof);

/**
* returns segments within the roof polygon
* that define ridges or edges of the roof
*/
HeightfieldRoof.prototype.getInnerSegments = function() {};

/**
* returns segments within the roof polygon
* that define apex nodes of the roof
*/
HeightfieldRoof.prototype.getInnerPoints = function() {};

/**
* returns roof elevation at a position.
* Only required to work for positions that are part of the
* polygon, segments or points for the roof.
*
* @return  elevation, null if unknown
*/
HeightfieldRoof.prototype.getRoofEleAt_noInterpolation = function(pos) {};


HeightfieldRoof.prototype.getRoofEleAt = function(v) {
 var ele = getRoofEleAt_noInterpolation(v);

 if (ele !== null) {
   return ele;
 }

 // get all segments from the roof

 //TODO (performance): adoing this for every node

 var segments = [];
 segments.addAll(this.getInnerSegments());
 segments.addAll(this.getPolygon().getOuter().getSegments());
 for (var hole in this.getPolygon().getHoles()) {
   segments.addAll(hole.getSegments());
 }

 // find the segment with the closest distance to the node

 var closestSegment;
 var closestSegmentDistance = Math.Infinity;

 for (var segment in segments) {
   var segmentDistance = distanceFromLineSegment(v, segment);
   if (segmentDistance < closestSegmentDistance) {
     closestSegment = segment;
     closestSegmentDistance = segmentDistance;
   }
 }

 // use that segment for height interpolation

 return interpolateValue(
   v,
   closestSegment.p1,
   this.getRoofEleAt_noInterpolation(closestSegment.p1),
   closestSegment.p2,
   this.getRoofEleAt_noInterpolation(closestSegment.p2)
 );
};

HeightfieldRoof.prototype.renderTo = function() {
 /* create the triangulation of the roof */

 var triangles = triangulate(
   this.getPolygon().getOuter(),
   this.getPolygon().getHoles(),
   this.getInnerSegments(),
   this.getInnerPoints()
 );

 var trianglesXYZ = [];

 for (triangle in triangles) {
   var tCCW = triangle.makeCounterclockwise();
   trianglesXYZ.push(new TriangleXYZ(
     this.withRoofEle(tCCW.v1),
     this.withRoofEle(tCCW.v2),
     this.withRoofEle(tCCW.v3)));
   //TODO: aduplicate objects for points in more than one triangle
 }

 drawTriangles(trianglesXYZ, triangleTexCoordLists(trianglesXYZ, this.SLOPED_TRIANGLES));
};

HeightfieldRoof.prototype.withRoofEle = function(v) {
 return v.xyz(this.getRoofEleAt(v));
};

//*************************************************************************************************

function SpindleRoof() {
 TaggedRoof.apply(this, arguments);
}

SpindleRoof.prototype = Object.create(TaggedRoof.prototype);

SpindleRoof.prototype.getPolygon = function() {
 return this.polygon;
};

SpindleRoof.prototype.getRoofEleAt = function(pos) {
 return this.getMaxRoofEle() - this.getRoofHeight();
};

SpindleRoof.prototype.renderSpindle = function(material, polygon, heights, scaleFactors) {
 // if (heights.length !== scaleFactors.length) {..} // heights and scaleFactors must have same size

 var numRings = heights.length;
 var center = polygon.getCenter();

 /* calculate the vertex rings */

 var rings = [];

 for (var i = 0; i < numRings; i++) {
   var y = heights[i];
   var scale = scaleFactors[i];
   if (scale === 0) {
     rings[i] = nCopies(polygon.length + 1, center.xyz(y));
   } else {
     rings[i] = [];
     for (v in polygon.getVertexLoop()) {
       rings[i].push(interpolateBetween(center, v, scale).xyz(y));
     }
   }
 }

 /* draw the triangle strips (or fans) between the rings */

 var texCoordData = this.spindleTexCoordLists(rings, polygon.getOutlineLength(), material);

 for (var i = 0; i+1 < numRings; i++) {
   var vs = [];
   for (var v = 0; v < rings[i].length; v ++) {
     vs.push(rings[i][v]);
     vs.push(rings[i+1][v]);
   }

   drawTriangleStrip(material, vs, texCoordData[i]);
 }
};

SpindleRoof.prototype.spindleTexCoordLists = function(rings, polygonLength, material) {
 var result = [];
 var accumulatedTexHeight = 0;

 for (var i = 0; i+1 < rings.length; i++) {
   var texHeight = rings[i][0].distanceTo(rings[i+1][0]);
   var textureDataList = material.getTextureDataList();
   if (textureDataList.length === 0) {
     result[i] = [];
   } else if (textureDataList.length === 1) {
     result[i] = [this.spindleTexCoordList(rings[i], rings[i+1], polygonLength, accumulatedTexHeight, this.textureDataList[0])];
   } else {
     result[i] = [];
     for (textureData in textureDataList) {
       result[i].push(this.spindleTexCoordList(rings[i], rings[i+1], polygonLength, accumulatedTexHeight, textureData));
     }
   }

   accumulatedTexHeight += texHeight;
 }

 return result;
};

SpindleRoof.prototype.spindleTexCoordList = function(lowerRing, upperRing, polygonLength, accumulatedTexHeight, textureData) {
 var textureRepeats = Math.max(1, Math.round(polygonLength / textureData.width));

 var texWidthSteps = textureRepeats / (lowerRing.length - 1);
 var texHeight = lowerRing[0].distanceTo(upperRing[0]);

 var texZ1 = accumulatedTexHeight / textureData.height;
 var texZ2 = (accumulatedTexHeight + texHeight) / textureData.height;

 var texCoords = new VectorXZ[2 * lowerRing.length];

 for (var i = 0; i < lowerRing.length; i++) {
   texCoords[2*i] = new VectorXZ(i*texWidthSteps, -texZ1);
   texCoords[2*i+1] = new VectorXZ(i*texWidthSteps, -texZ2);
 }

 return asList(texCoords);
};

SpindleRoof.prototype.getDefaultRoofHeight = function() {
 return this.polygon.getOuter().getDiameter() / 2;
};

//*************************************************************************************************

function FlatRoof() {
 HeightfieldRoof.apply(this, arguments);
}

FlatRoof.prototype = Object.create(HeightfieldRoof.prototype);

FlatRoof.prototype.getPolygon = function() {
  return this.polygon;
}

FlatRoof.prototype.getInnerPoints = function() {
  return [];
}

FlatRoof.prototype.getInnerSegments = function() {
  return [];
}

FlatRoof.prototype.getRoofHeight = function() {
  return 0;
}

FlatRoof.prototype.getRoofEleAt_noInterpolation = function(pos) {
  return this.getMaxRoofEle();
}

FlatRoof.prototype.getMaxRoofEle = function() {
  return this.heightWithoutRoof;
}

//*************************************************************************************************

function PyramidalRoof() {
  HeightfieldRoof.apply(this, arguments);

  this.outerPoly = polygon.getOuter();
  this.apex = this.outerPoly.getCentroid();

  this.innerSegments = [];
  for (var v in this.outerPoly.getVertices()) {
    this.innerSegments.push(new LineSegmentXZ(v, this.apex));
  }
}

PyramidalRoof.prototype = Object.create(HeightfieldRoof.prototype);

PyramidalRoof.prototype.getPolygon = function() {
  return this.polygon;
};

PyramidalRoof.prototype.getInnerPoints = function() {
  return [this.apex];
};

PyramidalRoof.prototype.getInnerSegments = function() {
  return this.innerSegments;
};

PyramidalRoof.prototype.getRoofEleAt_noInterpolation = function(pos) {
  if (this.apex.equals(pos)) {
    return this.getMaxRoofEle();
  }
  if (polygon.getOuter().getVertices().contains(pos)) {
    return this.getMaxRoofEle() - this.roofHeight;
  }

  return null;
};

//*************************************************************************************************

function SkillionRoof() {
  HeightfieldRoof.apply(this, arguments);

  /* parse slope direction */

  var slopeDirection;

  if (getValue('roofDirection') !== null) {
    var angle = parseAngle(getValue('roofDirection'));
    if (angle !== null) {
      slopeDirection = VectorXZ.fromAngle(toRadians(angle));
    }
  }

  // fallback from roof:direction to roof:slope:direction
  if (slopeDirection === null && getValue('roofSlopeDirection') !== null) {
    var angle = parseAngle(getValue('roofSlopeDirection'));
    if (angle !== null) {
      slopeDirection = VectorXZ.fromAngle(toRadians(angle));
    }
  }

  if (slopeDirection !== null) {
    var simplifiedOuter = polygon.getOuter().getSimplifiedPolygon();

    /* find ridge by calculating the outermost intersections of
      * the quasi-infinite slope 'line' towards the centroid vector
      * with segments of the polygon */

    var center = simplifiedOuter.getCentroid();

    var intersections = simplifiedOuter.intersectionSegments(new LineSegmentXZ(center.push(slopeDirection.mult(-1000)), center));

    var outermostIntersection;
    var distanceOutermostIntersection = -1;

    for (var i in intersections) {
      var distance = distanceFromLineSegment(center, i);
      if (distance > distanceOutermostIntersection) {
        outermostIntersection = i;
        distanceOutermostIntersection = distance;
      }
    }

    this.ridge = outermostIntersection;

    /* calculate maximum distance from ridge */

    var maxDistance = 0.1;

    for (var v in polygon.getOuter().getVertexLoop()) {
      var distance = distanceFromLine(v, ridge.p1, ridge.p2);
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }

    this.roofLength = maxDistance;
  } else {
    this.ridge = null;
    this.roofLength = NaN;
  }
}

SkillionRoof.prototype = Object.create(HeightfieldRoof.prototype);

SkillionRoof.prototype.getPolygon = function() {
  return this.polygon;
};

SkillionRoof.prototype.getInnerSegments = function() {
  return [];
};

SkillionRoof.prototype.getInnerPoints = function() {
  return [];
};

SkillionRoof.prototype.getRoofEleAt_noInterpolation = function(pos) {
  if (this.ridge === null) {
    return this.getMaxRoofEle();
  }

  var distance = distanceFromLineSegment(pos, this.ridge);
  var relativeDistance = distance / this.roofLength;
  return this.getMaxRoofEle() - relativeDistance * this.roofHeight;
};

//*************************************************************************************************

/**
 * tagged roof with a ridge.
 * Deals with ridge calculation for various subclasses.
 *
 * @param relativeRoofOffset  distance of ridge to outline
 *    relative to length of roof cap; 0 if ridge ends at outline
 */

function RoofWithRidge(relativeRoofOffset) {
  HeightfieldRoof.apply(this, arguments);

  var outerPoly = polygon.getOuter();

  var simplifiedPolygon = outerPoly.getSimplifiedPolygon();

  /* determine ridge direction based on tag if it exists,
    * otherwise choose direction of longest polygon segment */

  var ridgeDirection;

  if (getValue('roofDirection') !== null) {
    var angle = parseAngle(getValue('roofDirection'));
    if (angle !== null) {
      ridgeDirection = VectorXZ.fromAngle(toRadians(angle)).rightNormal();
    }
  }

  if (ridgeDirection === null && getValue('roofRidgeDirection') !== null) {
    var angle = parseAngle(getValue('roofRidgeDirection'));
    if (angle !== null) {
      ridgeDirection = VectorXZ.fromAngle(toRadians(angle));
    }
  }

  if (ridgeDirection === null) {
    var longestSeg = MinMaxUtil.max(
      simplifiedPolygon.getSegments(),
      function(s) {
        return s.getLength();
      }
    );

    ridgeDirection = longestSeg.p2.subtract(longestSeg.p1).normalize();

    if (this.area.tags.contains('roofOrientation', 'across')) {
      ridgeDirection = ridgeDirection.rightNormal();
    }
  }

  /* calculate the two outermost intersections of the
   * quasi-infinite ridge line with segments of the polygon */

  var p1 = outerPoly.getCentroid();

  var intersections = simplifiedPolygon.intersectionSegments(new LineSegmentXZ(
    p1.push(ridgeDirection.mult(-1000)),
    p1.push(ridgeDirection.mult(1000))
  ));

  if (intersections.length < 2) {
    throw new Error('cannot handle roof geometry for id ' + area.getOsmObject().id);
  }

  // TODO choose outermost instead of any pair of intersections
  var it = intersections.iterator();
  /** the roof cap that is closer to the first vertex of the ridge */
  this.cap1 = it.next();
  /** the roof cap that is closer to the second vertex of the ridge */
  this.cap2 = it.next();

  /* base ridge on the centers of the intersected segments
    * (the intersections itself are not used because the
    * tagged ridge direction is likely not precise)       */
  var c1 = this.cap1.getCenter();
  var c2 = this.cap2.getCenter();

  /** absolute distance of ridge to outline */
  this.ridgeOffset = Math.min(cap1.getLength() * relativeRoofOffset, 0.4 * c1.distanceTo(c2));

  if (relativeRoofOffset === 0) {
    this.ridge = new LineSegmentXZ(c1, c2);
  } else {
    this.ridge = new LineSegmentXZ(
      c1.push( p1.subtract(c1).normalize().mult(this.ridgeOffset) ),
      c2.push( p1.subtract(c2).normalize().mult(this.ridgeOffset) )
    );
  }

  /* calculate maxDistanceToRidge */

  var maxDistance = 0;

  for (var v in outerPoly.getVertices()) {
    maxDistance = Math.max(maxDistance, distanceFromLineSegment(v, ridge));
  }

  /** maximum distance of any outline vertex to the ridge */
  this.maxDistanceToRidge = maxDistance;
};

RoofWithRidge.prototype = Object.create(HeightfieldRoof.prototype);

//*************************************************************************************************

function GabledRoof() {
 RoofWithRidge.apply(this, 0);
}

GabledRoof.prototype = Object.create(RoofWithRidge.prototype);

GabledRoof.prototype.getPolygon = function() {
  var newOuter = thiis.polygon.getOuter();
  newOuter = insertIntoPolygon(newOuter, this.ridge.p1, 0.2);
  newOuter = insertIntoPolygon(newOuter, this.ridge.p2, 0.2);
  return new PolygonWithHolesXZ(newOuter.asSimplePolygon(), this.polygon.getHoles());
};

GabledRoof.prototype.getInnerPoint = function() {
  return [];
};

GabledRoof.prototype.getInnerSegments = function() {
  return singleton(this.ridge);
};

GabledRoof.prototype.getRoofEleAt_noInterpolation = function(pos) {
  var distRidge = distanceFromLineSegment(pos, this.ridge);
  var relativePlacement = distRidge / this.maxDistanceToRidge;
  return this.getMaxRoofEle() - this.roofHeight * relativePlacement;
};

//*************************************************************************************************

function HippedRoof() {
  RoofWithRidge.apply(this, 1/3);
}

HippedRoof.prototype = Object.create(RoofWithRidge.prototype);

HippedRoof.prototype.getPolygon = function() {
  return this.polygon;
};

HippedRoof.prototype.getInnerPoints = function() {
  return [];
};

HippedRoof.prototype.getInnerSegments = function() {
  return [
    this.ridge,
    new LineSegmentXZ(this.ridge.p1, this.cap1.p1),
    new LineSegmentXZ(this.ridge.p1, this.cap1.p2),
    new LineSegmentXZ(this.ridge.p2, this.cap2.p1),
    new LineSegmentXZ(this.ridge.p2, this.cap2.p2)
  ];
};

HippedRoof.prototype.getRoofEleAt_noInterpolation = function(pos) {
  if (this.ridge.p1.equals(pos) || this.ridge.p2.equals(pos)) {
    return this.getMaxRoofEle();
  }
  if (this.getPolygon().getOuter().getVertexLoop().contains(pos)) {
    return this.getMaxRoofEle() - this.roofHeight;
  }
  return null;
};

//*************************************************************************************************

function HalfHippedRoof() {
  RoofWithRidge.apply(this, 1/6);

  this.cap1part = new LineSegmentXZ(
    interpolateBetween(this.cap1.p1, this.cap1.p2, 0.5 - this.ridgeOffset / this.cap1.getLength()),
    interpolateBetween(this.cap1.p1, this.cap1.p2, 0.5 + this.ridgeOffset / this.cap1.getLength())
  );

  this.cap2part = new LineSegmentXZ(
    interpolateBetween(this.cap2.p1, this.cap2.p2, 0.5 - this.ridgeOffset / this.cap1.getLength()),
    interpolateBetween(this.cap2.p1, this.cap2.p2, 0.5 + this.ridgeOffset / this.cap1.getLength())
  );
}

HalfHippedRoof.prototype = Object.create(RoofWithRidge.prototype);

HalfHippedRoof.prototype.getPolygon = function() {
  var newOuter = this.polygon.getOuter();

  newOuter = insertIntoPolygon(newOuter, this.cap1part.p1, 0.2);
  newOuter = insertIntoPolygon(newOuter, this.cap1part.p2, 0.2);
  newOuter = insertIntoPolygon(newOuter, this.cap2part.p1, 0.2);
  newOuter = insertIntoPolygon(newOuter, this.cap2part.p2, 0.2);

  return new PolygonWithHolesXZ(newOuter.asSimplePolygon(), this.polygon.getHoles());
};

HalfHippedRoof.prototype.getInnerPoints = function() {
  return [];
};

HalfHippedRoof.prototype.getInnerSegments = function() {
  return [this.ridge,
    new LineSegmentXZ(this.ridge.p1, this.cap1part.p1),
    new LineSegmentXZ(this.ridge.p1, this.cap1part.p2),
    new LineSegmentXZ(this.ridge.p2, this.cap2part.p1),
    new LineSegmentXZ(this.ridge.p2, this.cap2part.p2)
  ];
};

HalfHippedRoof.prototype.getRoofEleAt_noInterpolation = function(pos) {
  if (this.ridge.p1.equals(pos) || this.ridge.p2.equals(pos)) {
    return this.getMaxRoofEle();
  }
  if (this.getPolygon().getOuter().getVertexLoop().contains(pos)) {
    if (distanceFromLineSegment(pos, this.cap1part) < 0.05) {
      return this.getMaxRoofEle() - this.roofHeight * this.ridgeOffset / (this.cap1.getLength()/2);
    }
    if (distanceFromLineSegment(pos, this.cap2part) < 0.05) {
      return this.getMaxRoofEle() - this.roofHeight * this.ridgeOffset / (this.cap2.getLength()/2);
    }
    return this.getMaxRoofEle() - this.roofHeight;
  }

  return null;
};

//*************************************************************************************************

function GambrelRoof() {
  RoofWithRidge.apply(this, 0);

  this.cap1part = new LineSegmentXZ(
    interpolateBetween(this.cap1.p1, this.cap1.p2, 1/6.0),
    interpolateBetween(this.cap1.p1, this.cap1.p2, 5/6.0)
  );

  this.cap2part = new LineSegmentXZ(
    interpolateBetween(this.cap2.p1, this.cap2.p2, 1/6.0),
    interpolateBetween(this.cap2.p1, this.cap2.p2, 5/6.0)
  );
}

GambrelRoof.prototype = Object.create(RoofWithRidge.prototype);

GambrelRoof.prototype.getPolygon = function() {
  var newOuter = this.polygon.getOuter();

  newOuter = insertIntoPolygon(newOuter, this.ridge.p1, 0.2);
  newOuter = insertIntoPolygon(newOuter, this.ridge.p2, 0.2);
  newOuter = insertIntoPolygon(newOuter, this.cap1part.p1, 0.2);
  newOuter = insertIntoPolygon(newOuter, this.cap1part.p2, 0.2);
  newOuter = insertIntoPolygon(newOuter, this.cap2part.p1, 0.2);
  newOuter = insertIntoPolygon(newOuter, this.cap2part.p2, 0.2);

  // TODO: add intersections of additional edges with outline?

  return new PolygonWithHolesXZ(
    newOuter.asSimplePolygon(),
    this.polygon.getHoles()
  );
};

GambrelRoof.prototype.getInnerPoints = function() {
  return [];
};

GambrelRoof.prototype.getInnerSegments = function() {
  return [this.ridge,
    new LineSegmentXZ(this.cap1part.p1, this.cap2part.p2),
    new LineSegmentXZ(this.cap1part.p2, this.cap2part.p1)
  ];
};

GambrelRoof.prototype.getRoofEleAt_noInterpolation = function(pos) {
  var distRidge = distanceFromLineSegment(pos, this.ridge);
  var relativePlacement = distRidge / this.maxDistanceToRidge;

  if (relativePlacement < 2/3.0) {
    return this.getMaxRoofEle() - 1/2.0 * this.roofHeight * relativePlacement;
  }

  return this.getMaxRoofEle() - 1/3.0 * this.roofHeight - 2 * this.roofHeight * (relativePlacement - 2/3.0);
};

//*************************************************************************************************

function RoundRoof() {
  RoofWithRidge.apply(this, 0);

  if (this.roofHeight < this.maxDistanceToRidge) {
    var squaredHeight = this.roofHeight * this.roofHeight;
    var squaredDist = this.maxDistanceToRidge * this.maxDistanceToRidge;
    var centerY =  (squaredDist - squaredHeight) / (2 * this.roofHeight);
    this.radius = Math.sqrt(squaredDist + centerY * centerY);
  } else {
    this.radius = 0;
  }

  this.rings = Math.max(3, this.roofHeight/RoundRoof.ROOF_SUBDIVISION_METER);
  this.capParts = [];
  // TODO: would be good to vary step size with slope
  var step = 0.5 / (this.rings + 1);
  for (var i = 1; i <= this.rings; i++) {
    this.capParts.push(new LineSegmentXZ(
      interpolateBetween(this.cap1.p1, this.cap1.p2, i * step),
      interpolateBetween(this.cap1.p1, this.cap1.p2, 1 - i * step))
    );

    this.capParts.push(new LineSegmentXZ(
      interpolateBetween(this.cap2.p1, this.cap2.p2, i * step),
      interpolateBetween(this.cap2.p1, this.cap2.p2, 1 - i * step))
    );
  }
}

RoundRoof.prototype = Object.create(RoofWithRidge.prototype);

RoundRoof.ROOF_SUBDIVISION_METER = 2.5;

RoundRoof.prototype.getPolygon = function() {
  var newOuter = this.polygon.getOuter();
  newOuter = insertIntoPolygon(newOuter, this.ridge.p1, 0.2);
  newOuter = insertIntoPolygon(newOuter, this.ridge.p2, 0.2);

  for (var capPart in this.capParts){
    newOuter = insertIntoPolygon(this.newOuter, capPart.p1, 0.2);
    newOuter = insertIntoPolygon(this.newOuter, capPart.p2, 0.2);
  }

  //TODO: add intersections of additional edges with outline?
  return new PolygonWithHolesXZ(newOuter.asSimplePolygon(), this.polygon.getHoles());
};

RoundRoof.prototype.getInnerPoints = function() {
  return [];
};

RoundRoof.prototype.getInnerSegments = function() {
  var innerSegments = [];
  innerSegments.push(this.ridge);
  for (var i = 0; i < this.rings * 2; i += 2) {
    var cap1part = this.capParts[i];
    var cap2part = this.capParts[i+1];
    innerSegments.push(new LineSegmentXZ(cap1part.p1, cap2part.p2));
    innerSegments.push(new LineSegmentXZ(cap1part.p2, cap2part.p1));
  }
  return innerSegments;
};

RoundRoof.prototype.getRoofEleAt_noInterpolation = function(pos) {
  var distRidge = distanceFromLineSegment(pos, this.ridge);
  var ele;

  if (this.radius > 0) {
    var relativePlacement = distRidge / this.radius;
    ele = getMaxRoofEle() - this.radius + Math.sqrt(1.0 - relativePlacement * relativePlacement) * this.radius;
  } else {
    // This could be any interpolator
    var relativePlacement = distRidge / this.maxDistanceToRidge;
    ele = this.getMaxRoofEle() - this.roofHeight +
    (1 - (Math.pow(relativePlacement, 2.5))) * this.roofHeight;
  }

  return Math.max(ele, this.getMaxRoofEle() - this.roofHeight);
};

//*************************************************************************************************

function MansardRoof() {
  RoofWithRidge.apply(this, 1/3);

  this.mansardEdge1 = new LineSegmentXZ(
    interpolateBetween(this.cap1.p1, this.ridge.p1, 1/3.0),
    interpolateBetween(this.cap2.p2, this.ridge.p2, 1/3.0)
  );

  this.mansardEdge2 = new LineSegmentXZ(
    interpolateBetween(this.cap1.p2, this.ridge.p1, 1/3.0),
    interpolateBetween(this.cap2.p1, this.ridge.p2, 1/3.0)
  );
}

MansardRoof.prototype = Object.create(RoofWithRidge.prototype);
// mansardEdge1, mansardEdge2;

getPolygon = function() {
  return this.polygon;
};

getInnerPoints = function() {
  return [];
};

getInnerSegments = function() {
  return [this.ridge,
    this.mansardEdge1,
    this.mansardEdge2,
    new LineSegmentXZ(this.ridge.p1, this.mansardEdge1.p1),
    new LineSegmentXZ(this.ridge.p1, this.mansardEdge2.p1),
    new LineSegmentXZ(this.ridge.p2, this.mansardEdge1.p2),
    new LineSegmentXZ(this.ridge.p2, this.mansardEdge2.p2),
    new LineSegmentXZ(this.cap1.p1, this.mansardEdge1.p1),
    new LineSegmentXZ(this.cap2.p2, this.mansardEdge1.p2),
    new LineSegmentXZ(this.cap1.p2, this.mansardEdge2.p1),
    new LineSegmentXZ(this.cap2.p1, this.mansardEdge2.p2),
    new LineSegmentXZ(this.mansardEdge1.p1, this.mansardEdge2.p1),
    new LineSegmentXZ(this.mansardEdge1.p2, this.mansardEdge2.p2)
  ];
};

getRoofEleAt_noInterpolation = function(pos) {
  if (this.ridge.p1.equals(pos) || this.ridge.p2.equals(pos)) {
    return this.getMaxRoofEle();
  }
  if (this.getPolygon().getOuter().getVertexLoop().contains(pos)) {
    return this.getMaxRoofEle() - this.roofHeight;
  }
  if (this.mansardEdge1.p1.equals(pos) || this.mansardEdge1.p2.equals(pos) || this.mansardEdge2.p1.equals(pos) || this.mansardEdge2.p2.equals(pos)) {
    return this.getMaxRoofEle() - 1/3.0 * this.roofHeight;
  }

  return null;
};

//*************************************************************************************************

function OnionRoof() {
 SpindleRoof.apply(this, arguments);
}

OnionRoof.prototype = Object.create(SpindleRoof.prototype);

OnionRoof.prototype.renderTo = function() {
  var roofY = this.getMaxRoofEle() - this.getRoofHeight();

  this.renderSpindle(polygon.getOuter().makeClockwise(), asList(
    roofY,
    roofY + 0.15 * this.roofHeight,
    roofY + 0.52 * this.roofHeight,
    roofY + 0.72 * this.roofHeight,
    roofY + 0.82 * this.roofHeight,
    roofY + 1.00 * this.roofHeight),
    asList(1.0, 0.8, 1.0, 0.7, 0.15, 0.0)
  );
};

OnionRoof.prototype.getDefaultRoofHeight = function() {
  return polygon.getOuter().getDiameter();
};

//*************************************************************************************************

function DomeRoof() {
 SpindleRoof.apply(this, arguments);
}

DomeRoof.prototype = Object.create(SpindleRoof.prototype);

/**
 * number of height rings to approximate the round dome shape
 */
DomeRoof.HEIGHT_RINGS = 10;

DomeRoof.prototype.renderTo = function() {
  var roofY = this.getMaxRoofEle() - this.getRoofHeight();
  var heights = [];
  var scales = [];
  for (var ring = 0; ring < DomeRoof.HEIGHT_RINGS; ++ring) {
    var relativeHeight = ring / (DomeRoof.HEIGHT_RINGS - 1);
    heights.push(roofY + relativeHeight * this.roofHeight);
    scales.push(Math.sqrt(1.0 - relativeHeight * relativeHeight));
  }

  this.renderSpindle(polygon.getOuter().makeClockwise(), heights, scales);
};

//*************************************************************************************************

function parseMeasure() {}
function drawTriangles() {}
function drawTriangleStrip() {}
function triangleTexCoordLists() {}
function distanceFromLineSegment() {}
function interpolateValue() {}
function triangulate() {}
