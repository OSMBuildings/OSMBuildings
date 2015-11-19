
var render = {

  getFramebufferConfig: function(width, height, maxTexSize) {
    var config = {};

    config.width = Math.min(glx.util.nextPowerOf2(width),  maxTexSize );
    config.height= Math.min(glx.util.nextPowerOf2(height), maxTexSize );

    config.usedWidth = Math.min(width, config.width);
    config.usedHeight= Math.min(height,config.height);

    config.tcLeft  = 0.5 / config.width;
    config.tcTop   = 0.5 / config.height;
    config.tcRight = (config.usedWidth  - 0.5) / config.width;
    config.tcBottom= (config.usedHeight - 0.5) / config.height;

    return config;
  },

  getViewQuad: function() {
    return getViewQuad( this.viewProjMatrix.data,
                       (this.fogDistance + this.fogBlurDistance),
                        this.viewDirOnMap);
  },

  start: function() {
    this.viewMatrix = new glx.Matrix();
    this.projMatrix = new glx.Matrix();
    this.viewProjMatrix = new glx.Matrix();
    this.viewDirOnMap = [0.0, -1.0];

    MAP.on('change', this._onChange = this.onChange.bind(this));
    this.onChange();

    MAP.on('resize', this._onResize = this.onResize.bind(this));
    this.onResize();  //initialize projection matrix
    this.onChange();  //initialize view matrix

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    render.Interaction.init(); // renders only on demand
    render.SkyDome.init();
    render.Buildings.init();
    render.Basemap.init();
    render.Overlay.init();
    render.AmbientMap.init();
    render.Blur.init();
    //render.HudRect.init();
    //render.NormalMap.init();
    render.ShadowMap = new render.ShadowMap();
    render.CameraViewDepthMap = new render.DepthMap();
    render.SunViewDepthMap    = new render.DepthMap();
    
    render.SunViewDepthMap.framebufferConfig = {
      width:      SHADOW_DEPTH_MAP_SIZE,
      height:     SHADOW_DEPTH_MAP_SIZE,
      usedWidth:  SHADOW_DEPTH_MAP_SIZE,
      usedHeight: SHADOW_DEPTH_MAP_SIZE,
      tcLeft:     0.0,
      tcTop:      0.0,
      tcRight:    1.0,
      tcBottom:   1.0 
    };

    //var quad = new mesh.DebugQuad();
    //quad.updateGeometry( [-100, -100, 1], [100, -100, 1], [100, 100, 1], [-100, 100, 1]);
    //data.Index.add(quad);

    requestAnimationFrame( this.renderFrame.bind(this));
  },
  
  renderFrame: function() {
    requestAnimationFrame( this.renderFrame.bind(this));
    
    gl.clearColor(this.fogColor[0], this.fogColor[1], this.fogColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (MAP.zoom < APP.minZoom || MAP.zoom > APP.maxZoom) {
      return;
    }
    /*
    var viewTrapezoid = this.getViewQuad( this.viewProjMatrix.data);
    quad.updateGeometry([viewTrapezoid[0][0], viewTrapezoid[0][1], 1.0],
                        [viewTrapezoid[1][0], viewTrapezoid[1][1], 1.0],
                        [viewTrapezoid[2][0], viewTrapezoid[2][1], 1.0],
                        [viewTrapezoid[3][0], viewTrapezoid[3][1], 1.0]);*/

    render.SkyDome.render();
    gl.clear(gl.DEPTH_BUFFER_BIT);	//ensure everything is drawn in front of the sky dome

    if (render.optimize !== 'quality') {
      render.Buildings.render();
      render.Basemap.render();
    } else {
      var config = this.getFramebufferConfig(MAP.width, MAP.height, gl.getParameter(gl.MAX_TEXTURE_SIZE));

      var scale = 1.38*Math.pow(2, MAP.zoom-17);

      var sunViewMatrix = new glx.Matrix()
        .rotateZ(-120)
        .rotateX(60) //
        .translate(0, 0, -5000)
        .scale(1, -1, 1); // flip Y

      var verts = this.getViewQuad();

      var sunDirection = getDirection( -120, 60);
      var sunProjMatrix = 
        getCoveringOrthoProjection( substituteZCoordinate(verts, 0.0).concat(
                                    substituteZCoordinate(verts,SHADOW_MAP_MAX_BUILDING_HEIGHT)),
                                    sunViewMatrix, 1000, 7500);
        
      var sunViewProjMatrix = new glx.Matrix(glx.Matrix.multiply(sunViewMatrix, sunProjMatrix));
     
      render.CameraViewDepthMap.render(config, this.viewProjMatrix, true);
      render.SunViewDepthMap.render(render.SunViewDepthMap.framebufferConfig, sunViewProjMatrix);
      render.AmbientMap.render(render.CameraViewDepthMap.framebuffer.renderTexture.id, config, 0.5);
      render.Blur.render(render.AmbientMap.framebuffer.renderTexture.id, config);

      render.Buildings.render();
      render.Basemap.render( sunViewProjMatrix, render.SunViewDepthMap.framebuffer);

      render.ShadowMap.render(config, this.viewProjMatrix, sunViewProjMatrix, render.SunViewDepthMap.framebuffer, sunDirection, 0.2);

    
      gl.blendFunc(gl.ZERO, gl.SRC_COLOR); //multiply DEST_COLOR by SRC_COLOR
      gl.enable(gl.BLEND);
      render.Overlay.render( render.Blur.framebuffer.renderTexture.id, config);
      render.Overlay.render( render.ShadowMap.framebuffer.renderTexture.id, config);
      gl.disable(gl.BLEND);

      //render.HudRect.render( render.ShadowMap.framebuffer.renderTexture.id, config );
    }

    if (this.screenshotCallback) {
      this.screenshotCallback(gl.canvas.toDataURL());
      this.screenshotCallback = null;
    }  
  },

  stop: function() {
    clearInterval(this.loop);
  },

  updateFogDistance: function() {
    var inverse = glx.Matrix.invert(this.viewProjMatrix.data);
    
    //need to store this as a reference point to determine fog distance
    this.lowerLeftOnMap = getIntersectionWithXYPlane(-1, -1, inverse);
    if (this.lowerLeftOnMap === undefined) {
      return;
    }

    var lowerLeftDistanceToCenter = len2(this.lowerLeftOnMap);

    /* fogDistance: closest distance at which the fog affects the geometry */
    this.fogDistance = Math.max(1500, lowerLeftDistanceToCenter);
    /* fogBlurDistance: closest distance *beyond* fogDistance at which everything is
     *                  completely enclosed in fog. */
    this.fogBlurDistance = 300;
  },

  onChange: function() {
    var scale = 1.38*Math.pow(2, MAP.zoom-17);

    this.viewMatrix = new glx.Matrix()
      .rotateZ(MAP.rotation)
      .rotateX(MAP.tilt)
      .scale(scale, scale, scale);


    this.viewDirOnMap = [ Math.sin(MAP.rotation / 180* Math.PI),
                         -Math.cos(MAP.rotation / 180* Math.PI)];

    this.viewProjMatrix = new glx.Matrix(glx.Matrix.multiply(this.viewMatrix, this.projMatrix));
    this.updateFogDistance();
  },

  onResize: function() {
    var
      width = MAP.width,
      height = MAP.height,
      refHeight = 1024,
      refVFOV = 45;

    this.projMatrix = new glx.Matrix()
      .translate(0, -height/2, -1220) // 0, MAP y offset to neutralize camera y offset, MAP z -1220 scales MAP tiles to ~256px
      .scale(1, -1, 1) // flip Y
      .multiply(new glx.Matrix.Perspective(refVFOV * height / refHeight, width/height, 1, 7500))
      .translate(0, -1, 0); // camera y offset

    glx.context.canvas.width  = width;
    glx.context.canvas.height = height;
    glx.context.viewport(0, 0, width, height);

    this.viewProjMatrix = new glx.Matrix(glx.Matrix.multiply(this.viewMatrix, this.projMatrix));
    this.updateFogDistance();
  },

  destroy: function() {
    MAP.off('change', this._onChange);
    MAP.off('resize', this._onResize);

    this.stop();
    render.Interaction.destroy();
    render.SkyDome.destroy();
    render.Buildings.destroy();
    render.Basemap.destroy();

    render.NormalMap.destroy();
    render.CameraViewDepthMap.destroy();
    render.SunViewDepthMap.destroy();
    render.AmbientMap.destroy();
    render.Blur.destroy();
  }
};
