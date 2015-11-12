
glx.mesh.Cube = function(size, color) {

  var data = {
    vertices: [],
    normals: [],
    colors: []
  };

  var a = [-size/2, -size/2, -size/2];
  var b = [ size/2, -size/2, -size/2];
  var c = [ size/2,  size/2, -size/2];
  var d = [-size/2,  size/2, -size/2];

  var A = [-size/2, -size/2, size/2];
  var B = [ size/2, -size/2, size/2];
  var C = [ size/2,  size/2, size/2];
  var D = [-size/2,  size/2, size/2];

  glx.mesh.addQuad(data, a, b, c, d, color);
  glx.mesh.addQuad(data, A, B, C, D, color);
  glx.mesh.addQuad(data, a, b, B, A, color);
  glx.mesh.addQuad(data, b, c, C, B, color);
  glx.mesh.addQuad(data, c, d, D, C, color);
  glx.mesh.addQuad(data, d, a, A, D, color);

  this.vertexBuffer = new glx.Buffer(3, new Float32Array(data.vertices));
  this.normalBuffer = new glx.Buffer(3, new Float32Array(data.normals));
  this.colorBuffer  = new glx.Buffer(4, new Float32Array(data.colors));

  this.transform = new glx.Matrix();
};
