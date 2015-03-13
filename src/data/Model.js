
var Model = function(data, position, options) {
  this.options = options || {};

  this.vertexBuffer = this.createBuffer(3, new Float32Array(data.vertices));
  this.normalBuffer = this.createBuffer(3, new Float32Array(data.normals));
  this.colorBuffer  = this.createBuffer(3, new Uint8Array(data.colors));

  this.offset = data.offset;

  this.position = position;
};

Model.prototype = {

  createBuffer: function(itemSize, data) {
    var buffer = gl.createBuffer();
    buffer.itemSize = itemSize;
    buffer.numItems = data.length/itemSize;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  },

  render: function(program, projection) {
    var ratio = 1/Math.pow(2, 16-Map.zoom) * (this.options.scale || 1);

    var size = Map.size;
    var origin = Map.origin;
    var pos = project(this.position.latitude, this.position.longitude, TILE_SIZE * Math.pow(2, Map.zoom));

    var matrix = Matrix.create();
    matrix = Matrix.translate(matrix, -this.offset.x, -this.offset.y, -this.offset.z);
    matrix = Matrix.scale(matrix, ratio, ratio, ratio*0.75);
    matrix = Matrix.translate(matrix, pos.x-origin.x, pos.y-origin.y, 0);
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
