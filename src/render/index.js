
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
  getViewQuad: function(viewProjectionMatrix) {
    /* maximum distance from the map center at which
     * geometry is still visible */
    var MAX_FAR_EDGE_DISTANCE = (this.fogDistance + this.fogBlurDistance);
    //console.log("FMED:", MAX_FAR_EDGE_DISTANCE);

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

    var vLeftDir, vRightDir, vLeftPoint, vRightPoint;
    var f;

    /* The lower screen edge shows the map layer, but the upper one does not.
     * This usually happens when the camera is close to parallel to the ground
     * so that the upper screen edge lies above the horizon. This is not a bug
     * and can legitimately happen. But from a theoretical standpoint, this means 
     * that the view 'trapezoid' stretches infinitely toward the horizon. Since this
     * is not a practically useful result - though formally correct - we instead
     * manually bound that area.*/
    if (!vTopLeft || !vTopRight) {
      /* point on the left screen edge with the same y-value as the map center*/
      vLeftPoint = getIntersectionWithXYPlane(-1, -0.9, inverse);
      vLeftDir = norm2(sub2( vLeftPoint, vBottomLeft));
      f = dot2(vLeftDir, this.viewDirOnMap);
      vTopLeft = add2( vBottomLeft, mul2scalar(vLeftDir, MAX_FAR_EDGE_DISTANCE/f));
      
      vRightPoint = getIntersectionWithXYPlane( 1, -0.9, inverse);
      vRightDir = norm2(sub2(vRightPoint, vBottomRight));
      f = dot2(vRightDir, this.viewDirOnMap);
      vTopRight = add2( vBottomRight, mul2scalar(vRightDir, MAX_FAR_EDGE_DISTANCE/f));
    }

    /* if vTopLeft is further than MAX_FAR_EDGE_DISTANCE away vertically from the map center,
     * move it closer. */
   if (dot2( this.viewDirOnMap, vTopLeft) > MAX_FAR_EDGE_DISTANCE) {
      vLeftDir = norm2(sub2( vTopLeft, vBottomLeft));
      f = dot2(vLeftDir, this.viewDirOnMap);
      vTopLeft = add2( vBottomLeft, mul2scalar(vLeftDir, MAX_FAR_EDGE_DISTANCE/f));
   }

   /* dito for vTopRight*/
   if (dot2( this.viewDirOnMap, vTopRight) > MAX_FAR_EDGE_DISTANCE) {
      vRightDir = norm2(sub2( vTopRight, vBottomRight));
      f = dot2(vRightDir, this.viewDirOnMap);
      vTopRight = add2( vBottomRight, mul2scalar(vRightDir, MAX_FAR_EDGE_DISTANCE/f));
   }
   
    return [vBottomLeft, vBottomRight, vTopRight, vTopLeft];
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
        /*
        var viewTrapezoid = this.getViewQuad( this.viewProjMatrix.data);
        quad.updateGeometry([viewTrapezoid[0][0], viewTrapezoid[0][1], 1.0],
                            [viewTrapezoid[1][0], viewTrapezoid[1][1], 1.0],
                            [viewTrapezoid[2][0], viewTrapezoid[2][1], 1.0],
                            [viewTrapezoid[3][0], viewTrapezoid[3][1], 1.0]);*/

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
    
    //need to store this as a reference point to determine fog distance
    this.lowerLeftOnMap = getIntersectionWithXYPlane(-1, -1, inverse);
    if (this.lowerLeftOnMap === undefined)
        return;
        
    var lowerLeftDistanceToCenter = len2(this.lowerLeftOnMap);

    /* fogDistance: closest distance at which the fog affects the geometry */
    this.fogDistance = Math.max(1500, lowerLeftDistanceToCenter);
    /* fogBlurDistance: closest distance *beyond* fogDistance at which everything is
     *                  completely enclosed in fog. */
    this.fogBlurDistance = 300;
    //console.log( "FD: %s, zoom: %s, CDFC: %s", this.fogDistance, MAP.zoom, cameraDistanceFromMapCenter);
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

    render.NormalMap.destroy();
    render.DepthMap.destroy();
    render.AmbientMap.destroy();
    render.Blur.destroy();
  }
};
