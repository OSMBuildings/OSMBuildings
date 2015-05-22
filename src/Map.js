
var Map = {};

(function() {

  function updateBounds() {
    var
      center = Map.center,
      halfWidth  = Scene.width/2,
      halfHeight = Scene.height/2;
    Map.bounds = {
      maxY: center.y + halfHeight,
      minX: center.x - halfWidth,
      minY: center.y - halfHeight,
      maxX: center.x + halfWidth
    };
  }

  //***************************************************************************

  Map.center = { x:0, y:0 };
  Map.zoom = 0;

  Map.setState = function(options) {
    Map.minZoom = parseFloat(options.minZoom) || 10;
    Map.maxZoom = parseFloat(options.maxZoom) || 20;

    if (Map.maxZoom<Map.minZoom) {
      Map.maxZoom = Map.minZoom;
    }

    options = State.load(options);
    Map.setPosition(options.position || { latitude: 52.52000, longitude: 13.41000 });
    Map.setZoom(options.zoom || Map.minZoom);
    Map.setRotation(options.rotation || 0);
    Map.setTilt(options.tilt || 0);

    Events.on('resize', function() {
      updateBounds();
    });

    State.save(Map);
  };

  Map.setZoom = function(zoom, e) {
    zoom = clamp(parseFloat(zoom), Map.minZoom, Map.maxZoom);

    if (Map.zoom !== zoom) {
      var ratio = Math.pow(2, zoom-Map.zoom);
      Map.zoom = zoom;
      if (!e) {
        Map.center.x *= ratio;
        Map.center.y *= ratio;
      } else {
        var dx = Scene.width/2  - e.clientX;
        var dy = Scene.height/2 - e.clientY;
        Map.center.x -= dx;
        Map.center.y -= dy;
        Map.center.x *= ratio;
        Map.center.y *= ratio;
        Map.center.x += dx;
        Map.center.y += dy;
      }
      updateBounds();
      Events.emit('change');
    }
  };

  Map.getPosition = function() {
    return unproject(Map.center.x, Map.center.y, TILE_SIZE*Math.pow(2, Map.zoom));
  };

  Map.setPosition = function(position) {
    var latitude  = clamp(parseFloat(position.latitude), -90, 90);
    var longitude = clamp(parseFloat(position.longitude), -180, 180);
    var center = project(latitude, longitude, TILE_SIZE*Math.pow(2, Map.zoom));
    Map.setCenter(center);
  };

  Map.setCenter = function(center) {
    if (Map.center.x !== center.x || Map.center.y !== center.y) {
      Map.center = center;
      updateBounds();
      Events.emit('change');
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
    tilt = clamp(parseFloat(tilt), 0, 60);
    if (Map.tilt !== tilt) {
      Map.tilt = tilt;
      updateBounds();
      Events.emit('change');
    }
  };

  Map.destroy = function() {
  };

}());
