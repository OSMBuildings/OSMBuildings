
var Shader = function(name, useFrameBuffer) {
  var config = SHADERS[name];

  this.id = gl.createProgram();
  this.name = name;

  if (!config.src) {
    throw new Error('missing source for shader "'+ name +'"');
  }

  this.attach(gl.VERTEX_SHADER,   config.src.vertex);
  this.attach(gl.FRAGMENT_SHADER, config.src.fragment);

  gl.linkProgram(this.id);

  if (!gl.getProgramParameter(this.id, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramParameter(this.id, gl.VALIDATE_STATUS) +'\n'+ gl.getError());
  }

  this.attributeNames = config.attributes;
  this.uniformNames   = config.uniforms;

  if (config.frameBuffer) {
    this.createFrameBuffer();
  }
};

Shader.prototype = {

  locateAttribute: function(name) {
    var loc = gl.getAttribLocation(this.id, name);
    if (loc < 0) {
      console.error('unable to locate attribute "'+ name +'" in shader "'+ this.name +'"');
      return;
    }
    gl.enableVertexAttribArray(loc);
    this.attributes[name] = loc;
  },

  locateUniform: function(name) {
    var loc = gl.getUniformLocation(this.id, name);
    if (loc < 0) {
      console.error('unable to locate uniform "'+ name +'" in shader "'+ this.name +'"');
      return;
    }
    this.uniforms[name] = loc;
  },

  createFrameBuffer: function() {
    this.frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

    var renderTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, Map.size.width, Map.size.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    var renderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, Map.size.width, Map.size.height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  },

  attach: function(type, src) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('('+ this.name +') '+ gl.getShaderInfoLog(shader));
    }

    gl.attachShader(this.id, shader);
  },

  use: function() {
    gl.useProgram(this.id);

    var i;

    if (this.attributeNames) {
      this.attributes = {};
      for (i = 0; i < this.attributeNames.length; i++) {
        this.locateAttribute(this.attributeNames[i]);
      }
    }

    if (this.uniformNames) {
      this.uniforms = {};
      for (i = 0; i < this.uniformNames.length; i++) {
        this.locateUniform(this.uniformNames[i]);
      }
    }

    if (this.frameBuffer) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    }

    return this;
  },

  end: function() {
    if (this.attributes) {
      for (var name in this.attributes) {
        gl.disableVertexAttribArray(this.attributes[name]);
      }
    }

    this.attributes = null;
    this.uniforms = null;

    if (this.frameBuffer) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  }
};
