
render.SkyDome = function() {
  var geometry = this.createGeometry(this.baseRadius);
  this.vertexBuffer   = new glx.Buffer(3, new Float32Array(geometry.vertices));
  this.texCoordBuffer = new glx.Buffer(2, new Float32Array(geometry.texCoords));
  this.floorVertexBuffer= new glx.Buffer(3, new Float32Array(geometry.verticesFloor));

  this.shader = new glx.Shader({
    vertexShader: Shaders.skydome.vertex,
    fragmentShader: Shaders.skydome.fragment,
    attributes: ['aPosition', 'aTexCoord'],
    uniforms: ['uAbsoluteHeight', 'uModelMatrix', 'uViewMatrix', 'uProjMatrix', 'uMatrix', 'uTexIndex', 'uFogColor', 'uBendRadius', 'uBendDistance']
  });
  
  this.floorShader = new glx.Shader({
    vertexShader:   Shaders.flatColor.vertex,
    fragmentShader: Shaders.flatColor.fragment,
    attributes: ['aPosition'],
    uniforms:   ['uColor', 'uMatrix']
  });

  Activity.setBusy();
  var url = APP.baseURL + '/skydome.jpg';
  this.texture = new glx.texture.Image().load(url, function(image) {
    Activity.setIdle();
    if (image) {
      this.isReady = true;
    }
  }.bind(this));
};

render.SkyDome.prototype.baseRadius = 100;

render.SkyDome.prototype.createGeometry = function(radius) {
  var
    latSegments = 8,
    lonSegments = 24,
    vertices = [],
    texCoords = [],
    verticesFloor = [],
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

      vertices.push.apply(vertices, [].concat(A,B,C,A,C,D));

      tcTop    = (1 - (j+1)/latSegments)*0.95;
      tcBottom = (1 - j/latSegments)*0.95;

      texCoords.push(tcLeft, tcBottom, tcRight, tcBottom, tcRight, tcTop, tcLeft, tcBottom, tcRight, tcTop, tcLeft, tcTop);
    }
  }

  //skydome floor  
  for (i = 2; i <= lonSegments+1; i++)
  {
    var vx = [ cos(-i/lonSegments*2*PI)*radius, sin(-i/lonSegments*2*PI)*radius, 0];
    [].push.apply(verticesFloor, vx);
  }

  return { vertices: vertices, texCoords: texCoords, verticesFloor: verticesFloor };
};

//dummy method to have the same interface and thus be interchangable with SkyWall
render.SkyDome.prototype.updateGeometry = function() {};

render.SkyDome.prototype.render = function() {
  if (!this.isReady) {
    return;
  }

  var
    fogColor = render.fogColor,
    shader = this.shader,
    //about the maximum skydome size at which the whole dome is always closer 
    //that the far plane no matter the zoom level or camera orientation
    scale = 45;

  shader.enable();

  gl.uniform3fv(shader.uniforms.uFogColor, fogColor);
  gl.uniform1f( shader.uniforms.uAbsoluteHeight, this.baseRadius*scale/10.0);

  gl.uniform1f(shader.uniforms.uBendRadius, render.bendRadius);
  gl.uniform1f(shader.uniforms.uBendDistance, render.bendDistance);

  var modelMatrix = new glx.Matrix();
  // Move skydome slightly down to prevent z-fighting with the basemap
  modelMatrix.translate(0,0,-5);
  modelMatrix.scale(scale, scale, scale);

  gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, modelMatrix.data);
  gl.uniformMatrix4fv(shader.uniforms.uViewMatrix,  false, render.viewMatrix.data);
  gl.uniformMatrix4fv(shader.uniforms.uProjMatrix,  false, render.projMatrix.data);
  gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));

  shader.bindBuffer( this.vertexBuffer,   'aPosition');
  shader.bindBuffer( this.texCoordBuffer, 'aTexCoord');

  gl.uniform1i(shader.uniforms.uTexIndex, 0);

  this.texture.enable(0);

  gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

  shader.disable();
  
  //draw skydome floor
  this.floorShader.enable();

  gl.uniform4fv(this.floorShader.uniforms.uColor, fogColor.concat([1.0]));
  gl.uniformMatrix4fv(this.floorShader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));
  this.floorShader.bindBuffer(this.floorVertexBuffer, 'aPosition');
  gl.drawArrays(gl.TRIANGLE_FAN, 0, this.floorVertexBuffer.numItems);
  
  this.floorShader.disable();
};

render.SkyDome.prototype.destroy = function() {
  this.texture.destroy();
};
