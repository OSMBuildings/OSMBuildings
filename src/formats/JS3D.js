
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

  function createNormals(vertices) {
    var normals = [], n;
    for (var i = 0, il = vertices.length-8; i < il; i+=9) {
      n = normal(
        vertices[i+0], vertices[i+1], vertices[i+2],
        vertices[i+3], vertices[i+4], vertices[i+5],
        vertices[i+6], vertices[i+7], vertices[i+8]
      );
      normals.push(
        n[0], n[1], n[2],
        n[0], n[1], n[2],
        n[0], n[1], n[2]
      );
    }
    return normals;
  }

  function createColors(vertexNum, color) {
    var colors = [], c = color ? color.toRGBA() : { r:255*0.75, g:255*0.75, b:255*0.75 };
    for (var i = 0; i < vertexNum; i++) {
      colors.push(c.r, c.g, c.b);
    }
    return colors;
  }

  //JS3D.read = function(offsetX, offsetY, zoom, json) {
  //  var
  //    buildings = json.meshes,
  //    bld,
  //    color,
  //    data = {
  //      vertices: [],
  //      normals: [],
  //      colors: []
  //    },
  //    j, jl,
  //    polygon;
  //
  //  for (var i = 0, il = buildings.length; i < il; i++) {
  //    bld = buildings[i];
  //
  //    color = { r:bld.wallColor[0], g:bld.wallColor[1], b:bld.wallColor[2] };
  //    for (j = 0, jl = bld.walls.length; j < jl; j++) {
  //      polygon = transform(offsetX, offsetY, zoom, bld.walls[j]);
  //      Triangulate.polygon3d(data, [polygon], color);
  //    }
  //
  //    color = { r:bld.roofColor[0], g:bld.roofColor[1], b:bld.roofColor[2] };
  //    for (j = 0, jl = bld.roofs.length; j < jl; j++) {
  //      polygon = transform(offsetX, offsetY, zoom, bld.roofs[j]);
  //      Triangulate.polygon3d(data, [polygon], color);
  //    }
  //  }
  //
  //  return data;
  //};

  JS3D.read = function(json, color) {
    var
      collection = json.collection,
      mesh,
      data = {
        vertices: [],
        normals: [],
        colors: []
      };

    for (var i = 0, il = collection.length; i < il; i++) {
      mesh = collection[i];
      data.vertices.push.apply(data.vertices, mesh.vertices);
      data.normals.push.apply(data.normals, mesh.normals || createNormals(mesh.vertices));
      data.colors.push.apply(data.colors, mesh.colors || createColors(mesh.vertices.length/3, color));
    }

    return data;
  };

}());
