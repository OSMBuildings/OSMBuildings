
sfunction HalfHippedRoof(tags, polygon) {
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

//*************************************************************************************************

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
