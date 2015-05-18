
var Data = {

  items: [],
  modifier: function() {},

  add: function(item) {
    this.items.push(item);
  },

  remove: function(item) {
    var items = this.items;
    for (var i = 0, il = items.length; i < il; i++) {
      if (items[i] === item) {
        items.splice(i, 1);
        return;
      }
    }
  },

  destroy: function() {
    this.items = null;
  },
  
  modify: function(fn) {
    this.modifier = fn;
    var dataItems = this.items;
    for (var i = 0, il = dataItems.length; i < il; i++) {
      dataItems[i].modify(fn);
    }
  }

};
