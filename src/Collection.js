
// TODO URGENT solve conflict between item existing and item is ready to use

class Collection {

  constructor () {
    this.items = [];
  }

  add (item) {
    this.items.push(item);
  }

  remove (item) {
    this.items = this.items.filter(i => (i !== item));
  }

  forEach (fn) {
    this.items.forEach(fn);
  }

  destroy () {
    this.forEach(item => item.destroy());
    this.items = [];
  }
}
