
// TODO: collision check with bounding cylinders

const DataIndex = {

  items: [],

  add: function (item) {
    this.items.push(item);
  },

  remove: function (item) {
    this.items = this.items.filter(i => (i !== item));
  },

  // forEach: function (fn) {
  //   this.items.forEach(fn);
  // },

  destroy: function () {
    this.items.forEach(item => item.destroy());
    this.items = [];
  }
};
