
var Data = {

  items: [],
  modifiers: [],

  add: function(item) {
    this.items.push(item);
  },

  remove: function(item) {
    var items = this.items;
    for (var i = 0, il = items.length; i < il; i++) {
      if (items[i] === item) {
        items.splice(i, 1);
        return;
      }
    }
  },

  destroy: function() {
    this.items = null;
  },

  addModifier: function(fn) {
    this.modifiers.push(fn);
    this.triggerModification();
//  Events.emit('modify');
  },

  removeModifier: function(fn) {
    for (var i = 0; i < this.modifiers.length; i++) {
      if (this.modifiers[i] === fn) {
        this.modifiers.splice(i, 1);
        break;
      }
    }
    this.triggerModification();
//  Events.emit('modify');
  },

  triggerModification: function(fn) {
    var items = this.items;
    for (var i = 0, il = items.length; i < il; i++) {
      items[i].modify();
//    Events.on('modify', modify...);
    }
  },

  applyModifiers: function(item) {
    var clonedItem = Object.create(item);
    var modifiers = this.modifiers;
    for (var i = 0, il = modifiers.length, j, jl; i < il; i++) {
      modifiers[i](clonedItem);
    }
    return clonedItem;
  }
};
