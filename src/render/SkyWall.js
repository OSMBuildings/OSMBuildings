
render.SkyWall = function() {
    
  this.v1 = this.v2 = this.v3 = this.v4 = [false, false, false];
  this.updateGeometry( [[0,0,0], [0,0,0], [0,0,0], [0,0,0]]);

  this.shader = new glx.Shader({
    vertexShader: Shaders.skydome.vertex,
    fragmentShader: Shaders.skydome.fragment,
    attributes: ['aPosition', 'aTexCoord'],
    uniforms: ['uAbsoluteHeight', 'uModelMatrix', 'uViewMatrix', 'uProjMatrix', 'uMatrix', 'uTexIndex', 'uFogColor']
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

render.SkyWall.prototype.updateGeometry = function(viewTrapezoid) {
  
  var v1 = [viewTrapezoid[3][0], viewTrapezoid[3][1], 0.0];
  var v2 = [viewTrapezoid[2][0], viewTrapezoid[2][1], 0.0];
  var v3 = [viewTrapezoid[2][0], viewTrapezoid[2][1], SKYWALL_HEIGHT];
  var v4 = [viewTrapezoid[3][0], viewTrapezoid[3][1], SKYWALL_HEIGHT];

  if ( equal3(v1, this.v1) &&
       equal3(v2, this.v2) &&
       equal3(v3, this.v3) &&
       equal3(v4, this.v4))
     return; //still up-to-date

  this.v1 = v1;
  this.v2 = v2;
  this.v3 = v3;
  this.v4 = v4;

  if (this.vertexBuffer)
    this.vertexBuffer.destroy();

  var vertices = [].concat(v1, v2, v3, v1, v3, v4);
  this.vertexBuffer = new glx.Buffer(3, new Float32Array(vertices));

  if (this.texCoordBuffer)
    this.texCoordBuffer.destroy();

  var inverse = glx.Matrix.invert(render.viewProjMatrix.data);
  var vBottomCenter = getIntersectionWithXYPlane(0, -1, inverse);
  
  var vLeftDir = norm2(sub2( v1, vBottomCenter));
  var vRightDir =norm2(sub2( v2, vBottomCenter));
  var vLeftArc = Math.atan2(vLeftDir[1],  vLeftDir[0])/  (2*Math.PI);
  var vRightArc= Math.atan2(vRightDir[1], vRightDir[0])/ (2*Math.PI);
  
  if (vLeftArc > vRightArc)
    vRightArc +=1;
  //console.log(vLeftArc, vRightArc);

  var visibleSkyDiameterFraction = Math.asin(dot2( vLeftDir, vRightDir))/ (2*Math.PI);
  var tcLeft = vLeftArc;//MAP.rotation/360.0;
  var tcRight =vRightArc;//MAP.rotation/360.0 + visibleSkyDiameterFraction*3;
        
  this.texCoordBuffer = new glx.Buffer(2, new Float32Array(
    [tcLeft,0, tcRight,0, tcRight,1, tcLeft,0, tcRight,1, tcLeft,1]));
    
  v1 = [viewTrapezoid[0][0], viewTrapezoid[0][1], 1.0];
  v2 = [viewTrapezoid[1][0], viewTrapezoid[1][1], 1.0];
  v3 = [viewTrapezoid[2][0], viewTrapezoid[2][1], 1.0];
  v4 = [viewTrapezoid[3][0], viewTrapezoid[3][1], 1.0];
  
  if (this.floorVertexBuffer)
    this.floorVertexBuffer.destroy();
    
  this.floorVertexBuffer = new glx.Buffer(3, new Float32Array(
    [].concat( v1, v2, v3, v4)));
};

render.SkyWall.prototype.render = function() {
  if (!this.isReady) {
    return;
  }

  var
    fogColor = render.fogColor,
    shader = this.shader;

  shader.enable();

  gl.uniform3fv(shader.uniforms.uFogColor, fogColor);
  gl.uniform1f( shader.uniforms.uAbsoluteHeight, SKYWALL_HEIGHT*10.0);

  var modelMatrix = new glx.Matrix();
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
  

  this.floorShader.enable();
  gl.uniform4fv(this.floorShader.uniforms.uColor, fogColor.concat([1.0]));
  gl.uniformMatrix4fv(this.floorShader.uniforms.uMatrix, false, glx.Matrix.multiply(modelMatrix, render.viewProjMatrix));
  this.floorShader.bindBuffer(this.floorVertexBuffer, 'aPosition');
  gl.drawArrays(gl.TRIANGLE_FAN, 0, this.floorVertexBuffer.numItems);
  
  this.floorShader.disable();
  
};

render.SkyWall.prototype.destroy = function() {
  this.texture.destroy();
};

