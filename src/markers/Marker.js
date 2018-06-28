class Marker {

  constructor (options = {}) {
    this.position = { altitude: 0, ...options.position };
    this.anchor = options.anchor || 'bottom';
    this.scale = options.scale || 1; // TODO -> size

options.url = '../src/icons/default.svg';

    this.load(options.url);
  }

  load (url) {
    if (!url) {
      console.log('loading default icon');
      this.loadDefaultIcon();
      return;
    }

    // let icon = APP.icons.get(url);
    // if (!icon) {
      let icon = new Icon();
      // TODO DANGER can be loading but not added yet
      icon.load(url, err => {
        if (err) {
          console.log(`can't read icon ${url}`);
          this.loadDefaultIcon();
          return;
        }

        this.icon = icon;
        this.onLoad();
        APP.markers.add(this);
      });
    // }
  }

  // TODO
  loadDefaultIcon () {
    // let icon = APP.icons.get('../src/icons/default.svg');
    // if (!icon) {
      let icon = new Icon();
      // TODO DANGER can be loading but not added yet
      icon.load(url, err => {
        if (err) {
          console.log(`can't read icon ${url}`);
          return;
        }

        this.icon = icon;
        this.onLoad();
        APP.markers.add(this);
      });
    // }
  }

  onLoad () {
    // const halfSize = this.size / 2;
    // const anchorsCoordPool = {
    //   center: [halfSize, halfSize, halfSize, halfSize],
    //   top: [0, halfSize, this.size, halfSize],
    //   bottom: [this.size, halfSize, 0, halfSize],
    //   left: [halfSize, 0, halfSize, this.size],
    //   right: [halfSize, this.size, halfSize, 0],
    //   top_left: [0, 0, this.size, this.size],
    //   top_right: [0, this.size, this.size, 0],
    //   bottom_left: [this.size, -this.size, 0, 0],
    //   bottom_right: [this.size, this.size, 0, 0]
    // };
    //
    // const anchorCoord = anchorsCoordPool[this.anchor] || anchorsCoordPool.center;
    //
    // const vertices = [
    //   -anchorCoord[1], -anchorCoord[0], 0, // upper left
    //    anchorCoord[3], -anchorCoord[0], 0, // upper right
    //   -anchorCoord[1],  anchorCoord[2], 0, // bottom left
    //    anchorCoord[3],  anchorCoord[2], 0, // bottom right
    //   -anchorCoord[1],  anchorCoord[2], 0, // bottom left
    //    anchorCoord[3], -anchorCoord[0], 0  // upper right
    // ];
  }

  destroy () {
    APP.markers.remove(this);
  }
}
