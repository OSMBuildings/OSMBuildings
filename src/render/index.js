
class render {

  static getViewQuad () {
    return getViewQuad(this.viewProjMatrix.data,  (this.fogDistance + this.fogBlurDistance), this.viewDirOnMap);
  }

  static start () {
    render.effects = { shadows: true };

    // disable effects if they rely on WebGL extensions
    // that the current hardware does not support
    if (!GL.depthTextureExtension) {
      console.warn('Shadows are disabled because your GPU does not support WEBGL_depth_texture');
      render.effects.shadows = false;
    }

    this.setupViewport();

    GL.cullFace(GL.BACK);
    GL.enable(GL.CULL_FACE);
    GL.enable(GL.DEPTH_TEST);

    render.Picking = new DrawPicking(); // renders only on demand
    render.Buildings.init();
    render.Basemap.init();
    render.Overlay.init();
    render.AmbientMap.init();
    render.blurredAmbientMap = new DrawBlur();
    // render.HudRect.init();
    // render.NormalMap.init();
    render.MapShadows.init();
    if (render.effects.shadows) {
      render.cameraGBuffer = new render.DepthFogNormalMap();
      render.sunGBuffer = new render.DepthFogNormalMap();
      render.sunGBuffer.framebufferSize = [SHADOW_DEPTH_MAP_SIZE, SHADOW_DEPTH_MAP_SIZE];
    }

    // const quad = new mesh.DebugQuad();
    // quad.updateGeometry( [-100, -100, 1], [100, -100, 1], [100, 100, 1], [-100, 100, 1]);
    // data.Index.add(quad);

    this.renderFrame();
  }

  static renderFrame () {
    if (APP.zoom >= APP.minZoom && APP.zoom <= APP.maxZoom) {
      requestAnimationFrame(() => {

        this.setupViewport();
        GL.clearColor(this.fogColor[0], this.fogColor[1], this.fogColor[2], 0.0);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        const viewSize = [APP.width, APP.height];

        if (!render.effects.shadows) {
          render.Buildings.render();
          render.Basemap.render();

          GL.enable(GL.BLEND);

          GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);
          GL.disable(GL.DEPTH_TEST);
          GL.disable(GL.BLEND);
          GL.enable(GL.DEPTH_TEST);
        } else {
          const viewTrapezoid = this.getViewQuad();
          /*
          quad.updateGeometry([viewTrapezoid[0][0], viewTrapezoid[0][1], 1.0],
                              [viewTrapezoid[1][0], viewTrapezoid[1][1], 1.0],
                              [viewTrapezoid[2][0], viewTrapezoid[2][1], 1.0],
                              [viewTrapezoid[3][0], viewTrapezoid[3][1], 1.0]);*/

          Sun.updateView(viewTrapezoid);

          render.cameraGBuffer.render(this.viewMatrix, this.projMatrix, viewSize, true);
          render.sunGBuffer.render(Sun.viewMatrix, Sun.projMatrix);
          render.AmbientMap.render(render.cameraGBuffer.getDepthTexture(), render.cameraGBuffer.getFogNormalTexture(), viewSize, 2.0);
          render.blurredAmbientMap.render(render.AmbientMap.framebuffer.renderTexture, viewSize);
          render.Buildings.render(render.sunGBuffer.framebuffer);
          render.Basemap.render();

          GL.enable(GL.BLEND);

          {
            // multiply DEST_COLOR by SRC_COLOR, keep SRC alpha
            // this applies the shadow and SSAO effects (which selectively darken the scene)
            // while keeping the alpha channel (that corresponds to how much the
            // geometry should be blurred into the background in the next step) intact
            GL.blendFuncSeparate(GL.ZERO, GL.SRC_COLOR, GL.ZERO, GL.ONE);

            // render.MapShadows.render(Sun, render.sunGBuffer.framebuffer, 0.5);
            render.Overlay.render(render.blurredAmbientMap.framebuffer.renderTexture, viewSize);

            // linear interpolation between the colors of the current framebuffer
            // ( =building geometries) and of the sky. The interpolation factor
            // is the geometry alpha value, which contains the 'foggyness' of each pixel
            // the alpha interpolation functions is set to GL.ONE for both operands
            // to ensure that the alpha channel will become 1.0 for each pixel after this
            // operation, and thus the whole canvas is not rendered partially transparently
            // over its background.
            GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);
            GL.disable(GL.DEPTH_TEST);
            GL.enable(GL.DEPTH_TEST);
          }

          GL.disable(GL.BLEND);

          // render.HudRect.render( render.sunGBuffer.getFogNormalTexture(), config );
        }

        APP.markers.updateMarkerView();

        if (APP.activity.isBusy()) {
          this.renderFrame();
          // setTimeout(() => {
          //   this.renderFrame();
          // }, 5);
        } else {
          setTimeout(() => {
            this.renderFrame();
          }, 250);
        }

      }); // end requestAnimationFrame()
    }
  }

  // initialize view and projection matrix, fog distance, etc.
  static setupViewport () {
    if (GL.canvas.width !== APP.width) {
      GL.canvas.width = APP.width;
    }
    if (GL.canvas.height !== APP.height) {
      GL.canvas.height = APP.height;
    }

    const
      scale = 1.3567 * Math.pow(2, APP.zoom - 17),
      width = APP.width,
      height = APP.height,
      refHeight = 1024,
      refVFOV = 45;

    GL.viewport(0, 0, width, height);

    this.viewMatrix = new GLX.Matrix()
      .rotateZ(APP.rotation)
      .rotateX(APP.tilt)
      .translate(0, 8 / scale, 0) // corrective offset to match Leaflet's coordinate system (value was determined empirically)
      .translate(0, 0, -1220 / scale); //move away to simulate zoom; -1220 scales APP tiles to ~256px

    this.viewDirOnMap = [Math.sin(APP.rotation / 180 * Math.PI),
      -Math.cos(APP.rotation / 180 * Math.PI)];

    // First, we need to determine the field-of-view so that our map scale does
    // not change when the viewport size changes. The map scale is given by the
    // 'refFOV' (e.g. 45°) at a WebGL viewport height of 'refHeight' pixels.
    // Since our viewport will not usually be 1024 pixels high, we'll need to
    // find the FOV that corresponds to our viewport height.
    // The half viewport height and half FOV form a leg and the opposite angle
    // of a right triangle (see sketch below). Since the relation between the
    // two is non-linear, we cannot simply scale the reference FOV by the ratio
    // of reference height to actual height to get the desired FOV.
    // But be can use the reference height and reference FOV to determine the
    // virtual distance to the camera and then use that virtual distance to
    // compute the FOV corresponding to the actual height.
    //
    //                   ____/|
    //              ____/     |
    //         ____/          | refHeight/2
    //    ____/  \            |
    //   /refFOV/2|           |
    //  ----------------------|
    //     "virtual distance"
    const virtualDistance = refHeight / (2 * Math.tan((refVFOV / 2) / 180 * Math.PI));
    const verticalFOV = 2 * Math.atan((height / 2.0) / virtualDistance) / Math.PI * 180;

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
      .translate(0, -height / (2.0 * scale), 0) // 0, APP y offset to neutralize camera y offset,
      .scale(1, -1, 1) // flip Y
      .multiply(new GLX.Matrix.Perspective(verticalFOV, width / height, 1, 7500))
      .translate(0, -1, 0); // camera y offset

    this.viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(this.viewMatrix, this.projMatrix));

    //need to store this as a reference point to determine fog distance
    this.lowerLeftOnMap = getIntersectionWithXYPlane(-1, -1, GLX.Matrix.invert(this.viewProjMatrix.data));
    if (this.lowerLeftOnMap === undefined) {
      return;
    }

    const lowerLeftDistanceToCenter = len2(this.lowerLeftOnMap);

    /* fogDistance: closest distance at which the fog affects the geometry */
    this.fogDistance = Math.max(3000, lowerLeftDistanceToCenter);
    /* fogBlurDistance: closest distance *beyond* fogDistance at which everything is
     *                  completely enclosed in fog. */
    this.fogBlurDistance = 500;
  }

  static destroy () {
    render.Picking.destroy();
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
  }
}
