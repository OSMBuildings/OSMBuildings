
// TODO: handle inner rings

function addRidgedRoof(buffers, properties, polygon, offset, dim, wallColor, roofColor) {
  offset = 0; // TODO

  var
    outerPolygon = polygon[0],
    direction;

  if (properties.roofRidgeDirection !== undefined) {
    var angle = parseFloat(properties.roofRidgeDirection);
    if (!isNaN(angle)) {
      var rad = 90+angle*Math.PI/180;
      direction = [Math.sin(rad), Math.cos(rad)];
    }
  } else if (properties.roofDirection !== undefined) {
    var angle = parseFloat(properties.roofDirection);
    if (!isNaN(angle)) {
      var rad = angle*Math.PI/180;
      direction = [Math.sin(rad), Math.cos(rad)];
    }
  } else {
    direction = getPolygonDirection(outerPolygon);
    if (properties.roofOrientation && properties.roofOrientation === 'across') {
      direction = [-direction[1], direction[0]];
    }
  }

  direction = vec2.scale(direction, 1000);

  // calculate the two outermost intersection indices of the
  // quasi-infinite ridge line with segments of the polygon

  var intersections = getPolygonIntersections(outerPolygon, [vec2.sub(dim.center, direction), vec2.add(dim.center, direction)]);

  if (intersections.length < 2) {
    throw new Error('can\'t handle ridged roof geometry');
  }

  // roof caps that are close to first and second vertex of the ridge
  var
    cap1 = intersections[0],
    cap2 = intersections[1];

  // make sure, indices are in ascending order
  if (cap1.index > cap2.index) {
    var tmp = cap1;
    cap1 = cap2;
    cap2 = tmp;
  }

  // put ridge to the centers of the intersected segments
  cap1.center = getSegmentCenter(cap1.segment);
  cap2.center = getSegmentCenter(cap2.segment);

  if (offset === 0) {
    var ridge = [cap1.center, cap2.center];

    var
      maxDistance = 0,
      distances = [];

    for (var i = 0; i < outerPolygon.length; i++) {
      distances[i] = getDistanceToLine(outerPolygon[i], ridge);
      maxDistance = Math.max(maxDistance, distances[i]);
    }

    // modify vertical position of all points
    for (var i = 0; i < outerPolygon.length; i++) {
      outerPolygon[i][2] = (1-distances[i]/maxDistance) * dim.roofHeight;
    }

    cap1.center[2] = dim.roofHeight;
    cap2.center[2] = dim.roofHeight;

    // create roof faces

    var roofFace1 = [cap1.center];
    roofFace1 = roofFace1.concat(outerPolygon.slice(cap1.index+1, cap2.index+1));
    roofFace1.push(cap2.center, cap1.center);
    split.polygon(buffers, [roofFace1], dim.roofZ, roofColor);

    var roofFace2 = [cap2.center];
    roofFace2 = roofFace2.concat(outerPolygon.slice(cap2.index+1, outerPolygon.length-1));
    roofFace2 = roofFace2.concat(outerPolygon.slice(0, cap1.index+1));
    roofFace2.push(cap1.center, cap2.center);
    split.polygon(buffers, [roofFace2], dim.roofZ, roofColor);

    // create extra wall faces

    outerPolygon.splice(cap1.index+1, 0, cap1.center);
    outerPolygon.splice(cap2.index+2, 0, cap2.center);

    for (var i = 0; i < outerPolygon.length-1; i++) {
      split.quad(
        buffers,
        [outerPolygon[i  ][0], outerPolygon[i  ][1],dim.roofZ+outerPolygon[i  ][2]],
        [outerPolygon[i  ][0], outerPolygon[i  ][1],dim.roofZ],
        [outerPolygon[i+1][0], outerPolygon[i+1][1],dim.roofZ],
        [outerPolygon[i+1][0], outerPolygon[i+1][1],dim.roofZ+outerPolygon[i+1][2]],
        wallColor
      );
    }
  }

// // absolute distance of ridge to outline
// var ridgeOffset = vec2.scale(vec2.sub(c2, c1), offset);
// return [vec2.add(c1, ridgeOffset), vec2.sub(c2, ridgeOffset)];

}

function addSkillionRoof(buffers, properties, polygon, dim, wallColor, roofColor) {

  var
    i, il,
    outerPolygon = polygon[0],
    direction;

  if (properties.roofSlopeDirection !== undefined) {
    var angle = parseFloat(properties.roofSlopeDirection);
    if (!isNaN(angle)) {
      var rad = angle*Math.PI/180;
      direction = [Math.sin(rad), Math.cos(rad)];
    }
  } else if (properties.roofDirection !== undefined) {
    var angle = parseFloat(properties.roofDirection);
    if (!isNaN(angle)) {
      var rad = angle*Math.PI/180;
      direction = [Math.sin(rad), Math.cos(rad)];
    }
  } else {
    direction = getPolygonDirection(outerPolygon);
    direction = [-direction[1], direction[0]];
    if (properties.roofOrientation && properties.roofOrientation === 'across') {
      direction = [-direction[1], direction[0]];
    }
  }

  direction = vec2.scale(direction, 1000);

  // get farthest intersection of polygon and slope line

  var
    intersections = getPolygonIntersections(outerPolygon, [vec2.sub(dim.center, direction), vec2.add(dim.center, direction)]),
    ridge,
    distance = 0,
    maxDistance = 0;

  for (i = 0, il = intersections.length; i<il; i++) {
    distance = getDistanceToLine(dim.center, intersections[i].segment);
    if (distance > maxDistance) {
      ridge = intersections[i].segment;
      maxDistance = distance;
    }
  }

  if (ridge === undefined) {
    return;
  }

  var
    maxDistance = 0,
    distances = [];
  for (var i = 0; i < outerPolygon.length; i++) {
    distances[i] = getDistanceToLine(outerPolygon[i], ridge);
    maxDistance = Math.max(maxDistance, distances[i]);
  }

  // modify vertical position of all points
  for (var i = 0; i < outerPolygon.length; i++) {
    outerPolygon[i][2] = (1-distances[i]/maxDistance) * dim.roofHeight;
  }

  // create roof face

  split.polygon(buffers, [outerPolygon], dim.roofZ, roofColor);

  // create extra wall faces

  for (var i = 0; i < outerPolygon.length-1; i++) {
    split.quad(
      buffers,
      [outerPolygon[i  ][0], outerPolygon[i  ][1],dim.roofZ+outerPolygon[i  ][2]],
      [outerPolygon[i  ][0], outerPolygon[i  ][1],dim.roofZ],
      [outerPolygon[i+1][0], outerPolygon[i+1][1],dim.roofZ],
      [outerPolygon[i+1][0], outerPolygon[i+1][1],dim.roofZ+outerPolygon[i+1][2]],
      wallColor
    );
  }
}

/***
function HalfHippedRoof(tags, polygon) {
  RidgedRoof.call(this, tags, polygon, 1/6);

  this.cap1part = [
    interpolateBetween(this.cap1[0], this.cap1[1], 0.5 - this.ridgeOffset/this.cap1.getLength()),
    interpolateBetween(this.cap1[0], this.cap1[1], 0.5 + this.ridgeOffset/this.cap1.getLength())
  ];

  this.cap2part = [
    interpolateBetween(this.cap2[0], this.cap2[1], 0.5 - this.ridgeOffset/this.cap1.getLength()),
    interpolateBetween(this.cap2[0], this.cap2[1], 0.5 + this.ridgeOffset/this.cap1.getLength())
  ];
}

HalfHippedRoof.prototype = Object.create(RidgedRoof.prototype);

HalfHippedRoof.prototype.getPolygon = function() {
  var outerPoly = this.polygon[0];

  outerPoly = insertIntoPolygon(outerPoly, this.cap1part[0], 0.2);
  outerPoly = insertIntoPolygon(outerPoly, this.cap1part[1], 0.2);
  outerPoly = insertIntoPolygon(outerPoly, this.cap2part[0], 0.2);
  outerPoly = insertIntoPolygon(outerPoly, this.cap2part[1], 0.2);

  return new PolygonWithHolesXZ(outerPoly.asSimplePolygon(), this.polygon.getHoles());
};

HalfHippedRoof.prototype.getInnerPoints = function() {
  return [];
};

HalfHippedRoof.prototype.getInnerSegments = function() {
  return [this.ridge,
    [this.ridge[0], this.cap1part[0]],
    [this.ridge[0], this.cap1part[1]],
    [this.ridge[1], this.cap2part[0]],
    [this.ridge[1], this.cap2part[1]]
  ];
};



 function GambrelRoof(tags, polygon) {
  RidgedRoof.call(this, tags, polygon, 0);

  this.cap1part = [
    interpolateBetween(this.cap1[0], this.cap1[1], 1/6.0),
    interpolateBetween(this.cap1[0], this.cap1[1], 5/6.0)
  ];

  this.cap2part = [
    interpolateBetween(this.cap2[0], this.cap2[1], 1/6.0),
    interpolateBetween(this.cap2[0], this.cap2[1], 5/6.0)
  ];
}

 GambrelRoof.prototype = Object.create(RidgedRoof.prototype);

 GambrelRoof.prototype.getPolygon = function() {
  var outerPoly = this.polygon[0];

  outerPoly = insertIntoPolygon(outerPoly, this.ridge[0], 0.2);
  outerPoly = insertIntoPolygon(outerPoly, this.ridge[1], 0.2);
  outerPoly = insertIntoPolygon(outerPoly, this.cap1part[0], 0.2);
  outerPoly = insertIntoPolygon(outerPoly, this.cap1part[1], 0.2);
  outerPoly = insertIntoPolygon(outerPoly, this.cap2part[0], 0.2);
  outerPoly = insertIntoPolygon(outerPoly, this.cap2part[1], 0.2);

  // TODO: add intersections of additional edges with outline?

  return new PolygonWithHolesXZ(
    outerPoly.asSimplePolygon(),
    this.polygon.getHoles()
  );
};

 GambrelRoof.prototype.getInnerPoints = function() {
  return [];
};

 GambrelRoof.prototype.getInnerSegments = function() {
  return [this.ridge,
    [this.cap1part[0], this.cap2part[1]],
    [this.cap1part[1], this.cap2part[0]]
  ];
};

 //*************************************************************************************************

 function RoundRoof() {
  RidgedRoof.call(this, 0);

  if (this.roofHeight<this.maxDistanceToRidge) {
    var squaredHeight = this.roofHeight*this.roofHeight;
    var squaredDist = this.maxDistanceToRidge*this.maxDistanceToRidge;
    var centerY = (squaredDist - squaredHeight)/(2*this.roofHeight);
    this.radius = Math.sqrt(squaredDist + centerY*centerY);
  } else {
    this.radius = 0;
  }

  this.rings = Math.max(3, this.roofHeight/RoundRoof.ROOF_SUBDIVISION_METER);
  this.capParts = [];
  // TODO: would be good to vary step size with slope
  var step = 0.5/(this.rings + 1);
  for (var i = 1; i<=this.rings; i++) {
    this.capParts.push([
      interpolateBetween(this.cap1[0], this.cap1[1], i*step),
      interpolateBetween(this.cap1[0], this.cap1[1], 1 - i*step)
    ]);

    this.capParts.push([
      interpolateBetween(this.cap2[0], this.cap2[1], i*step),
      interpolateBetween(this.cap2[0], this.cap2[1], 1 - i*step)
    ]);
  }
}

 RoundRoof.prototype = Object.create(RidgedRoof.prototype);

 RoundRoof.ROOF_SUBDIVISION_METER = 2.5;

 RoundRoof.prototype.getPolygon = function() {
  var outerPoly = this.polygon[0];
  outerPoly = insertIntoPolygon(outerPoly, this.ridge[0], 0.2);
  outerPoly = insertIntoPolygon(outerPoly, this.ridge[1], 0.2);

  for (var capPart in this.capParts) {
    outerPoly = insertIntoPolygon(this.outerPoly, capPart[0], 0.2);
    outerPoly = insertIntoPolygon(this.outerPoly, capPart[1], 0.2);
  }

  //TODO: add intersections of additional edges with outline?
  return new PolygonWithHolesXZ(outerPoly.asSimplePolygon(), this.polygon.getHoles());
};

 RoundRoof.prototype.getInnerPoints = function() {
  return [];
};

 RoundRoof.prototype.getInnerSegments = function() {
  var innerSegments = [];
  innerSegments.push(this.ridge);
  for (var i = 0; i<this.rings*2; i += 2) {
    var cap1part = this.capParts[i];
    var cap2part = this.capParts[i + 1];
    innerSegments.push([cap1part[0], cap2part[1]]);
    innerSegments.push([cap1part[1], cap2part[0]]);
  }
  return innerSegments;
};

 //*************************************************************************************************

 function MansardRoof(tags, polygon) {
  RidgedRoof.call(this, tags, polygon, 1/3);

  this.mansardEdge1 = [
    interpolateBetween(this.cap1[0], this.ridge[0], 1/3.0),
    interpolateBetween(this.cap2[1], this.ridge[1], 1/3.0)
  ];

  this.mansardEdge2 = [
    interpolateBetween(this.cap1[1], this.ridge[0], 1/3.0),
    interpolateBetween(this.cap2[0], this.ridge[1], 1/3.0)
  ];
}

 MansardRoof.prototype = Object.create(RidgedRoof.prototype);

 MansardRoof.prototype.getInnerPoints = function() {
  return [];
};

 MansardRoof.prototype.getInnerSegments = function() {
  return [this.ridge,
    this.mansardEdge1,
    this.mansardEdge2,
    [this.ridge[0], this.mansardEdge1[0]],
    [this.ridge[0], this.mansardEdge2[0]],
    [this.ridge[1], this.mansardEdge1[1]],
    [this.ridge[1], this.mansardEdge2[1]],
    [this.cap1[0], this.mansardEdge1[0]],
    [this.cap2[1], this.mansardEdge1[1]],
    [this.cap1[1], this.mansardEdge2[0]],
    [this.cap2[0], this.mansardEdge2[1]],
    [this.mansardEdge1[0], this.mansardEdge2[0]],
    [this.mansardEdge1[1], this.mansardEdge2[1]]
  ];
};

 ***/
