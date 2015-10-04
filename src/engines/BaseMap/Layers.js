
var Layers = function(map) {
  this.map = map;
  this.items = [];
};

Layers.prototype = {

  add: function(layer) {
    this.items.push(layer);
  },

  remove: function(layer) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i] === layer) {
        this.items.splice(i, 1);
        return;
      }
    }
  },

  getAttribution: function() {
    var attribution = [];
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].attribution) {
        attribution.push(this.items[i].attribution);
      }
    }
    return attribution;
  },

  render: function() {
    for (var i = 0; i < this.items.length; i++) {
      this.items[i].render();
    }
  },

  destroy: function() {
    for (var i = 0; i < this.items.length; i++) {
      this.items[i].destroy();
    }
    this.items = null;
  }
};
