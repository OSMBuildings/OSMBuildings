
var Data = {

  items: [],

  add: function(mesh) {
    this.items.push(mesh);
  },

  remove: function(item) {
    var items = this.items;
    for (var i = 0, il = items.length; i < il; i++) {
      if (items[i] === item) {
        items[i].destroy();
        items.splice(i, 1);
        return;
      }
    }
  },

  destroy: function() {
    this.items = null;
  }
};
