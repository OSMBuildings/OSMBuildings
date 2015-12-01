
// TODO: collision check with bounding cylinders

var data = {
  Index: {
    items: [],

    add: function(item) {
      this.items.push(item);
    },

    remove: function(item) {
      this.items = this.items.filter(function(i) {
        return (i !== item);
      });
    },

    destroy: function() {
      // items are destroyed by grid
      this.items = [];
    }
  }
};
