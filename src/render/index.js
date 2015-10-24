
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
    //FIXME: determine a reasonable value (4000 was chosen rather arbitrarily)
    var MAX_EDGE_LENGTH = 4000; 

    var inverse = glx.Matrix.invert(viewProjectionMatrix);

    var vBottomLeft  = getIntersectionWithXYPlane(-1, -1, inverse);
    var vBottomRight = getIntersectionWithXYPlane( 1, -1, inverse);
    var vTopRight    = getIntersectionWithXYPlane( 1,  1, inverse);
    var vTopLeft     = getIntersectionWithXYPlane(-1,  1, inverse);

    /* If even the lower edge of the screen does not intersect with the map plane,
     * then the map plane is not visible at all.
     * (Or somebody screwed up the projection matrix, putting view upside-down 
     *  or something. But in any case we won't attempt to create a view rectangle).
     */
    if (!vBottomLeft || !vBottomRight) {
      return;
    }

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
      vTopLeft = add3( vBottomLeft, mul3scalar(vLeftDir, MAX_EDGE_LENGTH));
      
      /* arbitrary point on the right screen edge, subject to the same
       * requirements as 'vLeftPoint' */
      vRightPoint = getIntersectionWithXYPlane( 1, -0.9, inverse);
      vRightDir = norm3(sub3(vRightPoint, vBottomRight));
      vTopRight = add3(vBottomRight, mul3scalar(vRightDir, MAX_EDGE_LENGTH));
    }
    
    /* if vTopLeft is further than MAX_EDGE_LENGTH away from vBottomLeft,
     * move it closer. */
    if (dist3(vBottomLeft, vTopLeft) > MAX_EDGE_LENGTH) {
      vLeftDir = norm3(sub3(vTopLeft, vBottomLeft));
      vTopLeft = add3(vBottomLeft, mul3scalar(vLeftDir, MAX_EDGE_LENGTH));
    }
    
    /* do the same for the right edge */
    if (dist3(vBottomRight, vTopRight) > MAX_EDGE_LENGTH) {
      vRightDir = norm3(sub3(vTopRight, vBottomRight));
      vTopRight = add3(vBottomRight, mul3scalar(vRightDir, MAX_EDGE_LENGTH));
    }
    
    //return [ vBottomLeft, vBottomRight, vTopRight, vTopLeft];
    
    return [asTilePosition(vBottomLeft,  tileZoomLevel),
            asTilePosition(vBottomRight, tileZoomLevel),
            asTilePosition(vTopRight,    tileZoomLevel),
            asTilePosition(vTopLeft,     tileZoomLevel)];
  },

  start: function() {
    this.viewMatrix = new glx.Matrix();
    this.projMatrix = new glx.Matrix();
    this.viewProjMatrix = new glx.Matrix();

    MAP.on('change', this._onChange = this.onChange.bind(this));
    this.onChange();

    MAP.on('resize', this._onResize = this.onResize.bind(this));
    this.onResize();

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    render.Interaction.init(); // renders only on demand
    render.SkyDome.init();
    render.Buildings.init();
    render.Basemap.init();
    render.HudRect.init();
    render.Overlay.init();
    render.NormalMap.init();
    render.DepthMap.init();
    render.AmbientMap.init();
    render.Blur.init();
    
    //var quad = new mesh.DebugQuad();
    //quad.updateGeometry( [-100, -100, 1], [100, -100, 1], [100, 100, 1], [-100, 100, 1]);
    //data.Index.add(quad);

    this.loop = setInterval(function() {
      requestAnimationFrame(function() {
        gl.clearColor(this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (MAP.zoom < APP.minZoom || MAP.zoom > APP.maxZoom) {
          return;
        }
        
        //var viewTrapezoid = this.getViewQuad( this.viewProjMatrix.data, 16);
        //console.log( this.getTilesInQuad( viewTrapezoid) );
        //var s = "";
        //for (var i in window.tiles)
        //  s+= window.tiles[i][0] + ", " + window.tiles[i][1] + "\n";
        //window.s = s;
        //console.log(window.tiles.length);
        //console.log( viewTrapezoid[0], viewTrapezoid[1], viewTrapezoid[2], viewTrapezoid[3] );
        //quad.updateGeometry(viewTrapezoid[0], viewTrapezoid[1], viewTrapezoid[2], viewTrapezoid[3]);

        render.SkyDome.render();
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

  onChange: function() {
    this.viewMatrix = new glx.Matrix()
      .rotateZ(MAP.rotation)
      .rotateX(MAP.tilt);

    this.viewProjMatrix = new glx.Matrix(glx.Matrix.multiply(this.viewMatrix, this.projMatrix));
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
      .multiply(new glx.Matrix.Perspective(refVFOV * height / refHeight, width/height, 0.1, 5000))
      .translate(0, -1, 0); // camera y offset

    glx.context.canvas.width  = width;
    glx.context.canvas.height = height;
    glx.context.viewport(0, 0, width, height);

    this.viewProjMatrix = new glx.Matrix(glx.Matrix.multiply(this.viewMatrix, this.projMatrix));

    this.fogRadius = Math.sqrt(width*width + height*height) * 1.1; // 2 would fit fine but camera is too close
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
