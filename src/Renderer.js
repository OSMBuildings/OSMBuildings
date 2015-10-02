
var Renderer = {

  start: function() {
    this.transformMatrix = new glx.Matrix();
    this.projectionMatrix = new glx.Matrix();
    this.vpMatrix = new glx.Matrix();

    MAP.on('resize', this.onResize.bind(this));
    this.onResize();

    MAP.on('change', this.onChange.bind(this));
    this.onChange();

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    Interaction.initShader();
    Buildings.initShader();
    SkyDome.initShader();

    this.loop = setInterval(function() {
      requestAnimationFrame(function() {
        gl.clearColor(this.fogColor.r, this.fogColor.g, this.fogColor.b, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        SkyDome.render(this.vpMatrix);
        Buildings.render(this.vpMatrix);
      }.bind(this));
    }.bind(this), 17);
  },

  onChange: function() {
    this.transformMatrix = new glx.Matrix()
      .rotateZ(MAP.rotation)
      .rotateX(MAP.tilt);

    this.vpMatrix = new glx.Matrix(glx.Matrix.multiply(this.transformMatrix, this.projectionMatrix));
  },

  onResize: function() {
    var
      width = MAP.width,
      height = MAP.height,
      refHeight = 1024,
      refVFOV = 45;

    this.projectionMatrix = new glx.Matrix()
      .translate(0, -height/2, -1220) // 0, MAP y offset to neutralize camera y offset, MAP z -1220 scales MAP tiles to ~256px
      .scale(1, -1, 1) // flip Y
      .multiply(new glx.Matrix.Perspective(refVFOV * height / refHeight, width/height, 0.1, 5000))
      .translate(0, -1, 0); // camera y offset

    glx.context.viewport(0, 0, width, height);

    this.vpMatrix = new glx.Matrix(glx.Matrix.multiply(this.transformMatrix, this.projectionMatrix));

    this.fogRadius = Math.sqrt(width*width + height*height) / 1; // 2 would fit fine but camera is too close
  },

  destroy: function() {
    clearInterval(this.loop);
    Skydome.destroy();
    Buildings.destroy();
    Interaction.destroy();
  }
};
