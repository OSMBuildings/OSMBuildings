
var Renderer = function(options) {
  this.layers = {};

  ////this.layers.depth       = new layers.Depth(options);
  //this.layers.interaction = new layers.Interaction(options);
  //this.layers.skydome     = new layers.SkyDome(options);
  //this.layers.basemap     = new layers.Basemap(options);
  //this.layers.buildings   = new layers.Buildings(options);

//this.layers.depth       = Depth.initShader(options);
  this.layers.interaction = Interaction.initShader(options);
  this.layers.skydome     = SkyDome.initShader(options);
  this.layers.basemap     = Basemap.initShader(options);
  this.layers.buildings   = Buildings.initShader(options);

  this.resize();
  Events.on('resize', this.resize.bind(this));

  var color = Color.parse(options.backgroundColor || '#cccccc').toRGBA();
  this.backgroundColor = {
    r: color.r/255,
    g: color.g/255,
    b: color.b/255
  };

  gl.cullFace(gl.BACK);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  //Events.on('contextlost', function() {
  //  this.stop();
  //}.bind(this));

  //Events.on('contextrestored', function() {
  //  this.start();
  //}.bind(this));
};

Renderer.prototype = {

  start: function(container, options) {
    this.loop = setInterval(function() {
      requestAnimationFrame(function() {
        Map.transform = new Matrix()
          .rotateZ(Map.rotation)
          .rotateX(Map.tilt)
          .translate(WIDTH/2, HEIGHT/2, 0)
          .multiply(this.perspective);

// console.log('CONTEXT LOST?', gl.isContextLost());

//      this.layers.depth.render(this);
        this.layers.interaction.render(this);

        gl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.layers.skydome.render(this);
        this.layers.basemap.render(this);
        this.layers.buildings.render(this);
      }.bind(this));
    }.bind(this), 17);
  },

  stop: function() {
    clearInterval(this.loop);
  },

  resize: function() {
    this.perspective = Matrix._perspective(20, WIDTH, HEIGHT, 40000);
    gl.viewport(0, 0, WIDTH, HEIGHT);
  },

  destroy: function() {
    this.stop();
    for (var k in this.layers) {
      this.layers[k].destroy();
    }
  }
};
