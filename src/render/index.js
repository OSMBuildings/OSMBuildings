
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

  /* returns the quadrilateral part of the XY plane that is currently visible on
   * screen. The quad is returned in tile coordinates for tile zoom level
   * 'tileZoomLevel', and thus can directly be used to determine which basemap
   * and geometry tiles need to be loaded.
   * Note: if the horizon is level (as should usually be the case for 
   * OSMBuildings) then said quad is also a trapezoid. */
  getViewQuad: function(viewProjectionMatrix, tileZoomLevel) {
    /* maximum distance from the camera *plane* (not camera position!) at which
     * geometry is still visible */
    var MAX_FAR_EDGE_DISTANCE = (this.fogDistance + this.fogBlurDistance);
    var inverse = glx.Matrix.invert(viewProjectionMatrix);

    var vBottomLeft  = getIntersectionWithXYPlane(-1, -1, inverse);
    var vBottomRight = getIntersectionWithXYPlane( 1, -1, inverse);
    var vTopRight    = getIntersectionWithXYPlane( 1,  1, inverse);
    var vTopLeft     = getIntersectionWithXYPlane(-1,  1, inverse);

    /* If even the lower edge of the screen does not intersect with the map plane,
     * then the map plane is not visible at all.
     * (Or somebody screwed up the projection matrix, putting the view upside-down 
     *  or something. But in any case we won't attempt to create a view rectangle).
     */
    if (!vBottomLeft || !vBottomRight) {
      return;
    }

    var camPos = getCameraPosition( inverse );
    var camLookDir = norm3(sub3( transformVec3(inverse, [0, 0, 1]),
                                 transformVec3(inverse, [0, 0, 0.5])));

    var vLeftDir, vRightDir, vLeftPoint, vRightPoint;

    /* The lower screen edge shows the map layer, but the upper one does not.
     * This usually happens when the camera is close to parallel to the ground
     * so that the upper screen edge lies above the horizon. This is not a bug
     * and can legitimately happen. But from a theoretical standpoint, this means 
     * that the view 'trapezoid' stretches infinitely toward the horizon. Since this
     * is not a practically useful result - though formally correct - we instead
     * manually bound that area.*/
    if (!vTopLeft || !vTopRight) {
      /* This point is chosen somewhat arbitrarily. It just *has* to lie on the
       * left edge of the screen. And it *should* be located relatively low
       * on that edge to ensure it lies below the horizon, but should not be too
       * close to 'vBottomLeft' to not cause numerical accuracy issues when computing
       * the vector between this point and 'vBottomLeft'. The value '-0.9' was 
       * chosen as it fits these criteria quite well, but no effort was made
       * to guarantee an *optimal* fit.  */
      vLeftPoint = getIntersectionWithXYPlane(-1, -0.9, inverse);
      vLeftDir = norm3(sub3( vLeftPoint, vBottomLeft));
      vTopLeft = getRayPointAtDistanceToPlane( camPos, camLookDir, 
                                               vBottomLeft, vLeftDir, 
                                               MAX_FAR_EDGE_DISTANCE);
      
      /* arbitrary point on the right screen edge, subject to the same
       * requirements as 'vLeftPoint' */
      vRightPoint = getIntersectionWithXYPlane( 1, -0.9, inverse);
      vRightDir = norm3(sub3(vRightPoint, vBottomRight));
      vTopRight = getRayPointAtDistanceToPlane( camPos, camLookDir, 
                                                vBottomRight, vRightDir, 
                                                MAX_FAR_EDGE_DISTANCE);
    }

   
    /* if vTopLeft is further than MAX_FAR_EDGE_DISTANCE away from the camera plane,
     * move it closer. */
    if ( dot3( sub3( vTopLeft, camPos), camLookDir) > MAX_FAR_EDGE_DISTANCE) {
    
      vLeftDir = norm3(sub3(vTopLeft, vBottomLeft));
      vTopLeft = getRayPointAtDistanceToPlane( camPos, camLookDir, 
                                                    vBottomLeft, vLeftDir, 
                                                    MAX_FAR_EDGE_DISTANCE);
    }
    
    /* do the same for the right edge */
    if ( dot3( sub3( vTopRight, camPos), camLookDir) > MAX_FAR_EDGE_DISTANCE) {
    
      vRightDir = norm3(sub3(vTopRight, vBottomRight));
      vTopRight = getRayPointAtDistanceToPlane( camPos, camLookDir, 
                                                vBottomRight, vRightDir, 
                                                 MAX_FAR_EDGE_DISTANCE);
    }
    
    return [vBottomLeft, vBottomRight, vTopRight, vTopLeft];
  },

  start: function() {
    this.viewMatrix = new glx.Matrix();
    this.projMatrix = new glx.Matrix();
    this.viewProjMatrix = new glx.Matrix();

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
    //render.HudRect.init();
    render.Overlay.init();
    //render.NormalMap.init();
    render.DepthMap.init();
    render.AmbientMap.init();
    render.Blur.init();
    
    //var quad = new mesh.DebugQuad();
    //quad.updateGeometry( [-100, -100, 1], [100, -100, 1], [100, 100, 1], [-100, 100, 1]);
    //data.Index.add(quad);

    this.loop = setInterval(function() {
      requestAnimationFrame(function() {

        gl.clearColor(this.fogColor[0], this.fogColor[1], this.fogColor[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (MAP.zoom < APP.minZoom || MAP.zoom > APP.maxZoom) {
          return;
        }
        
        //var viewTrapezoid = this.getViewQuad( this.viewProjMatrix.data);
        //quad.updateGeometry(viewTrapezoid[0], viewTrapezoid[1], viewTrapezoid[2], viewTrapezoid[3]);

        render.SkyDome.render();
        gl.clear(gl.DEPTH_BUFFER_BIT);	//ensure everything is drawn in front of the sky dome

        render.Buildings.render();
        render.Basemap.render();

        //render.NormalMap.render();

        if (render.optimize === 'quality') {
          var config = this.getFramebufferConfig(MAP.width, MAP.height, gl.getParameter(gl.MAX_TEXTURE_SIZE));

          render.DepthMap.render(config);
          render.AmbientMap.render(render.DepthMap.framebuffer.renderTexture.id, config, 0.5);
          render.Blur.render(render.AmbientMap.framebuffer.renderTexture.id, config);
        
          gl.blendFunc(gl.ZERO, gl.SRC_COLOR); //multiply DEST_COLOR by SRC_COLOR
          gl.enable(gl.BLEND);
          render.Overlay.render( render.Blur.framebuffer.renderTexture.id, config);
          gl.disable(gl.BLEND);
        }

      }.bind(this));
    }.bind(this), 17);
  },

  stop: function() {
    clearInterval(this.loop);
  },

  updateFogDistance: function() {
    var inverse = glx.Matrix.invert(this.viewProjMatrix.data);
    var cameraDistanceFromMapCenter = len3( getCameraPosition( inverse ));
    /* fogDistance: closest distance at which the fog affects the geometry */

    this.fogDistance = 1200 * Math.pow(2, MAP.zoom - 16 ) + cameraDistanceFromMapCenter;
    /* fogBlurDistance: closest distance *beyond* fogDistance at which everything is
     *                  completely enclosed in fog. */
    this.fogBlurDistance = 300 * Math.pow(2, MAP.zoom - 16 );
    //console.log( "FD: %s, zoom: %s, CDFC: %s", this.fogDistance, MAP.zoom, cameraDistanceFromMapCenter);
  },

  onChange: function() {
    this.viewMatrix = new glx.Matrix()
      .rotateZ(MAP.rotation)
      .rotateX(MAP.tilt);

    this.viewProjMatrix = new glx.Matrix(glx.Matrix.multiply(this.viewMatrix, this.projMatrix));
    this.updateFogDistance()
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
      .multiply(new glx.Matrix.Perspective(refVFOV * height / refHeight, width/height, 0.1, 7500))
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

    render.HudRect.destroy();
    render.Overlay.destroy();
    render.NormalMap.destroy();
    render.DepthMap.destroy();
    render.AmbientMap.destroy();
    render.Blur.destroy();
  }
};
