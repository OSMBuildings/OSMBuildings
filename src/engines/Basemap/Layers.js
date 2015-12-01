
var Layers = function(map) {
  this.map = map;
  this.items = [];
};

Layers.prototype = {

  add: function(layer) {
    this.items.push(layer);
  },

  remove: function(layer) {
    this.items = this.items.filter(function(item) {
      return (item !== layer);
    });
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

  destroy: function() {
    this.items = [];
  }
};
