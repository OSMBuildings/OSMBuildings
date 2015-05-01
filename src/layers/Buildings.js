
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

    var
      dataItems = Data.items,
      item,
      matrix;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(matrix = item.getMatrix())) {
        continue;
      }

      // TODO: do this once outside the loop
      matrix = Matrix.rotateZ(matrix, Map.rotation);
      matrix = Matrix.rotateX(matrix, Map.tilt);
      matrix = Matrix.translate(matrix, Map.size.width/2, Map.size.height/2, 0);
      matrix = Matrix.multiply(matrix, projection);

      gl.uniformMatrix4fv(program.uniforms.uMatrix, false, new Float32Array(matrix));

      gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
      gl.vertexAttribPointer(program.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, item.normalBuffer);
      gl.vertexAttribPointer(program.attributes.aNormal, item.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, item.colorBuffer);
      gl.vertexAttribPointer(program.attributes.aColor, item.colorBuffer.itemSize, gl.UNSIGNED_BYTE, true, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    program.end();
  };

}());
