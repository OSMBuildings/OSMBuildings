GLX.Shader = class {

  constructor (config) {
    this.name = config.source.name || '';
    this.id = GL.createProgram();

    this.compile(GL.VERTEX_SHADER, config.source.vs);
    this.compile(GL.FRAGMENT_SHADER, config.source.fs);

    GL.linkProgram(this.id);

    if (!GL.getProgramParameter(this.id, GL.LINK_STATUS)) {
      throw new Error(GL.getProgramParameter(this.id, GL.VALIDATE_STATUS) + '\n' + GL.getError());
    }

    GL.useProgram(this.id);

    this.attributes = {};
    (config.attributes || []).forEach(item => {
      this.locateAttribute(item);
    });

    this.uniforms = {};
    (config.uniforms || []).forEach(item => {
      this.locateUniform(item);
    });
  }

  locateAttribute (name) {
    const loc = GL.getAttribLocation(this.id, name);
    if (loc < 0) {
      throw new Error(`unable to locate attribute "${name}" in shader "${this.name}"`);
    }
    this.attributes[name] = loc;
  }

  locateUniform (name) {
    const loc = GL.getUniformLocation(this.id, name);
    if (!loc) {
      throw new Error(`unable to locate uniform "${name}" in shader "${this.name}"`);
    }
    this.uniforms[name] = loc;
  }

  compile (type, src) {
    const shader = GL.createShader(type);
    GL.shaderSource(shader, src);
    GL.compileShader(shader);

    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      throw new Error(GL.getShaderInfoLog(shader));
    }

    GL.attachShader(this.id, shader);
  }

  enable () {
    GL.useProgram(this.id);
    for (let name in this.attributes) {
      GL.enableVertexAttribArray(this.attributes[name]);
    }
  }

  disable () {
    if (this.attributes) {
      for (let name in this.attributes) {
        GL.disableVertexAttribArray(this.attributes[name]);
      }
    }
  }

  setBuffer (name, buffer) {
    if (this.attributes[name] === undefined) {
      throw new Error(`attempt to bind buffer to invalid attribute "${name}" in shader "${this.name}"`);
    }
    buffer.enable();
    GL.vertexAttribPointer(this.attributes[name], buffer.itemSize, GL.FLOAT, false, 0, 0);
  }

  setParam (name, type, value) {
    if (this.uniforms[name] === undefined) {
      throw new Error(`attempt to bind to invalid uniform "${name}" in shader "${this.name}"`);
    }
    GL['uniform' + type](this.uniforms[name], value);
  }

  setMatrix (name, type, value) {
    if (this.uniforms[name] === undefined) {
      throw new Error(`attempt to bind to invalid uniform "${name}" in shader "${this.name}"`);
    }
    GL['uniformMatrix' + type](this.uniforms[name], false, value);
  }

  setTexture (uniform, textureUnit, glxTexture) {
    glxTexture.enable(textureUnit);
    this.setParam(uniform, '1i', textureUnit);
  }

  destroy () {
    this.disable();
    this.id = null;
  }
};
