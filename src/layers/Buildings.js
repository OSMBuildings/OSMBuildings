
var Buildings = {};

(function() {

  var shader, projection;

  function onResize() {
    var size = Map.size;
    gl.viewport(0, 0, size.width, size.height);
    projection = Matrix.perspective(20, size.width, size.height, 40000);
//  projectionOrtho = Matrix.ortho(size.width, size.height, 40000);
  }

  Buildings.initShader = function() {
    shader = new Shader('buildings');
    Events.on('resize', onResize);
    onResize();
  };

  Buildings.render = function() {
    if (Map.zoom < MIN_ZOOM) {
      return;
    }

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.cullFace(gl.BACK);

//  gl.enable(gl.BLEND);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
//  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//  gl.disable(gl.DEPTH_TEST);

    var program = shader.use();

    // TODO: suncalc
    gl.uniform3fv(program.uniforms.uLightColor, [0.5, 0.5, 0.5]);
    gl.uniform3fv(program.uniforms.uLightDirection, unit(1, 1, 1));

    gl.uniform1f(program.uniforms.uAlpha, adjust(Map.zoom, STYLE.zoomAlpha, 'zoom', 'alpha'));

    var normalMatrix = Matrix.invert3(Matrix.create());
    gl.uniformMatrix3fv(program.uniforms.uNormalTransform, false, new Float32Array(Matrix.transpose(normalMatrix)));

    var dataItems = Data.items;
    for (var i = 0, il = dataItems.length; i < il; i++) {
      dataItems[i].render(program, projection);
    }

    program.end();
  };

}());
