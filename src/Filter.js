
var Filter = {
  start: Date.now(),
  items: [],

  add: function(type, selector, duration) {
    duration = duration || 0;

    var filters = this.items;
    for (i = 0, il = filters.length; i < il; i++) {
      if (filters[i].type === type && filters[i].selector === selector) {
        return;
      }
    }

    filters.push({ type:type, selector:selector, duration:duration });

    // applies a single filter to all items
    // currently only suitable for 'hidden'
    var indexItem;
    var item;
    var j, jl;

    var start = this.time();
    var end = start+duration;

    for (var i = 0, il = this.items.length; i<il; i++) {
      indexItem = this.items[i];

      if (!indexItem.applyFilter) {
        return;
      }

      for (j = 0, jl = indexItem.items.length; j < jl; j++) {
        item = indexItem.items[j];
        if (selector(item.id, item.data)) {
          item.filter = [start, end, 1, 0];
        }
      }

      indexItem.applyFilter();
    }
  },

  remove: function(type, selector, duration) {
    duration = duration || 0;

    var i, il;

    var filters = this.items;
    for (i = 0, il = filters.length; i < il; i++) {
      if (filters[i].type === type && filters[i].selector === selector) {
        filters.splice(i, 1);
        break;
      }
    }

    // removes a single filter from all items
    // currently only suitable for 'hidden'
    var indexItem;
    var item;
    var j, jl;

    var start = this.time();
    var end = start+duration;

    for (i = 0, il = this.items.length; i<il; i++) {
      indexItem = this.items[i];

      if (!indexItem.applyFilter) {
        return;
      }

      for (j = 0, jl = indexItem.items.length; j < jl; j++) {
        item = indexItem.items[j];
        if (selector(item.id, item.data)) {
          item.filter = [start, end, 0, 1];
        }
      }

      indexItem.applyFilter();
    }
  },

  // applies all existing filters to an item
  // currently only suitable for 'hidden'
  apply: function(indexItem) {
    var filters = this.items;
    var type, selector;
    var item;
    var j, jl;

    if (!indexItem.applyFilter) {
      return;
    }

    var start = this.time();
    var end;

    for (var i = 0, il = filters.length; i < il; i++) {
      type = filters[i].type;
      selector = filters[i].selector;
      end = start+filters[i].duration;

      for (j = 0, jl = indexItem.items.length; j < jl; j++) {
        item = indexItem.items[j];
        if (selector(item.id, item.data)) {
          item.filter = [start, end, 1, 0];
        }
      }
    }

    indexItem.applyFilter();
  },

  time: function() {
    return Date.now()-this.start;
  },

  destroy: function() {
    this.items = [];
  }
};
