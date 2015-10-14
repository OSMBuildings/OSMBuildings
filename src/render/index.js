
var render = {

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

    this.loop = setInterval(function() {
      requestAnimationFrame(function() {
        gl.clearColor(this.fogColor.r, this.fogColor.g, this.fogColor.b, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (MAP.zoom < APP.minZoom || MAP.zoom > APP.maxZoom) {
          return;
        }

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
