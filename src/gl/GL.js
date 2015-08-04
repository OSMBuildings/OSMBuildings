
var gl, loop;

var Scene = {

  width: 0,
  height: 0,
  backgroundColor: {},  

  init: function(container, options) {
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

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    Scene.setSize({ width: container.offsetWidth, height: container.offsetHeight });

    addListener(canvas, 'webglcontextlost', function(e) {
      clearInterval(loop);
    });

    //addListener(canvas, 'webglcontextrestored', ...);

//  Depth.initShader();
    Interaction.initShader(options);
    SkyDome.initShader(options);
    Basemap.initShader(options);
    Buildings.initShader(options);

    loop = setInterval(function() {

      requestAnimationFrame(function() {
        Map.transform = new Matrix()
          .rotateZ(Map.rotation)
          .rotateX(Map.tilt)
          .translate(Scene.width/2, Scene.height/2, 0)
          .multiply(Scene.perspective);

// console.log('CONTEXT LOST?', gl.isContextLost());

//      Depth.render();
        Interaction.render();

        gl.clearColor(backgroundColor.r, backgroundColor.g, backgroundColor.b, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        SkyDome.render();
        Basemap.render();
        Buildings.render();
      });
    }, 17);
  },

  setSize: function(size) {
    var
      canvas = gl.canvas,
      width = size.width, height = size.height;

    if (width !== Scene.width || height !== Scene.height) {
      canvas.width  = Scene.width  = width;
      canvas.height = Scene.height = height;

      Scene.perspective = Matrix._perspective(20, width, height, 40000);

      gl.viewport(0, 0, width, height);
      Events.emit('resize', size);
    }
  },

  destroy: function() {
    clearInterval(loop);
    gl.canvas.parentNode.removeChild(gl.canvas);
    gl = null;
  }
};
