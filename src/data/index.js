
// all commented sections are for collision checks

// create 2 cylinders and check
// function checkCollision(a, b) {
// }

var data = {
  Index: {
    items: [],
//  blockers: [],

    selectors: [],

    addSelector: function(selector) {
      this.selectors.push(selector);
    },

    removeSelector: function(selector) {
      var selectors = this.selectors;
      for (var i = 0, il = selectors.length; i < il; i++) {
        if (selectors[i] === selector) {
          selectors.splice(i, 1);
          return;
        }
      }
    },

    applyAllSelectors: function() {
      for (var i = 0, il = this.items.length; i<il; i++) {
        this.applySelectorsFor(this.items[i]);
      }
    },

    applySelectorsFor: function(item) {
      var selectors = this.selectors;
      var sel, act;
      var itemItem;
      var j, jl;

      if (!item.setColors) {
        return;
      }

      for (var s = 0, sl = selectors.length; s < sl; s++) {
        sel = selectors[s].selector;
        act = selectors[s].action;

        for (j = 0, jl = item.items.length; j<jl; j++) {
          itemItem = item.items[j];
          if (sel(itemItem)) {
            if (act === 'show') {
              itemItems.hidden = false;
              itemItem.color[3] = 1;
            }
            if (act === 'hide') {
              itemItems.hidden = false;
              itemItem.color[3] = 0;
            }
          }
        }

        item.setColors();
      }
    },

    add: function(item) {
      this.items.push(item);
      //if (item.replace) {
        //this.blockers.push(item);
//      Events.emit('modify');
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
          //Events.emit('modify');
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
      this.items = [];
//    this.blockers = [];
    }
  }
};
