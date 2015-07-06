
var SkyDome = {};

(function() {

  var RADIUS = 1300;
  var NUM_LON_UNITS = 20;
  var NUM_LAT_UNITS = 10;

  var shader;

  var vertices = [];
  var texCoords = [];

  var tris = Triangulate.dome({}, {}, RADIUS, 0, 0);

  var vertexBuffer;
  var texCoordBuffer;
  var texture;

  SkyDome.initShader = function() {
    shader = new Shader('textured');
    vertexBuffer = new GL.Buffer(3, new Float32Array(tris.vertices));
    texCoordBuffer = new GL.Buffer(2, new Float32Array(tris.texCoords));
    texture = new GL.Texture();
    texture.load(BASE_DIR +'/assets/skydome.jpg');
  };

  SkyDome.render = function() {
    if (!texture.isLoaded) {
      return;
    }

    shader.enable();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, Map.transform);

    vertexBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aPosition, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    texture.enable(0);
    gl.uniform1i(shader.uniforms.uTileImage, 0);

    gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numItems);

    shader.disable();
  };

}());
