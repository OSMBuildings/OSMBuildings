
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

      var cMatrix = Matrix.create();
      cMatrix = Matrix.translate(cMatrix, 0, 0, 1000);

      requestAnimationFrame(function() {
        // TODO: update this only when Map changed
        var perspective = Matrix.perspective(20, Scene.width, Scene.height, 40000);

        var pMatrix = Matrix.create();
        pMatrix = Matrix.rotateZ(pMatrix, Map.rotation);
        pMatrix = Matrix.rotateX(pMatrix, Map.tilt);
        pMatrix = Matrix.translate(pMatrix, Scene.width/2, Scene.height/2, 0);
        pMatrix = Matrix.multiply(pMatrix, perspective);

// console.log('CONTEXT LOST?', gl.isContextLost());

//      Depth.render(pMatrix);
        Interaction.render(pMatrix);

        gl.clearColor(backgroundColor.r, backgroundColor.g, backgroundColor.b, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        SkyDome.render(pMatrix);
        Basemap.render(pMatrix);
        Buildings.render(pMatrix);
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
