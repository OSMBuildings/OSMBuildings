
// TODO URGENT Solve conflict between item existing and item is ready to use.

class IconCollection extends Collection {

  get (url, callback) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].url === url) {
        callback(null, this.items[i]);
        return;
      }
    }

    const icon = new Icon(url);
    icon.load(callback);
    // this.add(icon); // already done by icon itself
  }
}
