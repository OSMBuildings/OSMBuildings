
var SkyDome = {};

(function() {

  var radius = 100;

  var NUM_LON_UNITS = 20;
  var NUM_LAT_UNITS = 10;

  var shader;

  var vertices = [];
  var texCoords = [];

  var tris = Triangulate.dome({}, {}, radius, 0, 0);

  var vertexBuffer;
  var texCoordBuffer;
  var texture;
  var textureIsLoaded;

  function getScale() {
    var screenRadius = Math.sqrt(WIDTH*WIDTH + HEIGHT*HEIGHT);
    var scale = 1/Math.pow(2, MIN_ZOOM-Map.zoom);
    return screenRadius * scale / radius;
  }

  SkyDome.initShader = function() {
    var url = 'skydome.jpg';

    shader = new glx.Shader(SHADERS.textured);
    vertexBuffer = new glx.Buffer(3, new Float32Array(tris.vertices));
    texCoordBuffer = new glx.Buffer(2, new Float32Array(tris.texCoords));
    texture = new glx.Texture();
    setBusy(url);
    texture.load(url, function(image) {
      setIdle(url);
      if (image) {
        textureIsLoaded = true;
      }
    });
    return this;
  };

  SkyDome.render = function(vpMatrix) {
    if (!textureIsLoaded) {
      return;
    }

    shader.enable();

    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    var mMatrix = new glx.Matrix();

    var scale = getScale();
    mMatrix.scale(scale, scale, scale);

    mMatrix
      .rotateZ(Map.rotation)
      .translate(WIDTH/2, HEIGHT/2, 0)
      .rotateX(Map.tilt)
      .translate(0, HEIGHT/2, 0);
//      .multiply(renderer.perspective);

    GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, mMatrix.data);
    //mvp = glx.Matrix.multiply(mMatrix, vpMatrix);
    //GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, mvp);


    vertexBuffer.enable();
    GL.vertexAttribPointer(shader.attributes.aPosition, vertexBuffer.itemSize, GL.FLOAT, false, 0, 0);

    texCoordBuffer.enable();
    GL.vertexAttribPointer(shader.attributes.aTexCoord, texCoordBuffer.itemSize, GL.FLOAT, false, 0, 0);

    texture.enable(0);
    GL.uniform1i(shader.uniforms.uTileImage, 0);

    GL.drawArrays(GL.TRIANGLES, 0, vertexBuffer.numItems);

    shader.disable();
  };

  SkyDome.getRadius = function() {
    return radius * getScale();
  };

}());
