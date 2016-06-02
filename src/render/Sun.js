
var Sun = {

  setDate: function(date) {
    var pos = suncalc(date, APP.position.latitude, APP.position.longitude);
    this.direction = [
      -Math.sin(pos.azimuth) * Math.cos(pos.altitude),
       Math.cos(pos.azimuth) * Math.cos(pos.altitude),
                               Math.sin(pos.altitude)
    ];

    var rotationInDeg = pos.azimuth / (Math.PI/180);
    var tiltInDeg     = 90 - pos.altitude / (Math.PI/180);

    this.viewMatrix = new GLX.Matrix()
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

    this.viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(this.viewMatrix, this.projMatrix));
  }
};
