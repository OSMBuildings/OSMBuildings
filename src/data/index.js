
var data = {
  Index: {
    items: [],

    add: function(item) {
      this.items.push(item);
      if (item.replace) {
        // add to collision sources
      }
    },

    remove: function(item) {
      var items = this.items;
      for (var i = 0, il = items.length; i < il; i++) {
        if (items[i] === item) {
          if (items[i].replace) {
            // remove from collision sources
          }
          items.splice(i, 1);
          return;
        }
      }
    },

//  applyModifiers: function(item) {},

//    _replaceItems: function() {
//      if (this.replace) {
//        var replaces = this.replaces;
//        Data.addModifier(function(item) {
//          if (replaces.indexOf(item.id)>=0) {
//            item.hidden = true;
//          }
//        });
//      }
//    },

    destroy: function() {
      this.items = null;
    }
  }
};
