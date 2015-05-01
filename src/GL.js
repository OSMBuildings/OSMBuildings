
var gl;

var loop;

var GL = {

  createContext: function(container) {
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

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);

    Map.setSize({ width: container.offsetWidth, height: container.offsetHeight });

    addListener(canvas, 'webglcontextlost', function(e) {
      clearInterval(loop);
    });

    //addListener(canvas, 'webglcontextrestored', ...);

    Basemap.initShader();
    Buildings.initShader();
    Interaction.initShader();

    loop = setInterval(function() {
      requestAnimationFrame(function() {
        gl.clearColor(0.75, 0.75, 0.75, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // TODO: update this only when Map changed
        var projection = Matrix.perspective(20, Map.size.width, Map.size.height, 40000);
//      projectionOrtho = Matrix.ortho(Map.size.width, Map.size.height, 40000);

        // TODO: update this only when Map changed
        var matrix = Matrix.create();
        matrix = Matrix.rotateZ(matrix, Map.rotation);
        matrix = Matrix.rotateX(matrix, Map.tilt);
        matrix = Matrix.translate(matrix, Map.size.width/2, Map.size.height/2, 0);
        matrix = Matrix.multiply(matrix, projection);

        Basemap.render(matrix);
        Buildings.render(matrix);
//      Interaction.render(matrix);
      });
    }, 17);
  },

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

  deleteBuffer: function(buffer) {
    gl.deleteBuffer(buffer);
  },

  deleteTexture: function(texture) {
    gl.deleteTexture(texture);
  },

  destroy: function() {
    clearInterval(loop);
    gl.canvas.parentNode.removeChild(gl.canvas);
    gl = null;
  }
};
