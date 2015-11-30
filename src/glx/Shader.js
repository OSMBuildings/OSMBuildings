
glx.Shader = function(config) {
  var i;

  this.id = GL.createProgram();

  this.attach(GL.VERTEX_SHADER,   config.vertexShader);
  this.attach(GL.FRAGMENT_SHADER, config.fragmentShader);

  GL.linkProgram(this.id);

  if (!GL.getProgramParameter(this.id, GL.LINK_STATUS)) {
    throw new Error(GL.getProgramParameter(this.id, GL.VALIDATE_STATUS) +'\n'+ GL.getError());
  }

  this.attributeNames = config.attributes || [];
  this.uniformNames   = config.uniforms || [];
  GL.useProgram(this.id);

  this.attributes = {};
  for (i = 0; i < this.attributeNames.length; i++) {
    this.locateAttribute(this.attributeNames[i]);
  }
  
  this.uniforms = {};
  for (i = 0; i < this.uniformNames.length; i++) {
    this.locateUniform(this.uniformNames[i]);
  }
};

glx.Shader.prototype = {

  locateAttribute: function(name) {
    var loc = GL.getAttribLocation(this.id, name);
    if (loc < 0) {
      console.error('unable to locate attribute "'+ name +'" in shader');
      return;
    }
    this.attributes[name] = loc;
  },

  locateUniform: function(name) {
    var loc = GL.getUniformLocation(this.id, name);
    if (loc < 0) {
      console.error('unable to locate uniform "'+ name +'" in shader');
      return;
    }
    this.uniforms[name] = loc;
  },

  attach: function(type, src) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, src);
    GL.compileShader(shader);

    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      throw new Error(GL.getShaderInfoLog(shader));
    }

    GL.attachShader(this.id, shader);
  },

  enable: function() {
    GL.useProgram(this.id);

    for (var name in this.attributes) {
      GL.enableVertexAttribArray(this.attributes[name]);
    }
    
    return this;
  },

  disable: function() {
    if (this.attributes) {
      for (var name in this.attributes) {
        GL.disableVertexAttribArray(this.attributes[name]);
      }
    }
  },
  
  bindBuffer: function(buffer, attribute) {
    if (this.attributes[attribute] === undefined) {
      //console.log("[WARN] attempt to bind VBO to non-existent attribute '%s'", attribute);
      return;
    }
    
    buffer.enable();
    GL.vertexAttribPointer(this.attributes[attribute], buffer.itemSize, gl.FLOAT, false, 0, 0);

  },
  
  setUniform: function(uniform, type, value) {
    if (this.uniforms[uniform] === undefined) {
      return;
    }
    
    GL["uniform" + type]( this.uniforms[uniform], value);
  },

  destroy: function() {
    this.disable();
    this.id = null;
  }
};
