### Highlight buildings

~~~ javascript
osmb.on('pointermove', function(e) {
  osmb.getTarget(e.detail.x, e.detail.y, function(id) {
    if (id) {
      osmb.highlight(id, '#f08000');
    } else {
      osmb.highlight(null);
    }
  });
});
~~~
