
var OBJ = {};

(function() {

  function addVertex(index, line) {
    var x = parseFloat(line[1]);
    var y = parseFloat(line[2]);
    var z = parseFloat(line[3]);
    index.vertices.push([x, z, y]);
  }

  function addNormal(index, line) {
    index.normals.push([ parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3]) ]);
  }

  function addTexCoord(index, line) {
    index.texCoords.push([ parseFloat(line[1]), parseFloat(line[2]) ]);
  }

  function addFace(model, polygon, index) {
    var vertex, normal, color = [240, 220, 200], texCoord, attr;


    for (var i = 1, il = 4; i < il; i++) { // il = polygon.length
      attr = polygon[i].split('/');

      vertex   = index.vertices[  attr[0]-1 ];
      normal   = index.normals[   attr[2]-1 ];
      texCoord = index.texCoords[ attr[1]-1 ];

      model.vertices.push( vertex[0],   vertex[1], vertex[2]);
      model.normals.push(  normal[0],   normal[1], normal[2]);
      model.colors.push(   color[0],    color[1],  color[2]);
      model.texCoords.push(texCoord[0], texCoord[1]);
    }
  }

  OBJ.read = function(str) {
    var index = {
      vertices: [],
      normals: [],
      texCoords: []
    };

    var model = {
      vertices: [],
      normals: [],
      colors: [],
      texCoords: []
    };

    var lines = str.split('\n'), line;
    for (var i = 0, il = lines.length; i < il; i++) {
      line = lines[i].split(' ');
      switch (line[0]) {
        case 'v':  addVertex(index, line); break;
        case 'vn': addNormal(index, line); break;
        case 'vt': addTexCoord(index, line); break;
        case 'f':  addFace(model, line, index); break;
      }
    }

    return model;
  };

}());
