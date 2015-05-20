
var gl, loop;

var Scene = {

  width: 0,
  height: 0,
  backgroundColor: {},  

  create: function(container, options) {
    var canvas = document.createElement('CANVAS');
    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    try {
      gl = canvas.getContext('experimental-webgl', {
        antialias: true,
        depth: true,
        premultipliedAlpha: false
      });
    } catch(ex) {
      throw ex;
    }
 
    var color = Color.parse(options.backgroundColor ? options.backgroundColor : '#cccccc').toRGBA();
    this.backgroundColor = {
      r: color/255,
      g: color/255,
      b: color/255
    };

    if (options.showBackfaces) {
      gl.disable(gl.CULL_FACE);
    } else {
      gl.enable(gl.CULL_FACE);
    }
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);

    this.setSize({ width: container.offsetWidth, height: container.offsetHeight });

    addListener(canvas, 'webglcontextlost', function(e) {
      clearInterval(loop);
    });

    //addListener(canvas, 'webglcontextrestored', ...);

    Depth.initShader();
    Interaction.initShader();
    Basemap.initShader();
    Buildings.initShader();

    loop = setInterval(function() {
      requestAnimationFrame(function() {
        // TODO: update this only when Map changed
        var projection = Matrix.perspective(20, this.width, this.height, 40000);
//      projectionOrtho = Matrix.ortho(this.width, this.height, 40000);

        // TODO: update this only when Map changed
        var matrix = Matrix.create();
        matrix = Matrix.rotateZ(matrix, Map.rotation);
        matrix = Matrix.rotateX(matrix, Map.tilt);
        matrix = Matrix.translate(matrix, this.width/2, this.height/2, 0);
        matrix = Matrix.multiply(matrix, projection);

// console.log('CONTEXT LOST?', gl.isContextLost());

//        Depth.render(matrix);
//        Interaction.render(matrix);
        Basemap.render(matrix);
        Buildings.render(matrix);
      });
    }, 17);
  },

  setSize: function(size) {
    var canvas = gl.canvas;
    if (size.width !== this.width || size.height !== this.height) {
      canvas.width  = this.width  = size.width;
      canvas.height = this.height = size.height;
      gl.viewport(0, 0, size.width, size.height);
      Events.emit('resize', size);
    }
  },

  destroy: function() {
    clearInterval(loop);
    gl.canvas.parentNode.removeChild(gl.canvas);
    gl = null;
  }
};
