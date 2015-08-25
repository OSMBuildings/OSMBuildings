
var SkyDome = {};

(function() {

  var shader;
  var baseRadius = 500;

  var vertexBuffer;
  var texCoordBuffer;
  var texture;
  var textureIsLoaded;

  function createDome(radius) {
    var
      res = { vertices: [], texCoords: [] },
      latSegments = 8,
      lonSegments = 24,
      sin = Math.sin,
      cos = Math.cos,
      PI = Math.PI,
      azimuth1, x1, y1,
      azimuth2, x2, y2,
      polar1,
      polar2,
      A, B, C, D,
      tcLeft,
      tcRight,
      tcTop,
      tcBottom;

    for (var i = 0, j; i < lonSegments; i++) {
      tcLeft = i/lonSegments;
      azimuth1 = tcLeft*2*PI; // convert to radiants [0...2*PI]
      x1 = cos(azimuth1)*radius;
      y1 = sin(azimuth1)*radius;

      tcRight = (i+1)/lonSegments;
      azimuth2 = tcRight*2*PI;
      x2 = cos(azimuth2)*radius;
      y2 = sin(azimuth2)*radius;

      for (j = 0; j < latSegments; j++) {
        polar1 = j*PI/(latSegments*2); //convert to radiants in [0..1/2*PI]
        polar2 = (j+1)*PI/(latSegments*2);

        A = [x1*cos(polar1), y1*cos(polar1), radius*sin(polar1)];
        B = [x2*cos(polar1), y2*cos(polar1), radius*sin(polar1)];
        C = [x2*cos(polar2), y2*cos(polar2), radius*sin(polar2)];
        D = [x1*cos(polar2), y1*cos(polar2), radius*sin(polar2)];

        res.vertices.push.apply(res.vertices, A);
        res.vertices.push.apply(res.vertices, B);
        res.vertices.push.apply(res.vertices, C);
        res.vertices.push.apply(res.vertices, A);
        res.vertices.push.apply(res.vertices, C);
        res.vertices.push.apply(res.vertices, D);

        tcTop    = 1 - (j+1)/latSegments;
        tcBottom = 1 - j/latSegments;

        res.texCoords.push(tcLeft, tcBottom, tcRight, tcBottom, tcRight, tcTop, tcLeft, tcBottom, tcRight, tcTop, tcLeft, tcTop);
      }
    }

    return res;
  }

  SkyDome.initShader = function() {
    var url = 'skydome.jpg';

    var tris = createDome(baseRadius);

    this.resize();
    Events.on('resize', this.resize.bind(this));

    shader = new glx.Shader({
      vertexShader: SHADERS.skydome.vertex,
      fragmentShader: SHADERS.skydome.fragment,
      attributes: ["aPosition", "aTexCoord"],
      uniforms: ["uMatrix", "uTileImage", "uFogColor"]
    });

    vertexBuffer = new glx.Buffer(3, new Float32Array(tris.vertices));
    texCoordBuffer = new glx.Buffer(2, new Float32Array(tris.texCoords));
    Activity.setBusy();
    texture = new glx.texture.Image(url, function(image) {
      Activity.setIdle();
      if (image) {
        textureIsLoaded = true;
      }
    });

    return this;
  };

  SkyDome.resize = function() {
    var maxSize = Math.max(WIDTH, HEIGHT);
    this.radius = maxSize * Math.sqrt(2) / 1;
  };

  SkyDome.render = function(vpMatrix) {
    if (!textureIsLoaded) {
      return;
    }

    shader.enable();

    GL.uniform3fv(shader.uniforms.uFogColor, [Renderer.fogColor.r, Renderer.fogColor.g, Renderer.fogColor.b]);

    var mMatrix = new glx.Matrix();
    var scale = this.radius/baseRadius;
    mMatrix.scale(scale, scale, scale);

    var mvp = glx.Matrix.multiply(mMatrix, vpMatrix);
    GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, mvp);

    vertexBuffer.enable();
    GL.vertexAttribPointer(shader.attributes.aPosition, vertexBuffer.itemSize, GL.FLOAT, false, 0, 0);

    texCoordBuffer.enable();
    GL.vertexAttribPointer(shader.attributes.aTexCoord, texCoordBuffer.itemSize, GL.FLOAT, false, 0, 0);

    texture.enable(0);
    GL.uniform1i(shader.uniforms.uTileImage, 0);

    GL.drawArrays(GL.TRIANGLES, 0, vertexBuffer.numItems);

    shader.disable();
  };

}());
