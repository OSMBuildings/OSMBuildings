
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

    var glOptions = {
      antialias: true,
      depth: true,
      premultipliedAlpha: false
    };

    try { gl = canvas.getContext('webgl', glOptions); } catch(ex) {}
    if (!gl) try { gl = canvas.getContext('experimental-webgl', glOptions); } catch(ex) {}
    if (!gl) { throw new Error('WebGL not supported'); }

    var color = Color.parse(options.backgroundColor ? options.backgroundColor : '#cccccc').toRGBA();
    var backgroundColor = {
      r: color.r/255,
      g: color.g/255,
      b: color.b/255
    };

    if (options.showBackfaces) {
      gl.disable(gl.CULL_FACE);
    } else {
      gl.enable(gl.CULL_FACE);
    }
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);

    Scene.setSize({ width: container.offsetWidth, height: container.offsetHeight });

    addListener(canvas, 'webglcontextlost', function(e) {
      clearInterval(loop);
    });

    //addListener(canvas, 'webglcontextrestored', ...);

//    Depth.initShader();
    Interaction.initShader();
    SkyDome.initShader();
    Basemap.initShader();
    Buildings.initShader();

    loop = setInterval(function() {
      requestAnimationFrame(function() {
        // TODO: update this only when Map changed
        var projection = Matrix.perspective(20, Scene.width, Scene.height, 40000);
//      projectionOrtho = Matrix.ortho(Scene.width, Scene.height, 40000);

        // TODO: update this only when Map changed
        var matrix = Matrix.create();
        matrix = Matrix.rotateZ(matrix, Map.rotation);
        matrix = Matrix.rotateX(matrix, Map.tilt);
        matrix = Matrix.translate(matrix, Scene.width/2, Scene.height/2, 0);
        matrix = Matrix.multiply(matrix, projection);

// console.log('CONTEXT LOST?', gl.isContextLost());

//      Depth.render(matrix);
        Interaction.render(matrix);

        gl.clearColor(backgroundColor.r, backgroundColor.g, backgroundColor.b, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        SkyDome.render(matrix);
        Basemap.render(matrix);
        Buildings.render(matrix);
      });
    }, 17);
  },

  setSize: function(size) {
    var canvas = gl.canvas;
    if (size.width !== Scene.width || size.height !== Scene.height) {
      canvas.width  = Scene.width  = size.width;
      canvas.height = Scene.height = size.height;
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
