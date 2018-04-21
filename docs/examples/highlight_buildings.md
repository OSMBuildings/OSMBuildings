### Highlight buildings

~~~ javascript
osmb.on('pointermove', e => {
  osmb.getTarget(e.x, e.y, feature => {
    if (feature) {
      osmb.highlight(feature.id, '#f08000');
    } else {
      osmb.highlight(null);
    }
  });
});
~~~
