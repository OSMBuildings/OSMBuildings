### Highlight buildings

````javascript
map.on('pointermove', function(e) {
  var id = osmb.getTarget(e.x, e.y, function(id) {
    if (id) {
      osmb.highlight(id, '#f08000');
    } else {
      osmb.highlight(null);
    }
  });
});
````
