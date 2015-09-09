
var mesh = {};

//  Mesh.prototype = {
//    _setItems: function(itemList) {
//      this.items = [];
//      for (var i = 0, il = itemList.length; i<il; i++) {
//        item.numVertices = item.vertices.length/3;
//        this.items.push(item);
//      }
//      this.modify();
//    },

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

//    modify: function() {
//      if (!this.items) {
//        return;
//      }
//
//      var
//        item,
//        newVisibilities = [];
//
//      for (var i = 0, il = this.items.length; i<il; i++) {
//        item = this.items[i];
//        Data.applyModifiers(item);
//        for (var j = 0, jl = item.numVertices; j<jl; j++) {
//          newVisibilities.push(item.hidden ? 1 : 0);
//        }
//      }
//
//      this.visibilityBuffer = new glx.Buffer(1, new Float32Array(newVisibilities));
//
//      newVisibilities = null;
//
//      return this;
//    }
//  };
