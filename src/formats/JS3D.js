
var JS3D = {};

(function() {

  //function transform(offsetX, offsetY, zoom, ring) {
  //  var
  //    worldSize = TILE_SIZE * Math.pow(2, zoom),
  //    res = [],
  //    p;
  //
  //  for (var j = 0, jl = ring.length-2; j < jl; j+=3) {
  //    p = project(ring[j+1], ring[j], worldSize);
  //    res[j/3] = [p.x-offsetX, p.y-offsetY, ring[j+2]];
  //  }
  //
  //  return res;
  //}

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
    var colors = [], c = color ? color : { r:255*0.75, g:255*0.75, b:255*0.75 };
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

  JS3D.read = function(json, properties) {
    var
      collection = json.collection,
      mesh,
      meshNormals, meshColors, meshIDColors,
      color,
      numVertices,
      data = {
        vertices: [],
        normals: [],
        colors: [],
        idColors: []
      },
      j, k;

    if (properties.color) {
      color = Color.parse(properties.color).toRGBA();
    }

    for (var i = 0, il = collection.length; i < il; i++) {
      mesh = collection[i];
      numVertices = mesh.vertices.length/3;
      meshNormals  = mesh.normals || createNormals(mesh.vertices);
      meshColors   = mesh.colors || createColors(numVertices, color);
      meshIDColors = createColors(numVertices, Interaction.idToColor(mesh.id || properties.id));

      for (j = 0; j < numVertices; j++) {
        k = j*3;
        data.vertices.push(mesh.vertices[k], mesh.vertices[k+1], mesh.vertices[k+2]);
        data.normals.push(meshNormals[k], meshNormals[k+1], meshNormals[k+2]);
        data.colors.push(meshColors[k], meshColors[k+1], meshColors[k+2]);
        data.idColors.push(meshIDColors[k], meshIDColors[k+1], meshIDColors[k+2]);
      }
    }

    return data;
  };

}());
