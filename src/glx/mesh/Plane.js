
GLX.mesh.Plane = function(size, color) {

  var data = {
    vertices: [],
    normals: [],
    colors: []
  };

  var a = [-size/2, -size/2, 0];
  var b = [ size/2, -size/2, 0];
  var c = [ size/2,  size/2, 0];
  var d = [-size/2,  size/2, 0];

  GLX.mesh.addQuad(data, a, b, c, d, color);

  this.vertexBuffer = new GLX.Buffer(3, new Float32Array(data.vertices));
  this.normalBuffer = new GLX.Buffer(3, new Float32Array(data.normals));
  this.colorBuffer  = new GLX.Buffer(4, new Float32Array(data.colors));

 	this.transform = new GLX.Matrix();
};
