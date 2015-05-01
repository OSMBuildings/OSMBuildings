
// TODO: render only clicked area

var Interaction = {};

(function() {

  var shader;
  var idMapping = [null];

  // TODO: move this
  function onResize() {
    gl.viewport(0, 0, Map.size.width, Map.size.height);
  }

  Interaction.initShader = function() {
    shader = new Shader('interaction');
    Events.on('resize', onResize);
    onResize();
  };

  Interaction.render = function(mapMatrix) {
    if (Map.zoom < MIN_ZOOM) {
      return;
    }

    var program = shader.use();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var
      dataItems = Data.items,
      item,
      matrix;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(matrix = item.getMatrix())) {
        continue;
      }

      matrix = Matrix.multiply(matrix, mapMatrix);

      gl.uniformMatrix4fv(program.uniforms.uMatrix, false, new Float32Array(matrix));

      gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
      gl.vertexAttribPointer(program.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, item.idColorBuffer);
      gl.vertexAttribPointer(program.attributes.aColor, item.idColorBuffer.itemSize, gl.UNSIGNED_BYTE, true, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    program.end();
  };

  Interaction.getIdFromXY = function(x, y) {
    if (!imageData) {
      return;
    }
    var pos = 4*((y|0) * WIDTH + (x|0));
    var index = imageData[pos] | (imageData[pos+1]<<8) | (imageData[pos+2]<<16);
    return idMapping[index];
  };

  Interaction.idToColor = function(id) {
    var index = idMapping.indexOf(id);
    if (index === -1) {
      idMapping.push(id);
      index = idMapping.length-1;
    }
//  return { r:255, g:128,b:0 }
    return {
      r:  index        & 0xff,
      g: (index >>  8) & 0xff,
      b: (index >> 16) & 0xff
    };
  };

}());
