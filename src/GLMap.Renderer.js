
var Renderer = {

  start: function(options) {
    this.fogColor = options.fogColor ? Color.parse(options.fogColor).toRGBA(true) : FOG_COLOR;

    this.layers = {};
    //this.layers.depth       = Depth.initShader();
    //this.layers.skydome   = SkyDome.initShader();
    this.layers.basemap   = Basemap.initShader();
    this.layers.buildings = Buildings.initShader({
      showBackfaces: options.showBackfaces
    });

    this.resize();
    Events.on('resize', this.resize.bind(this));

    GL.cullFace(GL.BACK);
    GL.enable(GL.CULL_FACE);
    GL.enable(GL.DEPTH_TEST);

    //Events.on('contextlost', function() {
    //  this.stop();
    //}.bind(this));

    //Events.on('contextrestored', function() {
    //  this.start();
    //}.bind(this));

    // NY: 500, 1000

    var radius = 500;
    var distance = 1000.0;
    
    this.loop = setInterval(function() {
      requestAnimationFrame(function() {
        Map.transform = new glx.Matrix()
          // altitude of the viewer
          // 200 is good for NY
          .translate(0,0,-250)
          .rotateZ(Map.rotation)
          .rotateX(Map.tilt);

// console.log('CONTEXT LOST?', GL.isContextLost());

        // TODO: do matrix operations only on map change + store vpMatrix here
        var vpMatrix = new glx.Matrix(glx.Matrix.multiply(Map.transform, this.perspective));

//      this.layers.depth.render(vpMatrix);

        GL.clearColor(this.fogColor.r, this.fogColor.g, this.fogColor.b, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        //this.layers.skydome.render(vpMatrix);
        this.layers.buildings.render(vpMatrix, Map.transform, this.perspective, radius, distance);
        this.layers.basemap.render(vpMatrix, Map.transform, this.perspective, radius, distance);
      }.bind(this));
    }.bind(this), 17);
  },

  stop: function() {
    clearInterval(this.loop);
  },

  resize: function() {
    var refHeight = 1024;
    var refVFOV = 120;

    this.perspective = new glx.Matrix()
      .translate(0, 0, 0) // 0, map y offset to neutralize camera y offset, map z -1220 scales map tiles to ~256px
      .scale(1, -1, 1) // flip Y
      .multiply(new glx.Matrix.Perspective(refVFOV * HEIGHT / refHeight, WIDTH/HEIGHT, 0.1, 5000))
      .translate(0, 0, 0); // camera y offset

    GL.viewport(0, 0, WIDTH, HEIGHT);
  },

  destroy: function() {
    this.stop();
    for (var k in this.layers) {
      this.layers[k].destroy();
    }
  }
};
