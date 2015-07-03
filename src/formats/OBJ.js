
var OBJ = function() {
  this.vertices = [];
};

if (typeof module !== 'undefined') {
  module.exports = OBJ;
}

OBJ.prototype = {

  parseMaterials: function(str) {
    var lines = str.split(/[\r\n]/g), cols;
    var i, il;

    var materials = {};
    var data = null;

    for (i = 0, il = lines.length; i < il; i++) {
  	  cols = lines[i].trim().split(/\s+/);

      switch (cols[0]) {
  	    case 'newmtl':
          this.storeMaterial(materials, data);
          data = { id:cols[1], color:{} };
        break;

  	    case 'Kd':
  	      data.color.r = parseFloat(cols[1])*255 <<0;
  	      data.color.g = parseFloat(cols[2])*255 <<0;
  	      data.color.b = parseFloat(cols[3])*255 <<0;
  	    break;

  	    case 'd':
          data.color.a = parseFloat(cols[1]);
        break;
  	  }
    }

    this.storeMaterial(materials, data);
    return materials;
  },

  storeMaterial: function(materials, data) {
    if (data !== null) {
      materials[ data.id ] = data.color;
    }
  },

  parseModel: function(str, materials) {
    var lines = str.split(/[\r\n]/g), cols;
    var i, il;

    var meshes = [];
    var id;
    var color;
    var faces = [];

    for (i = 0, il = lines.length; i < il; i++) {
  	  cols = lines[i].trim().split(/\s+/);

      switch (cols[0]) {
        case 'g':
        case 'o':
          this.storeMesh(meshes, id, color, faces);
          id = cols[1];
          faces = [];
        break;

        case 'usemtl':
          this.storeMesh(meshes, id, color, faces);
          if (materials[ cols[1] ]) {
            color = materials[ cols[1] ];
          }
          faces = [];
        break;

        case 'v':
          this.vertices.push([parseFloat(cols[1]), parseFloat(cols[2]), parseFloat(cols[3])]);
        break;

  	    case 'f':
  	      faces.push([ parseFloat(cols[1])-1, parseFloat(cols[2])-1, parseFloat(cols[3])-1 ]);
  	    break;
	    }
    }

    this.storeMesh(meshes, id, color, faces);
    return meshes;
  },

  storeMesh: function(meshes, id, color, faces) {
    if (faces.length) {
      var geometry = this.createGeometry(faces);
      meshes.push({
        id: id,
        color: color,
        vertices: geometry.vertices,
        normals: geometry.normals
      });
    }
  },

  createGeometry: function(faces) {
  	var v0, v1, v2;
  	var e1, e2;
  	var nor, len;

    var geometry = { vertices:[], normals:[] };

    for (var i = 0, il = faces.length; i < il; i++) {
  		v0 = this.vertices[ faces[i][0] ];
  		v1 = this.vertices[ faces[i][1] ];
  		v2 = this.vertices[ faces[i][2] ];

      e1 = [ v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2] ];
  		e2 = [ v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2] ];

  		nor = [ e1[1]*e2[2] - e1[2]*e2[1], e1[2]*e2[0] - e1[0]*e2[2], e1[0]*e2[1] - e1[1]*e2[0] ];
  		len = Math.sqrt(nor[0]*nor[0] + nor[1]*nor[1] + nor[2]*nor[2]);

  		nor[0] /= len;
      nor[1] /= len;
      nor[2] /= len;

  		geometry.vertices.push(
        v0[0], v0[2], v0[1],
        v1[0], v1[2], v1[1],
        v2[0], v2[2], v2[1]
      );

  		geometry.normals.push(
        nor[0], nor[1], nor[2],
        nor[0], nor[1], nor[2],
        nor[0], nor[1], nor[2]
      );
    }

    return geometry;
  }
};

OBJ.parse = function(objData, mtlData) {
  var objParser = new OBJ();
  var materials = mtlData ? objParser.parseMaterials(mtlData) : {};
  return objParser.parseModel(objData, materials);
};
