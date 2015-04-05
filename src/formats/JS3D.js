
var JS3D = {};

(function() {

  function transform(offsetX, offsetY, zoom, ring) {
    var
      worldSize = TILE_SIZE * Math.pow(2, zoom),
      res = [],
      p;

    for (var j = 0, jl = ring.length-2; j < jl; j+=3) {
      p = project(ring[j+1], ring[j], worldSize);
      res[j/3] = [p.x-offsetX, p.y-offsetY, ring[j+2]];
    }

    return res;
  }

  JS3D.read = function(offsetX, offsetY, zoom, json) {
    var
      buildings = json.meshes,
      bld,
      color,
      data = {
        vertices: [],
        normals: [],
        colors: []
      },
      j, jl,
      polygon;

    for (var i = 0, il = buildings.length; i < il; i++) {
      bld = buildings[i];

      color = { r:bld.wallColor[0], g:bld.wallColor[1], b:bld.wallColor[2] };
      for (j = 0, jl = bld.walls.length; j < jl; j++) {
        polygon = transform(offsetX, offsetY, zoom, bld.walls[j]);
        Triangulate.polygon3d(data, [polygon], color);
      }

      color = { r:bld.roofColor[0], g:bld.roofColor[1], b:bld.roofColor[2] };
      for (j = 0, jl = bld.roofs.length; j < jl; j++) {
        polygon = transform(offsetX, offsetY, zoom, bld.roofs[j]);
        Triangulate.polygon3d(data, [polygon], color);
      }
    }

    return data;
  };

}());
