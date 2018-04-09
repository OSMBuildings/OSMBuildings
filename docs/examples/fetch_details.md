### Fetch building details

~~~ javascript
osmb.on('pointerdown', e => {
  osmb.getTarget(e.x, e.y, id => {
    if (id) {
      // fetch URL http://overpass-api.de/api/interpreter?data=[out:json];(relation(id);way(r);node(w);way(id);way(23853131);node(w));out;
    }
  });
});
~~~
