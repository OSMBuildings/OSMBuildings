
var Shader = function(name) {
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

  if (config.framebuffer) {
    this.framebuffer = new GL.Framebuffer();
    Events.on('resize', function() {
      this.framebuffer.setSize();
    }.bind(this));
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

  attach: function(type, src) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('('+ this.name +') '+ gl.getShaderInfoLog(shader));
    }

    gl.attachShader(this.id, shader);
  },

  enable: function() {
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

    if (this.framebuffer) {
      this.framebuffer.enable();
    }

    return this;
  },

  disable: function() {
    if (this.attributes) {
      for (var name in this.attributes) {
        gl.disableVertexAttribArray(this.attributes[name]);
      }
    }

    this.attributes = null;
    this.uniforms = null;

    if (this.framebuffer) {
      this.framebuffer.disable();
    }
  }
};
