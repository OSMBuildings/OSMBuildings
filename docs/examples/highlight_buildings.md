### Highlight buildings

~~~ javascript
osmb.on('pointermove', e => {
  osmb.getTarget(e.x, e.y, id => {
    if (id) {
      osmb.highlight(id, '#f08000');
    } else {
      osmb.highlight(null);
    }
  });
});
~~~
