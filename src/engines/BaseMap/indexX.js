  transform: function(latitude, longitude, elevation) {
    var
      pos = MAP.project(latitude, longitude, BaseMap.TILE_SIZE*Math.pow(2, MAP.zoom)),
      x = pos.x-MAP.center.x,
      y = pos.y-MAP.center.y;

    var scale = 1/Math.pow(2, 16 - MAP.zoom);
    var mMatrix = new glx.Matrix()
      .translate(0, 0, elevation)
      .scale(scale, scale, scale*HEIGHT_SCALE)
      .translate(x, y, 0);

    var mvp = glx.Matrix.multiply(mMatrix, Renderer.vpMatrix);

    var t = glx.Matrix.transform(mvp);
    return { x: t.x*MAP.width, y: MAP.height - t.y*MAP.height, z: t.z }; // takes current cam pos into account.
  },

  getBounds: function() {
    var
      W2 = MAP.width/2, H2 = MAP.height/2,
      angle = MAP.rotation*Math.PI/180,
      x = Math.cos(angle)*W2 - Math.sin(angle)*H2,
      y = Math.sin(angle)*W2 + Math.cos(angle)*H2,
      center = MAP.center,
      worldSize = BaseMap.TILE_SIZE*Math.pow(2, MAP.zoom),
      nw = MAP.unproject(center.x - x, center.y - y, worldSize),
      se = MAP.unproject(center.x + x, center.y + y, worldSize);
    return {
      n: nw.latitude,
      w: nw.longitude,
      s: se.latitude,
      e: se.longitude
    };
  }
