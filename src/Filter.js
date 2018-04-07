
var Filter = {

  start: Date.now(),
  now: 0,
  items: [],

  add: function(type, selector, duration) {
    duration = duration || 0;

    var filters = this.items;
    // if filter already exists, do nothing
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

    var start = this.getTime();
    var end = start+duration;

    for (var i = 0, il = data.Index.items.length; i<il; i++) {
      indexItem = data.Index.items[i];

      if (!indexItem.applyFilter) {
        continue;
      }

      for (j = 0, jl = indexItem.items.length; j < jl; j++) {
        item = indexItem.items[j];
        if (selector(item.id)) {
          item.filter = [start, end, item.filter ? item.filter[3] : 1, 0];
        }
      }

      indexItem.applyFilter();
    }
  },

  remove: function(type, selector, duration) {
    duration = duration || 0;

    var i, il;

    this.items = this.items.filter(function(item) {
      return (item.type !== type || item.selector !== selector);
    });

    // removes a single filter from all items
    // currently only suitable for 'hidden'
    var indexItem;
    var item;
    var j, jl;

    var start = this.getTime();
    var end = start+duration;

    for (i = 0, il = data.Index.items.length; i<il; i++) {
      indexItem = data.Index.items[i];

      if (!indexItem.applyFilter) {
        continue;
      }

      for (j = 0, jl = indexItem.items.length; j < jl; j++) {
        item = indexItem.items[j];
        if (selector(item.id)) {
          item.filter = [start, end, item.filter ? item.filter[3] : 0, 1];
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

    for (var i = 0, il = filters.length; i < il; i++) {
      type = filters[i].type;
      selector = filters[i].selector;

      for (j = 0, jl = indexItem.items.length; j < jl; j++) {
        item = indexItem.items[j];
        if (selector(item.id)) {
          item.filter = [0, 0, 0, 0];
        }
      }
    }

    indexItem.applyFilter();
  },

  getTime: function() {
    return this.now;
  },

  nextTick: function() {
    this.now = Date.now()-this.start;
  },

  destroy: function() {
    this.items = [];
  }
};
