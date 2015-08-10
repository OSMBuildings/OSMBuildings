
// TODO: render only clicked area

var Interaction = {};

(function() {

  var shader;
  var idMapping = [null], callback;

  Interaction.initShader = function() {
    shader = new glx.Shader(SHADERS.interaction);

    Events.on('resize', function() {
      shader.framebuffer.setSize(WIDTH, HEIGHT);
    }.bind(this));

    return this;
  };

  Interaction.render = function(renderer) {
    if (!callback) {
      return;
    }

    if (Map.zoom < MIN_ZOOM) {
      callback();
      return;
    }

    shader.enable();

    GL.clearColor(0, 0, 0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    var
      dataItems = Data.items,
      item,
      mMatrix;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(mMatrix = item.getMatrix())) {
        continue;
      }

      var mv = glx.Matrix.multiply(mMatrix, Map.transform);
      var mvp = glx.Matrix.multiply({ data:mv }, renderer.perspective);
      GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, mvp);

      item.vertexBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, GL.FLOAT, false, 0, 0);

      item.idColorBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aColor, item.idColorBuffer.itemSize, GL.UNSIGNED_BYTE, true, 0, 0);

      item.visibilityBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aHidden, item.visibilityBuffer.itemSize, GL.FLOAT, false, 0, 0);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    //if (shader.framebuffer) {
    var imageData = shader.framebuffer.getData();
    //} else {
    //  var imageData = new Uint8Array(WIDTH*HEIGHT*4);
    //  GL.readPixels(0, 0, WIDTH, HEIGHT, GL.RGBA, GL.UNSIGNED_BYTE, imageData);
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
      var index = ((HEIGHT-pos.y)*WIDTH + pos.x) * 4;
      var color = imageData[index] | (imageData[index + 1]<<8) | (imageData[index + 2]<<16);
      fn(idMapping[color]);
      callback = null;
    };
  };

}());
