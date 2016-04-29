
var render = {

  getViewQuad: function() {
    return getViewQuad( this.viewProjMatrix.data,
                       (this.fogDistance + this.fogBlurDistance),
                        this.viewDirOnMap);
  },

  start: function() {
    // disable effects if they rely on WebGL extensions
    // that the current hardware does not support
    if (!GL.depthTextureExtension) {
      console.log('[WARN] effects "shadows" and "outlines" disabled in OSMBuildings, because your GPU does not support WEBGL_depth_texture');
      //both effects rely on depth textures
      delete render.effects.shadows;
      delete render.effects.outlines;
    }

    MAP.on('change', this._onChange = this.onChange.bind(this));
    MAP.on('resize', this._onResize = this.onResize.bind(this));
    this.onResize();  //initialize view and projection matrix, fog distance, etc.

    GL.cullFace(GL.BACK);
    GL.enable(GL.CULL_FACE);
    GL.enable(GL.DEPTH_TEST);

    render.Anaglyph.init();
    render.Picking.init(); // renders only on demand
    render.sky = new render.SkyWall();
    render.Buildings.init();
    render.Basemap.init();
    render.Overlay.init();
    render.AmbientMap.init();
    render.OutlineMap.init();
    render.blurredAmbientMap = new render.Blur();
    render.blurredOutlineMap = new render.Blur();
    render.leftEyeFramebuffer = new GLX.Framebuffer( 1024, 1024);
    render.rightEyeFramebuffer = new GLX.Framebuffer(1024, 1024);
    
    //render.HudRect.init();
    //render.NormalMap.init();
    render.MapShadows.init();
    if (render.effects.shadows || render.effects.outlines) {
      render.cameraGBuffer = new render.DepthFogNormalMap();
    }
    
    if (render.effects.shadows) {
      render.sunGBuffer    = new render.DepthFogNormalMap();
      render.sunGBuffer.framebufferSize = [SHADOW_DEPTH_MAP_SIZE, SHADOW_DEPTH_MAP_SIZE];
    }

    //var quad = new mesh.DebugQuad();
    //quad.updateGeometry( [-100, -100, 1], [100, -100, 1], [100, 100, 1], [-100, 100, 1]);
    //data.Index.add(quad);

    requestAnimationFrame( this.renderFrame.bind(this));
  },
  
  renderFrame: function() {
    Filter.nextTick();
    requestAnimationFrame( this.renderFrame.bind(this));

    this.onChange();    
    GL.clearColor(this.fogColor[0], this.fogColor[1], this.fogColor[2], 0.0);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    if (MAP.zoom < APP.minZoom || MAP.zoom > APP.maxZoom) {
      return;
    }
    var viewTrapezoid = this.getViewQuad();
    /*
    quad.updateGeometry([viewTrapezoid[0][0], viewTrapezoid[0][1], 1.0],
                        [viewTrapezoid[1][0], viewTrapezoid[1][1], 1.0],
                        [viewTrapezoid[2][0], viewTrapezoid[2][1], 1.0],
                        [viewTrapezoid[3][0], viewTrapezoid[3][1], 1.0]);*/

    Sun.updateView(viewTrapezoid);
    render.sky.updateGeometry(viewTrapezoid);
    var viewSize = [MAP.width, MAP.height];
    var halfWidth = MAP.width / 2 | 0;
    
    
    function renderEyeFramebuffer(framebuffer, width, height, isRightEye) {
      framebuffer.setSize(width, height);
      framebuffer.enable();
      render.onChange(isRightEye);
      GL.clearColor(render.fogColor[0], render.fogColor[1], render.fogColor[2], 0.0);
      GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
      GL.viewport(0, 0, width, height);

      render.Buildings.render();
      render.Basemap.render();

      GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);
      GL.disable(GL.DEPTH_TEST);
      GL.enable(GL.BLEND);
      render.sky.render();
      GL.disable(GL.BLEND);
      GL.enable(GL.DEPTH_TEST);

      framebuffer.disable();
    }


    
    var anaglyph = false;
    if (anaglyph) {
      renderEyeFramebuffer(render.leftEyeFramebuffer,  MAP.width, MAP.height, false);
      renderEyeFramebuffer(render.rightEyeFramebuffer, MAP.width, MAP.height, true);
      GL.viewport(0, 0, MAP.width, MAP.height);
          //console.log("%s, %s", MAP.width, MAP.height);
          //var config = this.getFramebufferConfig(MAP.width, MAP.height, gl.getParameter(gl.MAX_TEXTURE_SIZE));
      render.Anaglyph.render(
        render.leftEyeFramebuffer.renderTexture, 
        render.rightEyeFramebuffer.renderTexture
      );
    } else {
      renderEyeFramebuffer(render.leftEyeFramebuffer, halfWidth, MAP.height, false);
      renderEyeFramebuffer(render.rightEyeFramebuffer, MAP.width - halfWidth, MAP.height, true);
      
      GL.viewport(0, 0, halfWidth, MAP.height);
      render.Overlay.render( render.leftEyeFramebuffer.renderTexture);

      GL.viewport(halfWidth, 0, MAP.width - halfWidth, MAP.height);
      render.Overlay.render( render.rightEyeFramebuffer.renderTexture);
    }

  
    if (this.screenshotCallback) {
      this.screenshotCallback(GL.canvas.toDataURL());
      this.screenshotCallback = null;
    }
  },

  stop: function() {
    clearInterval(this.loop);
  },
  
  onChange: function(isRightEye) {
    var 
      scale = 1.38*Math.pow(2, MAP.zoom-17),
      width = MAP.width,
      height = MAP.height,
      refHeight = 1024,
      refVFOV = 45;

    GL.viewport(0, 0, width, height);

    this.viewMatrix = new GLX.Matrix()
      .rotateZ(MAP.rotation)
      .rotateX(MAP.tilt)
      .translate(0, 0, -1220/scale); //move away to simulate zoom; -1220 scales MAP tiles to ~256px

    if (isRightEye)
        this.viewMatrix.translate(-2*scale, 0, 0);

    this.viewDirOnMap = [ Math.sin(MAP.rotation / 180* Math.PI),
                         -Math.cos(MAP.rotation / 180* Math.PI)];

    // OSMBuildings' perspective camera is ... special: The reference point for
    // camera movement, rotation and zoom is at the screen center (as usual). 
    // But the center of projection is not at the screen center as well but at
    // the bottom center of the screen. This projection was chosen for artistic
    // reasons so that when the map is seen from straight above, vertical building
    // walls would not be seen to face towards the screen center but would
    // uniformly face downward on the screen.
    
    // To achieve this projection, we need to
    // 1. shift the whole geometry up half a screen (so that the desired
    //    center of projection aligns with the view center) *in world coordinates*.
    // 2. perform the actual perspective projection (and flip the y coordinate for
    //    internal reasons).
    // 3. shift the geometry back down half a screen now *in screen coordinates*

    this.projMatrix = new GLX.Matrix()
      .translate(0, -height/(2.0*scale), 0) // 0, MAP y offset to neutralize camera y offset, 
      .scale(1, -1, 1) // flip Y
      .multiply(new GLX.Matrix.Perspective(refVFOV * height / refHeight, width/height, 1, 7500))
      .translate(0, -1, 0); // camera y offset

    this.viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(this.viewMatrix, this.projMatrix));

    //need to store this as a reference point to determine fog distance
    this.lowerLeftOnMap = getIntersectionWithXYPlane(-1, -1, GLX.Matrix.invert(this.viewProjMatrix.data));
    if (this.lowerLeftOnMap === undefined) {
      return;
    }

    var lowerLeftDistanceToCenter = len2(this.lowerLeftOnMap);

    /* fogDistance: closest distance at which the fog affects the geometry */
    this.fogDistance = Math.max(3000, lowerLeftDistanceToCenter);
    /* fogBlurDistance: closest distance *beyond* fogDistance at which everything is
     *                  completely enclosed in fog. */
    this.fogBlurDistance = 500;
  },

  onResize: function() {
    GL.canvas.width  = MAP.width;
    GL.canvas.height = MAP.height;
    this.onChange();
  },

  destroy: function() {
    MAP.off('change', this._onChange);
    MAP.off('resize', this._onResize);

    this.stop();
    render.Picking.destroy();
    render.sky.destroy();
    render.Buildings.destroy();
    render.Basemap.destroy();

    if (render.cameraGBuffer) {
      render.cameraGBuffer.destroy();
    }
    
    if (render.sunGBuffer) {
      render.sunGBuffer.destroy();  
    }
    
    render.AmbientMap.destroy();
    render.blurredAmbientMap.destroy();
    render.blurredOutlineMap.destroy();
  }
};
