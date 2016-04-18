### Fetch building details

````javascript
map.on('pointerdown', function(e) {
  var id = osmb.getTarget(e.x, e.y, function(id) {
    if (id) {
      // fetch URL http://overpass-api.de/api/interpreter?data=[out:json];(relation(id);way(r);node(w);way(id);way(23853131);node(w));out;
    }
  });
});
````
