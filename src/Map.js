
var Map = {};

(function() {

  function updateOrigin(origin) {
    Map.origin = origin;
  }

  function updateBounds() {
    var centerXY = project(Map.center.latitude, Map.center.longitude, Map.worldSize);

    var halfWidth = Map.size.width/2;
    var halfHeight = Map.size.height/2;

    var nw = unproject(centerXY.x - halfWidth, centerXY.y - halfHeight, Map.worldSize);
    var se = unproject(centerXY.x + halfWidth, centerXY.y + halfHeight, Map.worldSize);

    Map.bounds = {
      n: nw.latitude,
      w: nw.longitude,
      s: se.latitude,
      e: se.longitude
    };
  }

  //***************************************************************************

  Map.center = {};
  Map.size = { width: 0, height: 0 };

  Map.setState = function(options) {
    Map.minZoom = parseFloat(options.minZoom) || 10;
    Map.maxZoom = parseFloat(options.maxZoom) || 20;

    if (Map.maxZoom<Map.minZoom) {
      Map.maxZoom = Map.minZoom;
    }

    options = State.load(options);
    Map.setCenter(options.center || { latitude: 52.52000, longitude: 13.41000 });
    Map.setZoom(options.zoom || Map.minZoom);
    Map.setRotation(options.rotation || 0);
    Map.setTilt(options.tilt || 0);

    Events.on('change', function() {
      State.save(Map);
    });

    State.save(Map);
  };

  Map.setZoom = function(zoom, e) {
    zoom = clamp(parseFloat(zoom), Map.minZoom, Map.maxZoom);

    if (Map.zoom !== zoom) {
      if (!e) {
        Map.zoom = zoom;
        Map.worldSize = TILE_SIZE*Math.pow(2, zoom);
        updateOrigin(project(Map.center.latitude, Map.center.longitude, Map.worldSize));
      } else {
        var dx = Map.size.width/2 - e.clientX;
        var dy = Map.size.height/2 - e.clientY;
        var geoPos = unproject(Map.origin.x - dx, Map.origin.y - dy, Map.worldSize);

        Map.zoom = zoom;
        Map.worldSize = TILE_SIZE*Math.pow(2, zoom);

        var pxPos = project(geoPos.latitude, geoPos.longitude, Map.worldSize);
        updateOrigin({ x: pxPos.x + dx, y: pxPos.y + dy });
        Map.center = unproject(Map.origin.x, Map.origin.y, Map.worldSize);
      }

      updateBounds();
      Events.emit('change');
    }
  };

  Map.setCenter = function(center) {
    center.latitude = clamp(parseFloat(center.latitude), -90, 90);
    center.longitude = clamp(parseFloat(center.longitude), -180, 180);

    if (Map.center.latitude !== center.latitude || Map.center.longitude !== center.longitude) {
      Map.center = center;
      updateOrigin(project(center.latitude, center.longitude, Map.worldSize));
      updateBounds();
      Events.emit('change');
    }
  };

  Map.setSize = function(size) {
    var canvas = gl.canvas;
    if (size.width !== Map.size.width || size.height !== Map.size.height) {
      canvas.width = Map.size.width = size.width;
      canvas.height = Map.size.height = size.height;
      gl.viewport(0, 0, size.width, size.height);
      updateBounds();
      Events.emit('resize');
    }
  };

  Map.setRotation = function(rotation) {
    rotation = parseFloat(rotation)%360;
    if (Map.rotation !== rotation) {
      Map.rotation = rotation;
      updateBounds();
      Events.emit('change');
    }
  };

  Map.setTilt = function(tilt) {
    tilt = clamp(parseFloat(tilt), 0, 70);
    if (Map.tilt !== tilt) {
      Map.tilt = tilt;
      updateBounds();
      Events.emit('change');
    }
  };

  Map.destroy = function() {
  };

}());
