### Fetch building details

~~~ javascript
osmb.on('pointerdown', e => {
  osmb.getTarget(e.x, e.y, feature => {
    if (feature) {
      // fetch URL http://overpass-api.de/api/interpreter?data=[out:json];(way(feature.id);node(w));out;
    }
  });
});
~~~
