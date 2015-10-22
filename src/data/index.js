
// all commented sections are for collision checks

// create 2 cylinders and check
// function checkCollision(a, b) {
// }

var data = {
  Index: {
    items: [],
//  blockers: [],

    filters: [],

    addFilter: function(type, selector) {
      this.filters.push({ type:type, selector:selector });

      // applies a single filter to all items
      // currently only suitable for 'hidden'
      var indexItem;
      var item;
      var j, jl;

      for (var i = 0, il = this.items.length; i<il; i++) {
        indexItem = this.items[i];

        if (!indexItem.setColors) {
          return;
        }

        for (j = 0, jl = indexItem.items.length; j < jl; j++) {
          item = indexItem.items[j];
          if (selector(item)) {
            item.color[3] = 0;
          }
        }

        indexItem.setColors();
      }
    },

    removeFilter: function(type, selector) {
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

      for (i = 0, il = this.items.length; i<il; i++) {
        indexItem = this.items[i];

        if (!indexItem.setColors) {
          return;
        }

        for (j = 0, jl = indexItem.items.length; j < jl; j++) {
          item = indexItem.items[j];
          if (selector(item)) {
            item.color[3] = 1;
          }
        }

        indexItem.setColors();
      }
    },

    // applies all existing filters to an item
    // currently only suitable for 'hidden'
    applyFilters: function(indexItem) {
      var filters = this.filters;
      var selector, type;
      var item;
      var j, jl;

      if (!indexItem.setColors) {
        return;
      }

      for (var i = 0, il = filters.length; i < il; i++) {
        type = filters[i].type;
        selector = filters[i].selector;

        for (j = 0, jl = indexItem.items.length; j < jl; j++) {
          item = indexItem.items[j];
          if (selector(item)) {
            item.color[3] = 0;
          }
        }
      }

      indexItem.setColors();
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
