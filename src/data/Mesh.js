
var Mesh = function(data, position, options) {
  this.options = options || {};

  this.zoom = 16;

//  this.offset = data.offset;

  if (data.meshes) {
    this.offset = data.offset;

    var worldSize = TILE_SIZE * Math.pow(2, 16);
    var p = project(data.offset.latitude, data.offset.longitude, worldSize);

    data = triangulate(p.x, p.y, 0, data.meshes);
  }

  this.vertexBuffer = this.createBuffer(3, new Float32Array(data.vertices));
  this.normalBuffer = this.createBuffer(3, new Float32Array(data.normals));
  this.colorBuffer  = this.createBuffer(3, new Uint8Array(data.colors));

//  this.offset = position;
};

function triangulate(offsetX, offsetY, offsetZ, meshes) {
  var
    data = {
      vertices: [],
      normals: [],
      colors: []
    },
    polygon3d;

  for (var i = 0, il = meshes.length; i < il; i++) {
    polygon3d = transform(offsetX, offsetY, offsetZ, meshes[i].coordinates);
    Triangulate.polygon3d(data, polygon3d, meshes[i].color);
  }

  return data;
}

function transform(offsetX, offsetY, offsetZ, coordinates) {
  var
    worldSize = TILE_SIZE * Math.pow(2, 16),
    p;

  for (var i = 0, il = coordinates.length-2; i < il; i+=3) {
    p = project(coordinates[i+1], coordinates[i], worldSize);
    coordinates[i]   = p.x-offsetX;
    coordinates[i+1] = p.y-offsetY;
    coordinates[i+2] -= offsetZ;
  }

  return coordinates;
}

Mesh.prototype = {

  createBuffer: function(itemSize, data) {
    var buffer = gl.createBuffer();
    buffer.itemSize = itemSize;
    buffer.numItems = data.length/itemSize;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  },

  render: function(program, projection) {
    var ratio = 1/Math.pow(2, 16-Map.zoom); // * (this.options.scale || 1);

    var size = Map.size;
    var origin = Map.origin;
    var position = project(this.offset.latitude, this.offset.longitude, TILE_SIZE * Math.pow(2, Map.zoom));

    var matrix = Matrix.create();
    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.75);
    matrix = Matrix.translate(matrix, position.x-origin.x, position.y-origin.y, 0);
    matrix = Matrix.rotateZ(matrix, Map.rotation);
    matrix = Matrix.rotateX(matrix, Map.tilt);
    matrix = Matrix.translate(matrix, size.width/2, size.height/2, 0);
    matrix = Matrix.multiply(matrix, projection);

    gl.uniformMatrix4fv(program.uniforms.uMatrix, false, new Float32Array(matrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(program.attributes.aPosition, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(program.attributes.aNormal, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(program.attributes.aColor, this.colorBuffer.itemSize, gl.UNSIGNED_BYTE, true, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);
  },

  destroy: function() {
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.normalBuffer);
    gl.deleteBuffer(this.colorBuffer);
  }
};
