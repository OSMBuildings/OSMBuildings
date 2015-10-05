
basemap.Tile = function(x, y, zoom) {
  this.x = x;
  this.y = y;
  this.zoom = zoom;
  var numSegments = 4;

  var meshStep = 255/numSegments;
  var textureStep = 1/numSegments;

  var vertices = [];
  var texCoords = [];

  for (var cols = 0; cols < numSegments; cols++) {
    for (var rows = 0; rows < numSegments; rows++) {
      vertices.push(
        (cols+1)*meshStep, (rows+1)*meshStep, 0,
        (cols+1)*meshStep, (rows+0)*meshStep, 0,
        (cols+0)*meshStep, (rows+1)*meshStep, 0,
        (cols+0)*meshStep, (rows+0)*meshStep, 0
      );

      texCoords.push(
        (cols+1)*textureStep, (rows+1)*textureStep,
        (cols+1)*textureStep, (rows+0)*textureStep,
        (cols+0)*textureStep, (rows+1)*textureStep,
        (cols+0)*textureStep, (rows+0)*textureStep
      );
    }
  }

  this.vertexBuffer = new glx.Buffer(3, new Float32Array(vertices));
  this.texCoordBuffer = new glx.Buffer(2, new Float32Array(texCoords));
};

basemap.Tile.prototype = {
  load: function(url) {
    Activity.setBusy();
    this.texture = new glx.texture.Image(url, function(image) {
      Activity.setIdle();
      if (image) {
        this.isReady = true;
      }
    }.bind(this));
  },

  isVisible: function(bounds) {
    // TODO: factor in tile origin
    return (this.zoom === bounds.zoom && (this.x >= bounds.minX && this.x <= bounds.maxX && this.y >= bounds.minY && this.y <= bounds.maxY));
  },

  destroy: function() {
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();
    if (this.texture) {
      this.texture.destroy();
    }
  }
};
