
var Adapter = {};

Adapter.initMap = function(container, options) {
  var map = new GLMap(container, options);

  map.on('change', function() {
    Events.emit('change');
  });

  map.on('resize', function() {
    if (container.offsetWidth !== WIDTH || container.offsetHeight !== HEIGHT) {
      GL.canvas.width  = WIDTH  = container.offsetWidth;
      GL.canvas.height = HEIGHT = container.offsetHeight;
      Events.emit('resize');
    }
  });

  map.on('pointerdown', function(e) {
    Interaction.getTargetID(e.x, e.y, function(id) {
      if (id) {
        e.target = { id: id };
      }
      Events.emit('pointerdown', e);
    });
  });

  map.on('pointermove', function(e) {
    Interaction.getTargetID(e.x, e.y, function(id) {
      if (id) {
        e.target = { id: id };
      }
      Events.emit('pointermove', e);
    });
  });

  map.on('pointerup', function(e) {
    Interaction.getTargetID(e.x, e.y, function(id) {
      if (id) {
        e.target = { id: id };
      }
      Events.emit('pointerup', e);
    });
  });

  return map;
};
