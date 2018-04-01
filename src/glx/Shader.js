
GLX.Shader = class {

  constructor(config) {
    this.shaderName = config.shaderName;
    this.id = GL.createProgram();

    this.attach(GL.VERTEX_SHADER,   config.vertexShader);
    this.attach(GL.FRAGMENT_SHADER, config.fragmentShader);

    GL.linkProgram(this.id);

    if (!GL.getProgramParameter(this.id, GL.LINK_STATUS)) {
      throw new Error(GL.getProgramParameter(this.id, GL.VALIDATE_STATUS) + '\n' + GL.getError());
    }

    this.attributeNames = config.attributes || [];
    this.uniformNames   = config.uniforms || [];
    GL.useProgram(this.id);

    this.attributes = {};
    this.attributeNames.forEach(name => {
      this.locateAttribute(name);
    });

    this.uniforms = {};
    this.uniformNames.forEach(name => {
      this.locateUniform(name);
    });
  }

  locateAttribute(name) {
    const loc = GL.getAttribLocation(this.id, name);
    if (loc < 0) {
      throw new Error(`unable to locate attribute "${name}" in shader "${this.shaderName}"`);
    }
    this.attributes[name] = loc;
  }

  locateUniform(name) {
    const loc = GL.getUniformLocation(this.id, name);
    if (!loc) {
      throw new Error(`unable to locate uniform "${name}" in shader "${this.shaderName}"`);
    }
    this.uniforms[name] = loc;
  }

  attach(type, src) {
    const shader = GL.createShader(type);
    GL.shaderSource(shader, src);
    GL.compileShader(shader);

    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      throw new Error(GL.getShaderInfoLog(shader));
    }

    GL.attachShader(this.id, shader);
  }

  enable() {
    GL.useProgram(this.id);
    for (let name in this.attributes) {
      GL.enableVertexAttribArray(this.attributes[name]);
    }
    return this;
  }

  disable() {
    if (this.attributes) {
      for (let name in this.attributes) {
        GL.disableVertexAttribArray(this.attributes[name]);
      }
    }
  }

  bindBuffer(buffer, name) {
    if (this.attributes[name] === undefined) {
      throw new Error(`attempt to bind buffer to invalid attribute "${name}" in shader "${this.shaderName}"`);
    }
    buffer.enable();
    GL.vertexAttribPointer(this.attributes[name], buffer.itemSize, GL.FLOAT, false, 0, 0);
  }
  
  setUniform(name, type, value) {
    if (this.uniforms[name] === undefined) {
      throw new Error(`attempt to bind to invalid uniform "${name}" in shader "${this.shaderName}"`);
    }
    GL['uniform' + type](this.uniforms[name], value);
  }

  setAllUniforms(allUniforms) {
    allUniforms.forEach(uniform => {
      this.setUniform(uniform[0], uniform[1], uniform[2]);
    });
  }

  setUniformMatrix(name, type, value) {
    if (this.uniforms[name] === undefined) {
      throw new Error(`attempt to bind to invalid uniform "${name}" in shader "${this.shaderName}"`);
    }
    GL['uniformMatrix' + type](this.uniforms[name], false, value);
  }

  setAllUniformMatrices(allUniforms) {
    allUniforms.forEach(uniform => {
      this.setUniformMatrix(uniform[0], uniform[1], uniform[2]);
    });
  }
  
  bindTexture(uniform, textureUnit, glxTexture) {
    glxTexture.enable(textureUnit);
    this.setUniform(uniform, '1i', textureUnit);
  }

  destroy() {
    this.disable();
    this.id = null;
  }
};
