class Icon {

  constructor (url = Icon.defaultURL) {
    this.type = 'svg';
    this.url = url;
  }

  load (callback) {
    if (this.url === Icon.defaultURL) {
      this.onLoad (DEFAULT_ICON, callback);
      return;
    }

    Request.getText(this.url, (err, svg) => {
      if (err) {
        callback(err);
        return;
      }
      this.onLoad (svg, callback);
    });
  }

  onLoad (svg, callback) {
    const vertices = [];
    triangulateSVG(svg).forEach(triangle => {
      const a = [triangle[0][0], triangle[0][1], 0];
      const b = [triangle[1][0], triangle[1][1], 0];
      const c = [triangle[2][0], triangle[2][1], 0];

      vertices.push(...a, ...b, ...c);
    });

    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));
    APP.icons.add(this);

    callback(null, this);
  }

  destroy () {
    APP.icons.remove(this);
    this.vertexBuffer && this.vertexBuffer.destroy();
  }
}

Icon.defaultURL = 'default_icon';
