
class View {

  getViewQuad () {
    return getViewQuad(this.viewProjMatrix.data,  (this.fogDistance + this.fogBlurDistance), this.viewDirOnMap);
  }

  start () {
    this.shadowsEnabled = true;

    // disable effects if they rely on WebGL extensions
    // that the current hardware does not support
    if (!GL.depthTextureExtension) {
      console.warn('Shadows are disabled because your GPU does not support WEBGL_depth_texture');
      this.shadowsEnabled = false;
    }

    this.setupViewport();

    GL.cullFace(GL.BACK);
    GL.enable(GL.CULL_FACE);
    GL.enable(GL.DEPTH_TEST);

    this.Picking = new View.Picking(); // renders only on demand
    this.Horizon = new View.Horizon();
    this.Buildings = new View.Buildings();
    // if (this.shadowsEnabled) {
    //   this.Markers = new View.Markers();
    // } else {
      this.Markers = new View.MarkersSimple();
    // }
    this.Basemap = new View.Basemap();

    this.Overlay = new View.Overlay();
    this.ambientMap = new View.AmbientMap();
    this.blurredAmbientMap = new View.Blur();
    this.MapShadows = new View.MapShadows();
    if (this.shadowsEnabled) {
      this.cameraGBuffer = new View.DepthNormal();
      this.sunGBuffer = new View.DepthNormal();
    }

    this.speedUp();

    this.renderFrame();
  }

  renderFrame () {
    if (APP.zoom >= APP.minZoom && APP.zoom <= APP.maxZoom) {
      requestAnimationFrame(() => {

        this.setupViewport();
        GL.clearColor(this.fogColor[0], this.fogColor[1], this.fogColor[2], 0.0);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        const viewSize = [APP.width, APP.height];

        if (!this.shadowsEnabled) {
          this.Buildings.render();
          this.Markers.render();

          GL.enable(GL.BLEND);

          GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);
          GL.disable(GL.DEPTH_TEST);
          this.Horizon.render();
          GL.disable(GL.BLEND);
          GL.enable(GL.DEPTH_TEST);

          this.Basemap.render();
        } else {
          const viewTrapezoid = this.getViewQuad();

          View.Sun.updateView(viewTrapezoid);
          this.Horizon.updateGeometry(viewTrapezoid);

          this.cameraGBuffer.render(this.viewMatrix, this.projMatrix, viewSize, true);
          this.sunGBuffer.render(View.Sun.viewMatrix, View.Sun.projMatrix, [SHADOW_DEPTH_MAP_SIZE, SHADOW_DEPTH_MAP_SIZE]);
          this.ambientMap.render(this.cameraGBuffer.framebuffer.depthTexture, this.cameraGBuffer.framebuffer.renderTexture, viewSize, 2.0);
          this.blurredAmbientMap.render(this.ambientMap.framebuffer.renderTexture, viewSize);
          this.Buildings.render(this.sunGBuffer.framebuffer);
          this.Markers.render(this.sunGBuffer.framebuffer);
          this.Basemap.render();

          GL.enable(GL.BLEND);

          // multiply DEST_COLOR by SRC_COLOR, keep SRC alpha
          // this applies the shadow and SSAO effects (which selectively darken the scene)
          // while keeping the alpha channel (that corresponds to how much the
          // geometry should be blurred into the background in the next step) intact
          GL.blendFuncSeparate(GL.ZERO, GL.SRC_COLOR, GL.ZERO, GL.ONE);

          this.MapShadows.render(this.sunGBuffer.framebuffer, 0.5);
          this.Overlay.render(this.blurredAmbientMap.framebuffer.renderTexture, viewSize);

          // linear interpolation between the colors of the current framebuffer
          // ( =building geometries) and of the sky. The interpolation factor
          // is the geometry alpha value, which contains the 'foggyness' of each pixel
          // the alpha interpolation functions is set to GL.ONE for both operands
          // to ensure that the alpha channel will become 1.0 for each pixel after this
          // operation, and thus the whole canvas is not rendered partially transparently
          // over its background.
          GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);


          GL.disable(GL.DEPTH_TEST);
          this.Horizon.render();
          GL.enable(GL.DEPTH_TEST);

          GL.disable(GL.BLEND);

          // this.hudRect.render( this.sunGBuffer.getFogNormalTexture(), config );
        }

        // APP.markers.updateMarkerView();

        if (this.isFast) {
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
  setupViewport () {
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
      .translateBy(0, 8 / scale, 0) // corrective offset to match Leaflet's coordinate system (value was determined empirically)
      .translateBy(0, 0, -1220 / scale); //move away to simulate zoom; -1220 scales APP tiles to ~256px

    this.viewDirOnMap = [Math.sin(APP.rotation / 180 * Math.PI), -Math.cos(APP.rotation / 180 * Math.PI)];

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

    this.nearPlane = 1;
    this.farPlane = 30000;

    this.projMatrix = new GLX.Matrix()
      .translateTo(0, -height / (2 * scale), 0) // 0, APP y offset to neutralize camera y offset,
      .scale(1, -1, 1) // flip Y
      .multiply(new GLX.Matrix.Perspective(verticalFOV, width / height, this.nearPlane, this.farPlane))
      .translateBy(0, -1, 0); // camera y offset

    this.viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(this.viewMatrix, this.projMatrix));

    // need to store this as a reference point to determine fog distance
    this.lowerLeftOnMap = getIntersectionWithXYPlane(-1, -1, GLX.Matrix.invert(this.viewProjMatrix.data));
    if (this.lowerLeftOnMap === undefined) {
      return;
    }

    // const lowerLeftDistanceToCenter = len2(this.lowerLeftOnMap);

    // fogDistance: closest distance at which the fog affects the geometry
    // this.fogDistance = Math.max(5000, lowerLeftDistanceToCenter);

    this.fogDistance = 5000;

    // fogBlurDistance: closest distance *beyond* fogDistance at which everything is completely enclosed in fog.
    this.fogBlurDistance = 10000;
  }

  speedUp () {
    this.isFast = true;
    // console.log('FAST');
    clearTimeout(this.speedTimer);
    this.speedTimer = setTimeout(() => {
      this.isFast = false;
      // console.log('SLOW');
    }, 1000);
  }

  destroy () {
    this.Picking.destroy();
    this.Horizon.destroy();
    this.Buildings.destroy();
    this.Markers.destroy();
    this.Basemap.destroy();
    this.MapShadows.destroy();

    if (this.cameraGBuffer) {
      this.cameraGBuffer.destroy();
    }

    if (this.sunGBuffer) {
      this.sunGBuffer.destroy();
    }

    this.ambientMap.destroy();
    this.blurredAmbientMap.destroy();

    clearTimeout(this.speedTimer);
  }
}
