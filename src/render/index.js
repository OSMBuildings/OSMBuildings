
var render = {

  start: function() {
    this.viewMatrix = new glx.Matrix();
    this.projMatrix = new glx.Matrix();
    this.viewProjMatrix = new glx.Matrix();

    MAP.on('resize', this.onResize.bind(this));
    this.onResize();

    MAP.on('change', this.onChange.bind(this));
    this.onChange();

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    render.Interaction.init(); // renders only on demand
    render.SkyDome.init();
    render.Buildings.init();
    render.Basemap.init();
    render.HudRect.init();
    render.NormalMap.init();
    render.DepthMap.init();
    render.AmbientMap.init();

    this.loop = setInterval(function() {
      requestAnimationFrame(function() {
        gl.clearColor(this.fogColor.r, this.fogColor.g, this.fogColor.b, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (MAP.zoom < MIN_ZOOM || MAP.zoom > MAX_ZOOM) {
          return;
        }

        render.SkyDome.render();
        render.Buildings.render();
        render.Basemap.render();

        //render.NormalMap.render();

/*
        render.DepthMap.render();
        render.AmbientMap.render(render.DepthMap.framebuffer.renderTexture.id);
        render.HudRect.render(render.AmbientMap.framebuffer.renderTexture.id);
*/
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

    this.fogRadius = Math.sqrt(width*width + height*height) / 1; // 2 would fit fine but camera is too close
  },

  destroy: function() {
    this.stop();
    render.Interaction.destroy();
    render.SkyDome.destroy();
    render.Buildings.destroy();
    render.Basemap.destroy();
  }
};
