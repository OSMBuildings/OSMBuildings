
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
    XHR.loadJSON(url, function(data) {
      this.add(data, position, options);
    }.bind(this));
  },

  add: function(data, position, options) {
    this.items.push(new Mesh(data, position, options));
  }
};
