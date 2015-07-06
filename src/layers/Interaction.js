
// TODO: render only clicked area

var Interaction = {};

(function() {

  var shader;
  var idMapping = [null], callback;

  Interaction.initShader = function() {
    shader = new Shader('interaction');
  };

  Interaction.render = function() {
    if (!callback) {
      return;
    }

    if (Map.zoom < MIN_ZOOM) {
      callback();
      return;
    }

    shader.enable();

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var
      dataItems = Data.items,
      item,
      mMatrix;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(mMatrix = item.getMatrix())) {
        continue;
      }

      gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, Matrix.multiply(mMatrix, Map.transform));

      item.vertexBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

      item.idColorBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aColor, item.idColorBuffer.itemSize, gl.UNSIGNED_BYTE, true, 0, 0);

      item.visibilityBuffer.enable();
      gl.vertexAttribPointer(shader.attributes.aHidden, item.visibilityBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    //if (shader.framebuffer) {
    var imageData = shader.framebuffer.getData();
    //} else {
    //  var imageData = new Uint8Array(Scene.width*Scene.height*4);
    //  gl.readPixels(0, 0, Scene.width, Scene.height, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    //}
    shader.disable();
    callback(imageData);
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
    callback = function(imageData) {
      var width = Scene.width, height = Scene.height;
      var index = ((height-pos.y)*width + pos.x) * 4;
      var color = imageData[index] | (imageData[index + 1]<<8) | (imageData[index + 2]<<16);
      fn(idMapping[color]);
      callback = null;
    };
  };

}());
