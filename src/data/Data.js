
var Data = {

  items: [],

  add: function(data) {
    this.items.push(new Mesh(data));
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
  }
};
