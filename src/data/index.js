
// all commented sections are for collision checks

// create 2 cylinders and check
// function checkCollision(a, b) {
// }

var data = {
  Index: {
    items: [],
//  blockers: [],

    filters: [],

    addFilter: function(type, selector, duration) {
      duration = duration || 0;

      var filters = this.filters;
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

      var start = Date.now();
      var end = start+duration;

      for (var i = 0, il = this.items.length; i<il; i++) {
        indexItem = this.items[i];

        if (!indexItem.setFilter) {
          return;
        }

        for (j = 0, jl = indexItem.items.length; j < jl; j++) {
          item = indexItem.items[j];
          if (selector(item.id, item.data)) {
            item.filter = [start, end, 1, 0];
          }
        }

        indexItem.setFilter();
      }
    },

    removeFilter: function(type, selector, duration) {
      duration = duration || 0;

      var i, il;

      var filters = this.filters;
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

      var start = Date.now();
      var end = start+duration;

      for (i = 0, il = this.items.length; i<il; i++) {
        indexItem = this.items[i];

        if (!indexItem.setFilter) {
          return;
        }

        for (j = 0, jl = indexItem.items.length; j < jl; j++) {
          item = indexItem.items[j];
          if (selector(item.id, item.data)) {
            item.filter = [start, end, 0, 1];
          }
        }

        indexItem.setFilter();
      }
    },

    // applies all existing filters to an item
    // currently only suitable for 'hidden'
    applyFilters: function(indexItem) {
      var filters = this.filters;
      var type, selector;
      var item;
      var j, jl;

      if (!indexItem.setFilter) {
        return;
      }

      var start = Date.now();
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

      indexItem.setFilter();
    },

    add: function(item) {
      this.items.push(item);
      //if (item.replace) {
        //this.blockers.push(item);
//      }
    },

    remove: function(item) {
      var items = this.items;
      for (var i = 0, il = items.length; i < il; i++) {
        if (items[i] === item) {
          //if (items[i].replace) {
          //  for (var j = 0; j < this.blockers.length; j++) {
          //    if (this.blockers[j] === items[i]) {
          //      this.blockers.splice(j, 1);
          //      break;
          //    }
          //  }
          //}
          items.splice(i, 1);
          return;
        }
      }
    },

//    // check with other objects
//    checkCollisions: function(item) {
//      for (var i = 0, il = this.blockers.length; i < il; i++) {
  //    if (this.blockers.indexOf(item.id) >= 0) { // real collision check
  //     return true;
  //    }
//      }
//      return false;
//    },

    destroy: function() {
      // items are destroyed by grid
      this.items = [];
//    this.blockers = [];
    }
  }
};
