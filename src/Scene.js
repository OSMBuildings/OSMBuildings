
var gl, loop;

var Scene = {

  width: 0,
  height: 0,
<<<<<<< HEAD
=======
  backgroundColor: {},  
>>>>>>> ssao

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
<<<<<<< HEAD

    Scene.backgroundColor = Color.parse(options.backgroundColor ? options.backgroundColor : '#cccccc').toRGBA();
    Scene.backgroundColor.r /= 255;
    Scene.backgroundColor.g /= 255;
    Scene.backgroundColor.b /= 255;
=======
 
    var color = Color.parse(options.backgroundColor ? options.backgroundColor : '#cccccc').toRGBA();
    Scene.backgroundColor = {
      r: color.r/255,
      g: color.g/255,
      b: color.b/255
    };
>>>>>>> ssao

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

<<<<<<< HEAD
    Basemap.initShader();
    Buildings.initShader();
    Interaction.initShader();
=======
    Depth.initShader();
    Interaction.initShader();
    Basemap.initShader();
    Buildings.initShader();
>>>>>>> ssao

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

<<<<<<< HEAD
=======
//      Depth.render(matrix);
>>>>>>> ssao
        Interaction.render(matrix);
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

<<<<<<< HEAD
  createBuffer: function(itemSize, data) {
    var buffer = gl.createBuffer();
    buffer.itemSize = itemSize;
    buffer.numItems = data.length / itemSize;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    data = null;
    return buffer;
  },

  createTexture: function(img) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    img = null;
    return texture;
  },

  createFrameBuffer: function() {
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    var renderTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, Scene.width, Scene.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    var renderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, Scene.width, Scene.height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return frameBuffer;
  },

  deleteBuffer: function(buffer) {
    gl.deleteBuffer(buffer);
  },

  deleteTexture: function(texture) {
    gl.deleteTexture(texture);
  },

=======
>>>>>>> ssao
  destroy: function() {
    clearInterval(loop);
    gl.canvas.parentNode.removeChild(gl.canvas);
    gl = null;
  }
};
