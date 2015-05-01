
var Basemap = {};

// TODO: try to use tiles from other zoom levels when some are missing

(function() {

  var shader, projection;

  function onResize() {
    var size = Map.size;
    gl.viewport(0, 0, size.width, size.height);
    projection = Matrix.perspective(20, size.width, size.height, 40000);
//  projectionOrtho = Matrix.ortho(size.width, size.height, 40000);
  }

  Basemap.initShader = function() {
    shader = new Shader('basemap');
    Events.on('resize', onResize);
    onResize();
  };

  Basemap.render = function() {
    var
      program = shader.use(),
      tiles = TileGrid.getTiles();

    for (var key in tiles) {
      tiles[key].render(program, projection);
    }

    program.end();
  };

}());
