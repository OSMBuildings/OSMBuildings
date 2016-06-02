
render.SkyWall = function() {
    
  this.v1 = this.v2 = this.v3 = this.v4 = [false, false, false];
  this.updateGeometry( [[0,0,0], [0,0,0], [0,0,0], [0,0,0]]);

  this.shader = new GLX.Shader({
    vertexShader: Shaders.skywall.vertex,
    fragmentShader: Shaders.skywall.fragment,
    shaderName: 'sky wall shader',
    attributes: ['aPosition', 'aTexCoord'],
    uniforms: ['uAbsoluteHeight', 'uMatrix', 'uTexIndex', 'uFogColor']
  });
  
  this.floorShader = new GLX.Shader({
    vertexShader:   Shaders.flatColor.vertex,
    fragmentShader: Shaders.flatColor.fragment,
    attributes: ['aPosition'],
    uniforms:   ['uColor', 'uMatrix']
  });
  
  Activity.setBusy();
  var url = APP.baseURL + '/skydome.jpg';
  this.texture = new GLX.texture.Image().load(url, function(image) {
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
  this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

  if (this.texCoordBuffer)
    this.texCoordBuffer.destroy();

  var inverse = GLX.Matrix.invert(render.viewProjMatrix.data);
  var vBottomCenter = getIntersectionWithXYPlane(0, -1, inverse);
  
  var vLeftDir = norm2(sub2( v1, vBottomCenter));
  var vRightDir =norm2(sub2( v2, vBottomCenter));
  var vLeftArc = Math.atan2(vLeftDir[1],  vLeftDir[0])/  (2*Math.PI);
  var vRightArc= Math.atan2(vRightDir[1], vRightDir[0])/ (2*Math.PI);
  
  if (vLeftArc > vRightArc)
    vRightArc +=1;
  //console.log(vLeftArc, vRightArc);

  var visibleSkyDiameterFraction = Math.asin(dot2( vLeftDir, vRightDir))/ (2*Math.PI);
  var tcLeft = vLeftArc;//APP.rotation/360.0;
  var tcRight =vRightArc;//APP.rotation/360.0 + visibleSkyDiameterFraction*3;
        
  this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(
    [tcLeft, 1, tcRight, 1, tcRight, 0, tcLeft, 1, tcRight, 0, tcLeft, 0]));
    
  v1 = [viewTrapezoid[0][0], viewTrapezoid[0][1], 1.0];
  v2 = [viewTrapezoid[1][0], viewTrapezoid[1][1], 1.0];
  v3 = [viewTrapezoid[2][0], viewTrapezoid[2][1], 1.0];
  v4 = [viewTrapezoid[3][0], viewTrapezoid[3][1], 1.0];
  
  if (this.floorVertexBuffer)
    this.floorVertexBuffer.destroy();
    
  this.floorVertexBuffer = new GLX.Buffer(3, new Float32Array(
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

  shader.setUniforms([
    ['uFogColor',       '3fv', fogColor],
    ['uAbsoluteHeight', '1f',  SKYWALL_HEIGHT*10.0]
  ]);

  shader.setUniformMatrix('uMatrix', '4fv', render.viewProjMatrix.data);

  shader.bindBuffer( this.vertexBuffer,   'aPosition');
  shader.bindBuffer( this.texCoordBuffer, 'aTexCoord');

  shader.bindTexture('uTexIndex', 0, this.texture);

  GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);
  shader.disable();
  

  this.floorShader.enable();
  this.floorShader.setUniform('uColor', '4fv', fogColor.concat([1.0]));
  this.floorShader.setUniformMatrix('uMatrix', '4fv', render.viewProjMatrix.data);
  this.floorShader.bindBuffer(this.floorVertexBuffer, 'aPosition');
  GL.drawArrays(GL.TRIANGLE_FAN, 0, this.floorVertexBuffer.numItems);
  
  this.floorShader.disable();
  
};

render.SkyWall.prototype.destroy = function() {
  this.texture.destroy();
};

