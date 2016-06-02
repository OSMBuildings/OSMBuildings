### Fetch building details

~~~ javascript
osmb.on('pointerdown', function(e) {
  osmb.getTarget(e.detail.x, e.detail.y, function(id) {
    if (id) {
      // fetch URL http://overpass-api.de/api/interpreter?data=[out:json];(relation(id);way(r);node(w);way(id);way(23853131);node(w));out;
    }
  });
});
~~~
