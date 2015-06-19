
var SkyDome = {};

(function() {

  var RADIUS = 1300;
  var NUM_LON_UNITS = 20;
  var NUM_LAT_UNITS = 10;

  var shader;
  var isReady = false;

  var vertices = [];
  var texCoords = [];

  var image = new Image();
  var texture;

  image.onload = function() {
    var maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (maxTexSize<image.width) {
      var maxTexPot = Math.round(Math.log(maxTexSize)/Math.log(2));
      var canvas = document.createElement('canvas');
      canvas.width = 1<<maxTexPot;
      canvas.height = 1<<(maxTexPot - 2);
      var ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      image = canvas;
    }

    texture = new GL.Texture({ image: image });
    isReady = true;
  };

  image.src = 'skydome.jpg';

  var tris = Tirangulate.dome({}, {}, RADIUS, 0, 0);
  vertices.push.apply(vertices, verts);
  texCoords.push.apply(texCoords, tcs);

  var vertexBuffer;
  var texCoordBuffer;

  SkyDome.initShader = function() {
    shader = new Shader('textured');
    vertexBuffer = new GL.Buffer(3, new Float32Array(tris.vertices));
    texCoordBuffer = new GL.Buffer(2, new Float32Array(tris.texCoords));
  };

  SkyDome.render = function(mapMatrix) {
    if (!isReady) {
      return;
    }

    shader.use();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, new Float32Array(mapMatrix));

    vertexBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aPosition, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    texture.enable(0);
    gl.uniform1i(shader.uniforms.uTileImage, 0);

    gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numItems);

    shader.end();
  };

}());
