
module.exports = class Shader {

  constructor (GL, config) {
    this.GL = GL;
    this.shaderName = config.shaderName;
    this.id = this.GL.createProgram();

    this.compile(this.GL.VERTEX_SHADER, config.vertexShader);
    this.compile(this.GL.FRAGMENT_SHADER, config.fragmentShader);

    this.GL.linkProgram(this.id);

    if (!this.GL.getProgramParameter(this.id, this.GL.LINK_STATUS)) {
      throw new Error(this.GL.getProgramParameter(this.id, this.GL.VALIDATE_STATUS) + '\n' + this.GL.getError());
    }

    this.GL.useProgram(this.id);

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
    const loc = this.GL.getAttribLocation(this.id, name);
    if (loc < 0) {
      throw new Error(`unable to locate attribute "${name}" in shader "${this.shaderName}"`);
    }
    this.attributes[name] = loc;
  }

  locateUniform (name) {
    const loc = this.GL.getUniformLocation(this.id, name);
    if (!loc) {
      throw new Error(`unable to locate uniform "${name}" in shader "${this.shaderName}"`);
    }
    this.uniforms[name] = loc;
  }

  compile (type, src) {
    const shader = this.GL.createShader(type);
    this.GL.shaderSource(shader, src);
    this.GL.compileShader(shader);

    if (!this.GL.getShaderParameter(shader, this.GL.COMPILE_STATUS)) {
      throw new Error(this.GL.getShaderInfoLog(shader));
    }

    this.GL.attachShader(this.id, shader);
  }

  enable () {
    this.GL.useProgram(this.id);
    for (let name in this.attributes) {
      this.GL.enableVertexAttribArray(this.attributes[name]);
    }
    return this;
  }

  disable () {
    if (this.attributes) {
      for (let name in this.attributes) {
        this.GL.disableVertexAttribArray(this.attributes[name]);
      }
    }
  }

  setBuffer (name, buffer) {
    if (this.attributes[name] === undefined) {
      throw new Error(`attempt to bind buffer to invalid attribute "${name}" in shader "${this.shaderName}"`);
    }
    buffer.enable();
    this.GL.vertexAttribPointer(this.attributes[name], buffer.itemSize, this.GL.FLOAT, false, 0, 0);
  }

  setParam (name, type, value) {
    if (this.uniforms[name] === undefined) {
      throw new Error(`attempt to bind to invalid uniform "${name}" in shader "${this.shaderName}"`);
    }
    this.GL['uniform' + type](this.uniforms[name], value);
  }

  setMatrix (name, type, value) {
    if (this.uniforms[name] === undefined) {
      throw new Error(`attempt to bind to invalid uniform "${name}" in shader "${this.shaderName}"`);
    }
    this.GL['uniformMatrix' + type](this.uniforms[name], false, value);
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
