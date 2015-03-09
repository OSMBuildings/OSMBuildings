
var DataItem = function(data) {
/*
  var i = Math.random() * 100;
  i = Math.round(i/3) * 3;

  var x = data.vertices[i+0];
  var y = data.vertices[i+1];
  var z = data.vertices[i+2];

  console.log('RAW', x, y, z);

  var ratio = 1/Math.pow(2, 16-Map.zoom);
  var size = Map.size;
  var origin = Map.origin;

  x *= ratio;
  y *= ratio;
  z *= ratio*0.65;

  console.log('SCALED', x, y, z);

  x -= origin.x;
  y -= origin.y;
  z -= 0;

  console.log('TRANSLATED 1', x, y, z);

  x += size.width/2;
  y += size.height/2;
  z -= 0;

  console.log('TRANSLATED 2', x, y, z);

*/

  this.vertexBuffer = this.createBuffer(3, new Float32Array(data.vertices));
  this.normalBuffer = this.createBuffer(3, new Float32Array(data.normals));
  this.colorBuffer  = this.createBuffer(3, new Uint8Array(data.colors));
};

DataItem.prototype = {

  createBuffer: function(itemSize, data) {
    var buffer = gl.createBuffer();
    buffer.itemSize = itemSize;
    buffer.numItems = data.length/itemSize;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  },

  render: function(program, projection) {
//  var ratio = (1/12000) / Math.pow(2, 16-Map.zoom);
    var ratio = 1/Math.pow(2, 16-Map.zoom);
    var size = Map.size;
    var origin = Map.origin;

    var matrix = Matrix.create();
    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.65);
//  var pos = project(this.position.latitude, this.position.longitude, TILE_SIZE * Math.pow(2, Map.zoom));
//  matrix = Matrix.translate(matrix, pos.x-origin.x, pos.y-origin.y, 0);
    matrix = Matrix.translate(matrix, -origin.x, -origin.y, 0);
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
