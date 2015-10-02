
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

  JS3D.read = function(data, offsetX, offsetY, zoom, json) {
    var
      buildings = json.meshes,
      bld,
      color,
      idColor, index, indexXY,
      j, jl,
      polygon;

    for (var i = 0, il = buildings.length; i < il; i++) {
      bld = buildings[i];

      index = data.dataTexture.length / 8;
      if (index >= 256*256) index = 0;
      indexXY = index/256;

//indexXY = [
//  (index%256)     / 256,
//  (index/256 <<0) / 256
//];
//indexXY = [0,0];

      idColor = InteractionShader.idToColor(bld.id);
      data.dataTexture.push(idColor.r, idColor.g, idColor.b, bld.height || DEFAULT_HEIGHT);

      data.dataTexture.push(bld.wallColor[0], bld.wallColor[1], bld.wallColor[2], 0);
      color = { r:bld.wallColor[0], g:bld.wallColor[1], b:bld.wallColor[2] };
      for (j = 0, jl = bld.walls.length; j < jl; j++) {
        polygon = transform(offsetX, offsetY, zoom, bld.walls[j]);
        Triangulate.polygon3d(data, [polygon], color, indexXY);
      }

//    data.dataTexture.push(bld.roofColor[0], bld.roofColor[1], bld.roofColor[2], 0);
      color = { r:bld.roofColor[0], g:bld.roofColor[1], b:bld.roofColor[2] };
      for (j = 0, jl = bld.roofs.length; j < jl; j++) {
        polygon = transform(offsetX, offsetY, zoom, bld.roofs[j]);
        Triangulate.polygon3d(data, [polygon], color, indexXY);
      }
    }

    return data;
  };

}());
