
// TODO: maybe let grid data sources store their items here

var Repo = {

  items: [],

  getVisibleItems: function() {
    var items = [];
    for (var i = 0, il = this.items.length; i < il; i++) {
      // TODO: check visiblity => know the bbox
      items.push(this.items[i]);
    }
    return items;
  },

  load: function(url, position, options) {
    if (typeof url === 'object') {
      this.addItems(url, position, options);
    } else if (typeof url === 'string') {
      XHR.loadJSON(url, function(data) {
        this.addItems(data, position, options);
      }.bind(this));
    }
  },

  addItems: function(data, position, options) {
    var mesh;
    for (var i = 0, il = data.meshes.length; i < il; i++) {
      mesh = data.meshes[i];
      mesh.offset = data.offset;
      this.items.push(new Model(mesh, position, options));
    }
  }
};
