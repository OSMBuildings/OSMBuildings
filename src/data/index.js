
// all commented sections are for collision checks

// create 2 cylinders and check
// function checkCollision(a, b) {
// }

var data = {
  Index: {
    items: [],
//  blockers: [],

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
      this.items = null;
//    this.blockers = null;
    }
  }
};
