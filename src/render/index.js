
var render = {
  
  /* transforms the 3D vector 'v' according to the transformation matrix 'm'.
   * Internally, the vector 'v' is interpreted as a 4D vector 
   * (v[0], v[1], v[2], 1.0) in homogenous coordinates. The transformation is
   * performed on that vector, yielding a 4D homogenous result vector. That
   * vector is then converted back to a 3D Euler coordinates by dividing 
   * its first three components each by its fourth component */
  transformVec3: function( m, v) {
    var x = v[0]*m[0] + v[1]*m[4] + v[2]*m[8]  + 1.0*m[12];
    var y = v[0]*m[1] + v[1]*m[5] + v[2]*m[9]  + 1.0*m[13];
    var z = v[0]*m[2] + v[1]*m[6] + v[2]*m[10] + 1.0*m[14];
    var w = v[0]*m[3] + v[1]*m[7] + v[2]*m[11] + 1.0*m[15];
    return [x/w, y/w, z/w]; //convert homogenous to Euler coordinates
  },
  
  /* returns the point (in OSMBuildings' local coordinates) on the XY plane (z==0)
   * that would be draw at viewport  position (screenNdcX, screenNdcY).
   * That viewport position is given in normalized device coordinates, i.e.
   * x==-1.0 is the left screen edge, x==+1.0 is the right one, y==-1.0 is the lower
   * screen edge and y==+1.0 is the upper one.
   */
  getIntersectionWithXYPlane: function( screenNdcX, screenNdcY, inverseTransform) {
    var v1 = this.transformVec3(inverseTransform, [screenNdcX, screenNdcY, 0]);
    var v2 = this.transformVec3(inverseTransform, [screenNdcX, screenNdcY, 1]);
    
    // direction vector from v1 to v2
    var vDir = [ v2[0] - v1[0],
                 v2[1] - v1[1],
                 v2[2] - v1[2]]
    
    if (vDir[2] >= 0) // ray would not intersect with the plane
    {
      return undefined;
    }
    /* ray equation for all world-space points 'p' lying on the screen-space NDC position 
     * (screenNdcX, screenNdcY) is:  p = v1 + λ*vDirNorm 
     * For the intersection with the xy-plane (-> z=0) holds: v1[2] + λ*vDirNorm[2] = p[2] = 0.0.
     * Rearranged, this reads:   */
    var lambda = -v1[2]/vDir[2];
    
    return [ v1[0] + lambda * vDir[0],
             v1[1] + lambda * vDir[1],
             v1[2] + lambda * vDir[2] +1.0]; //FIXME: remove debug z-offset "+1.0"
  },
  
  /* converts a 2D position from OSMBuildings' local coordinate system to OSM slippy tile
   * coordinates for zoom level 'tileZoom'. The results are not integers, but have a 
   * fractional component. Math.floor(tileX) gives the actual horizontal tile number, 
   * while (tileX - Math.floor(tileX)) gives the relative position *inside* the tile. */
  asTilePosition: function( localXY, tileZoom) {
    var worldX = localXY[0] + MAP.center.x;
    var worldY = localXY[1] + MAP.center.y;
    var worldSize = TILE_SIZE*Math.pow(2, MAP.zoom);
    
    var tileX = worldX / worldSize * Math.pow(2,tileZoom);
    var tileY = worldY / worldSize * Math.pow(2,tileZoom);
    
    return [ tileX, tileY];
  },

  /* returns the quadrilateral part of the XY plane that is currently visible on
   * screen. The quad is returned in OSM tile coordinates for tile zoom level 
   * 'tileZoomLevel', and thus can directly be used to determine which basemap 
   * and geometry tiles need to be loaded.
   * Note: if the horizon is level (as should usually be the case for 
   * OSMBuildings) then said quad is also a trapezoid. */
  getViewQuad: function(viewProjectionMatrix, tileZoomLevel) {
    //FIXME: determine a reasonable value (4000 was chosen rather arbitrarily)
    var MAX_EDGE_LENGTH = 4000; 
  
    function sub3(a,b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];}
    function add3(a,b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];}
    function mul3scalar(a,f) { return [a[0]*f, a[1]*f, a[2]*f];}
    function len3(a)   { return Math.sqrt( a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);}
    function norm3(a)  { var l = len3(a); return [a[0]/l, a[1]/l, a[2]/l]};
    function dist3(a,b){ return len3(sub3(a,b));}
    
    var inverse = glx.Matrix.invert(viewProjectionMatrix);

    var vBottomLeft  = this.getIntersectionWithXYPlane(-1, -1, inverse);
    var vBottomRight = this.getIntersectionWithXYPlane( 1, -1, inverse);
    var vTopRight    = this.getIntersectionWithXYPlane( 1,  1, inverse);
    var vTopLeft     = this.getIntersectionWithXYPlane(-1,  1, inverse);
    
    
    /* If even the lower edge of the screen does not intersect with the map plane,
     * then the map plane is not visible at all.
     * (Or somebody screwed up the projection matrix, putting view upside-down 
     *  or something. But in any case we won't attempt to create a view rectangle).
     */
    if (!vBottomLeft || !vBottomRight)
      return undefined;
    
    
    /* The lower screen edge shows the map layer, but the upper one does not.
     * This usually happens when the camera is close to parallel to the ground
     * so that the upper screen edge lies above the horizon. This is not a bug
     * and can legitimately happen. But from a theoretical standpoint, this means 
     * that the view 'trapezoid' stretches infinitely toward the horizon. Since this
     * is not a practically useful result - though formally correct - we instead
     * manually bound that area.*/
    if (!vTopLeft || !vTopRight)
    {
      /* This point is chosen somewhat arbitrarily. It just *has* to lie on the
       * left edge of the screen. And it *should* be located relatively low
       * on that edge to ensure it lies below the horizon, but should not be too
       * close to 'vBottomLeft' to not cause numerical accuracy issues when computing
       * the vector between this point and 'vBottomLeft'. The value '-0.9' was 
       * chosen as it fits these criteria quite well, but no effort was made
       * to guarantee an *optimal* fit.  */
      var vLeftPoint = this.getIntersectionWithXYPlane(-1, -0.9, inverse);
      var vLeftDir = norm3(sub3( vLeftPoint, vBottomLeft));
      vTopLeft = add3( vBottomLeft, mul3scalar(vLeftDir, MAX_EDGE_LENGTH));
      
      /* arbitrary point on the right screen edge, subject to the same
       * requirements as 'vLeftPoint' */
      var vRightPoint = this.getIntersectionWithXYPlane( 1, -0.9, inverse);
      var vRightDir = norm3(sub3( vRightPoint, vBottomRight));
      vTopRight = add3( vBottomRight, mul3scalar(vRightDir, MAX_EDGE_LENGTH));
    }
    
    /* if vTopLeft is further than MAX_EDGE_LENGTH away from vBottomLeft,
     * move it closer. */
    if (dist3(vBottomLeft, vTopLeft) > MAX_EDGE_LENGTH)
    {
      vLeftDir = norm3( sub3(vTopLeft, vBottomLeft));
      vTopLeft = add3( vBottomLeft, mul3scalar(vLeftDir, MAX_EDGE_LENGTH));
    }
    
    /* do the same for the right edge */
    if (dist3(vBottomRight, vTopRight) > MAX_EDGE_LENGTH)
    {
      vRightDir = norm3( sub3(vTopRight, vBottomRight));
      vTopRight = add3( vBottomRight, mul3scalar(vRightDir, MAX_EDGE_LENGTH));
    }
    
    //return [ vBottomLeft, vBottomRight, vTopRight, vTopLeft];
    
    return [this.asTilePosition( vBottomLeft,  tileZoomLevel),
            this.asTilePosition( vBottomRight, tileZoomLevel),
            this.asTilePosition( vTopRight,    tileZoomLevel),
            this.asTilePosition( vTopLeft,     tileZoomLevel)];
  },
  
  /* Returns whether the point 'P' lies either inside the triangle (tA, tB, tC) 
   * or on its edge.
   *
   * Implementation: we follow a barycentric development: The triangle
   *                 is interpreted as the point tA and two vectors v1 = tB - tA
   *                 and v2 = tC - tA. Then for any point P inside the triangle
   *                 holds P = tA + α*v1 + β*v2 subject to α >= 0, β>= 0 and
   *                 α + β <= 1.0
  */
  isPointInTriangle: function( tA, tB, tC, P) {
    var v1x = tB[0] - tA[0];
    var v1y = tB[1] - tA[1];
    
    var v2x = tC[0] - tA[0];
    var v2y = tC[1] - tA[1];
    
    var qx  = P[0] - tA[0];
    var qy  = P[1] - tA[1];
    
    /* 'denom' is zero iff v1 and v2 have the same direction. In that case,
     * the triangle has degenerated to a line, and no point can lie inside it */
    var denom = v2x * v1y - v2y * v1x;
    if (denom === 0) 
      return false;
    
    var numeratorBeta =  qx*v1y - qy*v1x;
    var beta = numeratorBeta/denom;

    var numeratorAlpha = qx*v2y - qy*v2x;
    var alpha = - numeratorAlpha / denom;

    return alpha >= 0.0 && beta >= 0.0 && (alpha + beta) <= 1.0;    
  },
  
  
  /* Returns the set of tiles (as dictionary keys) that overlap in any way with
   * the quadrilateral 'quad'. The returned set may contain false-positives, 
   * i.e. tiles that are slightly outside the viewing frustum.
   *
   * The basic approach is to determine the axis-aligned bounding box of the 
   * quad, and for each tile in the bounding box determine whether its center
   * lies inside the quad (or rather in one of the two triangles making up the
   * quad) via a point-in-triangle test.
   * This approach however misses some boundary cases:
   * - for tiles on the edge of the screen, parts of the tile may be visible 
   *   without its center being visible. Our test misses these cases. We 
   *   compensate by adding not only the tile itself but also all horizontal, 
   *   vertical and diagonal neighbors to the result set
   * - if the quad is small compared to the tile size then no tile center may
   *   be inside the quad (e.g. when the whole screen is covered by the lower
   *   third of a single tile) and thus the result set would be empty. We 
   *   compensate by adding the tiles of all four quad vertices to the result
   *   set in any case.
   * Note: while the set of tiles added through those edge cases may seem
   *       excessive, it is actually rather small: It does add an one tile wide 
   *       outline to the result set. But other than that, is only caused tiles
   *       to be added multiple times, and those duplicates are removed
   *       automatically since the result is a set.
   *       
   *
   */
  getTilesInQuad: function( quad ) {
    //return {};
    var minX = Math.floor(Math.min( quad[0][0], quad[1][0], quad[2][0], quad[3][0]));
    var maxX = Math.ceil( Math.max( quad[0][0], quad[1][0], quad[2][0], quad[3][0]));

    var minY = Math.floor(Math.min( quad[0][1], quad[1][1], quad[2][1], quad[3][1]));
    var maxY = Math.ceil( Math.max( quad[0][1], quad[1][1], quad[2][1], quad[3][1]));
    
    
    var tiles = {};
    tiles [ [Math.floor(quad[0][0]), Math.floor(quad[0][1])] ] = true;
    tiles [ [Math.floor(quad[1][0]), Math.floor(quad[1][1])] ] = true;
    tiles [ [Math.floor(quad[2][0]), Math.floor(quad[2][1])] ] = true;
    tiles [ [Math.floor(quad[3][0]), Math.floor(quad[3][1])] ] = true;
    //console.log(tiles);
    //return tiles;
    for (var x = minX; x <= maxX; x++)
      for (var y = minY; y <= maxY; y++)
      {
        if (this.isPointInTriangle( quad[0], quad[1], quad[2], [x+0.5, y+0.5]) ||
            this.isPointInTriangle( quad[0], quad[2], quad[3], [x+0.5, y+0.5]))
            { 
              tiles[[x-1,y-1]] = true;
              tiles[[x  ,y-1]] = true;
              tiles[[x+1,y-1]] = true;
              tiles[[x-1,y  ]] = true;
              tiles[[x  ,y  ]] = true;
              tiles[[x+1,y  ]] = true;
              tiles[[x-1,y+1]] = true;
              tiles[[x  ,y+1]] = true;
              tiles[[x+1,y+1]] = true;
            }
      }
    return tiles;
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
    
    /*var quad = new mesh.DebugQuad()
    quad.updateGeometry( [-100, -100, 1], [100, -100, 1], [100, 100, 1], [-100, 100, 1]);
    data.Index.add(quad);*/

    this.loop = setInterval(function() {
      requestAnimationFrame(function() {
        gl.clearColor(this.fogColor.r, this.fogColor.g, this.fogColor.b, 1);
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
        //quad.updateGeometry(viewTrapezoid[0], viewTrapezoid[1],
        //                    viewTrapezoid[2], viewTrapezoid[3]);

        render.SkyDome.render();
        render.Buildings.render();
        render.Basemap.render();

        //render.NormalMap.render();
        if (render.isAmbientOcclusionEnabled) {
          var config = getFramebufferConfig(MAP.width >> 1,
                                            MAP.height >> 1,
                                            gl.getParameter(gl.MAX_TEXTURE_SIZE));

          render.DepthMap.render(config);
          render.AmbientMap.render(render.DepthMap.framebuffer.renderTexture.id, config);
          render.Blur.render(render.AmbientMap.framebuffer.renderTexture.id, config);
          
          // first=source is ambient map, second=dest is color framebuffer
          gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
          gl.enable(gl.BLEND);
          render.Overlay.render( render.Blur.framebuffer.renderTexture.id, config);
          gl.disable(gl.BLEND);
          //render.HudRect.render(render.Blur.framebuffer.renderTexture.id);
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
  }
};
