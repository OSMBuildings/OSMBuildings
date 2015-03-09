
var Shader = function(name) {
  var config = SHADERS[name];

  this.id = gl.createProgram();
  this.name = name;

  if (!config.src) {
    throw new Error('missing source for shader "'+ name +'"');
  }

  this._attach(gl.VERTEX_SHADER,   config.src.vertex);
  this._attach(gl.FRAGMENT_SHADER, config.src.fragment);

  gl.linkProgram(this.id);

  if (!gl.getProgramParameter(this.id, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramParameter(this.id, gl.VALIDATE_STATUS) +'\n'+ gl.getError());
  }

  this.attributeNames = config.attributes;
  this.uniformNames = config.uniforms;
};

Shader.prototype = {
  _attach: function(type, src) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader));
    }

    gl.attachShader(this.id, shader);
  },

  use: function() {
    gl.useProgram(this.id);

    var i, name, loc;

    if (this.attributeNames) {
      this.attributes = {};
      for (i = 0; i < this.attributeNames.length; i++) {
        name = this.attributeNames[i];
        loc = gl.getAttribLocation(this.id, name);
        if (loc < 0) {
          console.error('could not locate attribute "'+ name +'" in shader "'+ this.name +'"');
        } else {
          gl.enableVertexAttribArray(loc);
          this.attributes[name] = loc;
        }
      }
    }

    if (this.uniformNames) {
      this.uniforms = {};
      for (i = 0; i < this.uniformNames.length; i++) {
        name = this.uniformNames[i];
        loc = gl.getUniformLocation(this.id, name);
        if (loc < 0) {
          console.error('could not locate uniform "'+ name +'" in shader "'+ this.name +'"');
        } else {
          this.uniforms[name] = loc;
        }
      }
    }

    return this;
  },

  end: function() {
    gl.useProgram(null);

    if (this.attributes) {
      for (var name in this.attributes) {
        gl.disableVertexAttribArray(this.attributes[name]);
      }
    }

    this.attributes = null;
    this.uniforms = null;
  }
};
