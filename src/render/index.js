
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

    /*var terrainTile = */
    new mesh.Terrain("https://terrain-preview.mapzen.com/terrarium/14/8799/5377.png");
    //new mesh.Terrain("https://terrain-preview.mapzen.com/terrarium/14/2617/6333.png");
    //new mesh.Terrain("https://terrain-preview.mapzen.com/terrarium/14/2616/6333.png");
    render.Picking.init(); // renders only on demand
    render.sky = new render.SkyWall();
    render.Buildings.init();
    render.Basemap.init();
    render.Overlay.init();
    render.AmbientMap.init();
    render.OutlineMap.init();
    render.blurredAmbientMap = new render.Blur();
    render.blurredOutlineMap = new render.Blur();
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

    if (!render.effects.shadows) {
      render.Buildings.render();
      render.Basemap.render();

      if (render.effects.outlines) {
        render.cameraGBuffer.render(this.viewMatrix, this.projMatrix, viewSize, true);
        render.Picking.render(viewSize);
        render.OutlineMap.render(
          render.cameraGBuffer.getDepthTexture(), 
          render.cameraGBuffer.getFogNormalTexture(), 
          render.Picking.framebuffer.renderTexture, viewSize, 1.0);
          render.blurredOutlineMap.render(render.OutlineMap.framebuffer.renderTexture, viewSize);
      }

      GL.enable(GL.BLEND);
      if (render.effects.outlines) {
        GL.blendFuncSeparate(GL.ZERO, GL.SRC_COLOR, GL.ZERO, GL.ONE);
        render.Overlay.render(render.blurredOutlineMap.framebuffer.renderTexture, viewSize);
      }

      GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);
      GL.disable(GL.DEPTH_TEST);
      render.sky.render();
      GL.disable(GL.BLEND);
      GL.enable(GL.DEPTH_TEST);
    } else {
      render.cameraGBuffer.render(this.viewMatrix, this.projMatrix, viewSize, true);
      render.sunGBuffer.render(Sun.viewMatrix, Sun.projMatrix);
      render.AmbientMap.render(render.cameraGBuffer.getDepthTexture(), render.cameraGBuffer.getFogNormalTexture(), viewSize, 2.0);
      render.blurredAmbientMap.render(render.AmbientMap.framebuffer.renderTexture, viewSize);
      render.Buildings.render(render.sunGBuffer.framebuffer, 0.5);
      render.Basemap.render();

      if (render.effects.outlines) {
        render.Picking.render(viewSize);
        render.OutlineMap.render(
          render.cameraGBuffer.getDepthTexture(), 
          render.cameraGBuffer.getFogNormalTexture(), 
          render.Picking.framebuffer.renderTexture, viewSize, 1.0
        );
        render.blurredOutlineMap.render(render.OutlineMap.framebuffer.renderTexture, viewSize);
      }

      GL.enable(GL.BLEND);
      {
        // multiply DEST_COLOR by SRC_COLOR, keep SRC alpha
        // this aplies the shadow and SSAO effects (which selectively darken the scene)
        // while keeping the alpha channel (that corresponds to how much the
        // geometry should be blurred into the background in the next step) intact
        GL.blendFuncSeparate(GL.ZERO, GL.SRC_COLOR, GL.ZERO, GL.ONE);
        if (render.effects.outlines) {
          render.Overlay.render(render.blurredOutlineMap.framebuffer.renderTexture, viewSize);
        }

        render.MapShadows.render(Sun, render.sunGBuffer.framebuffer, 0.5);
        render.Overlay.render( render.blurredAmbientMap.framebuffer.renderTexture, viewSize);

        // linear interpolation between the colors of the current framebuffer 
        // ( =building geometries) and of the sky. The interpolation factor
        // is the geometry alpha value, which contains the 'foggyness' of each pixel
        // the alpha interpolation functions is set to GL.ONE for both operands
        // to ensure that the alpha channel will become 1.0 for each pixel after this
        // operation, and thus the whole canvas is not rendered partially transparently
        // over its background.
        GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);
        GL.disable(GL.DEPTH_TEST);
        render.sky.render();
        GL.enable(GL.DEPTH_TEST);
      }
      GL.disable(GL.BLEND);

      //render.HudRect.render( render.sunGBuffer.getFogNormalTexture(), config );
    }

    if (this.screenshotCallback) {
      this.screenshotCallback(GL.canvas.toDataURL());
      this.screenshotCallback = null;
    }  
  },

  stop: function() {
    clearInterval(this.loop);
  },
  
  onChange: function() {
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
