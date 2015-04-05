
var gl;

var GLRenderer = function(gl_) {
  gl = gl_;
  this.shaderPrograms.default = new Shader('default');
  this.onMapResize();
};

GLRenderer.prototype = {

  projections: {},
  shaderPrograms: {},

  clear: function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  },

  render: function() {
    var program;
		var i, il;

    if (Map.zoom < MIN_ZOOM) {
      return;
    }

    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.cullFace(gl.BACK);

//  gl.enable(gl.BLEND);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//  gl.disable(gl.DEPTH_TEST);

    program = this.shaderPrograms.default.use();

    // TODO: suncalc
    gl.uniform3fv(program.uniforms.uLightColor, [0.5, 0.5, 0.5]);
    gl.uniform3fv(program.uniforms.uLightDirection, unit(1, 1, 1));

    gl.uniform1f(program.uniforms.uAlpha, adjust(Map.zoom, STYLE.zoomAlpha, 'zoom', 'alpha'));

    var normalMatrix = Matrix.invert3(Matrix.create());
    gl.uniformMatrix3fv(program.uniforms.uNormalTransform, false, new Float32Array(Matrix.transpose(normalMatrix)));

    var dataItems = Data.items;
    for (i = 0, il = dataItems.length; i < il; i++) {
      dataItems[i].render(program, this.projections.perspective);
    }

    program.end();
  },

  onMapResize: function() {
    var size = Map.size;
    gl.viewport(0, 0, size.width, size.height);
    this.projections.perspective = Matrix.perspective(20, size.width, size.height, 40000);
    this.projections.ortho = Matrix.ortho(size.width, size.height, 40000);
  }
};
