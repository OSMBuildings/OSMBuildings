
var Map = {};

(function() {

  function updateBounds() {
    var
      center = Map.center,
      halfWidth  = WIDTH/2,
      halfHeight = HEIGHT/2;

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
  Map.transform = new glx.Matrix(); // there are very early actions that rely on an existing Map transform

  Map.init = function(options) {
    this.minZoom = parseFloat(options.minZoom) || 10;
    this.maxZoom = parseFloat(options.maxZoom) || 20;

    if (this.maxZoom<this.minZoom) {
      this.maxZoom = this.minZoom;
    }

    var state = State.load();
    this.setPosition(state.position || options.position || { latitude: 52.52000, longitude: 13.41000 });
    this.setZoom(state.zoom || options.zoom || this.minZoom);
    this.setRotation(state.rotation || options.rotation || 0);
    this.setTilt(state.tilt || options.tilt || 0);

    Events.on('resize', updateBounds);

    if (options.state) {
      State.save(Map);

      Events.on('change', function() {
        State.save(Map);
      });
    }
  };

  Map.setZoom = function(zoom, e) {
    zoom = clamp(parseFloat(zoom), this.minZoom, this.maxZoom);

    if (this.zoom !== zoom) {
      var ratio = Math.pow(2, zoom-this.zoom);
      this.zoom = zoom;
      if (!e) {
        this.center.x *= ratio;
        this.center.y *= ratio;
      } else {
        var dx = WIDTH/2  - e.clientX;
        var dy = HEIGHT/2 - e.clientY;
        this.center.x -= dx;
        this.center.y -= dy;
        this.center.x *= ratio;
        this.center.y *= ratio;
        this.center.x += dx;
        this.center.y += dy;
      }
      updateBounds();
      Events.emit('change');
    }
  };

  Map.getPosition = function() {
    return unproject(this.center.x, this.center.y, TILE_SIZE*Math.pow(2, this.zoom));
  };

  Map.setPosition = function(position) {
    var latitude  = clamp(parseFloat(position.latitude), -90, 90);
    var longitude = clamp(parseFloat(position.longitude), -180, 180);
    var center = project(latitude, longitude, TILE_SIZE*Math.pow(2, this.zoom));
    this.setCenter(center);
  };

  Map.setCenter = function(center) {
    if (this.center.x !== center.x || this.center.y !== center.y) {
      this.center = center;
      updateBounds();
      Events.emit('change');
    }
  };

  Map.setRotation = function(rotation) {
    rotation = parseFloat(rotation)%360;
    if (this.rotation !== rotation) {
      this.rotation = rotation;
      updateBounds();
      Events.emit('change');
    }
  };

  Map.setTilt = function(tilt) {
    tilt = clamp(parseFloat(tilt), 0, 60);
    if (this.tilt !== tilt) {
      this.tilt = tilt;
      updateBounds();
      Events.emit('change');
    }
  };

  Map.destroy = function() {};

}());
