class Icon {

  constructor () {
    this.type = 'svg';
  }

  load (url, callback) {
    Request.getText(url, (err, svg) => {
      if (err) {
        callback(err);
        return;
      }

      this.onLoad(svg);
      callback(null, this);
    });
  }

  onLoad (svg) {
    const vertices = [];

    triangulateSVG(svg).forEach(triangle => {
      const a = [triangle[0][0], 0, triangle[0][1]];
      const b = [triangle[1][0], 0, triangle[1][1]];
      const c = [triangle[2][0], 0, triangle[2][1]];

      vertices.push(...a, ...c, ...b);
    });

    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

    APP.icons.add(this);
  }

  destroy () {
    APP.icons.remove(this);
    this.vertexBuffer && this.vertexBuffer.destroy();
  }
}
