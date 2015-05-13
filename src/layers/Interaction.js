
// TODO: render only clicked area

var Interaction = {};

(function() {

  var shader;
  var idMapping = [null], callback;

  Interaction.initShader = function() {
    shader = new Shader('interaction');
  };

  Interaction.render = function(mapMatrix) {
    if (!callback) {
      return;
    }

    if (Map.zoom < MIN_ZOOM) {
      callback();
      return;
    }

    shader.use();

    gl.clearColor(0, 0, 0, 1);
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

      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, new Float32Array(matrix));

      gl.bindBuffer(gl.ARRAY_BUFFER, item.vertexBuffer);
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, item.idColorBuffer);
      gl.vertexAttribPointer(shader.attributes.aColor, item.idColorBuffer.itemSize, gl.UNSIGNED_BYTE, true, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    shader.end();
    callback();
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

  Interaction.getFeatureID = function(pos, fn) {
    callback = function() {
      var
        width  = GL.width,
        height = GL.height;

      var imageData = new Uint8Array(width*height*4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, imageData);

      var index = ((height-pos.y)*width + pos.x) * 4;
      var color = imageData[index] | (imageData[index + 1]<<8) | (imageData[index + 2]<<16);

      fn(idMapping[color]);
      callback = null;
    };
  };

}());
