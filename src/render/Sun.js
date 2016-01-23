
function getDirection(rotationInDeg, tiltInDeg) {
  var azimuth = rotationInDeg * Math.PI / 180;
  var inclination = tiltInDeg * Math.PI / 180;

  var x = -Math.sin(azimuth) * Math.cos(inclination);
  var y =  Math.cos(azimuth) * Math.cos(inclination);
  var z =                      Math.sin(inclination);
  return [x, y, z];
}

var Sun = {

  setDate: function(date) {
    //var pos = suncalc(date, MAP.position.latitude, MAP.position.longitude);
    var pos = { azimuth: 45, altitude: 45};
    var rotationInDeg = pos.azimuth / (Math.PI/180);
    var tiltInDeg     = 90 - pos.altitude / (Math.PI/180);

    this.direction = getDirection(rotationInDeg, tiltInDeg);

    this.viewMatrix = new glx.Matrix()
      .rotateZ(rotationInDeg)
      .rotateX(tiltInDeg)
      .translate(0, 0, -5000)
      .scale(1, -1, 1); // flip Y
  },

  updateView: function(coveredGroundVertices) {
    // TODO: could parts be pre-calculated?
    this.projMatrix = getCoveringOrthoProjection(
      substituteZCoordinate(coveredGroundVertices, 0.0).concat(substituteZCoordinate(coveredGroundVertices,SHADOW_MAP_MAX_BUILDING_HEIGHT)),
      this.viewMatrix,
      1000,
      7500
    );

    this.viewProjMatrix = new glx.Matrix(glx.Matrix.multiply(this.viewMatrix, this.projMatrix));
  }
};
