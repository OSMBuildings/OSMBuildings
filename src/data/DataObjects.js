
// TODO: maybe let grid data sources store their items here

var DataObjects = {

  items: [],

  getVisibleItems: function() {
    var items = [];
    for (var i = 0, il = this.items.length; i < il; i++) {
      // TODO: check visiblity => know the bbox
      items.push(this.items[i]);
    }
    return items;
  },

  load: function(type, url, position) {
    var req = new XMLHttpRequest();

    req.onreadystatechange = function() {
      if (req.readyState !== 4) {
        return;
      }

      if (!req.status || req.status < 200 || req.status > 299) {
        return;
      }

      if (req.responseText) {
        var data;
        switch (type.toLowerCase()) {
          case 'geojson': data = GeoJSON.read(0, 0, 16, JSON.parse(req.responseText)); break;
          case 'obj':     data = OBJ.read(req.responseText); break;
        }

        if (data) {
          this.items.push(new DataItem(data, position));
        }
      }
    }.bind(this);

    req.open('GET', url);
    req.send(null);

    return req;
  }
};
