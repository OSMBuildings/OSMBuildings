### Highlight buildings

~~~ javascript
osmb.on('pointermove', e => {
  if (e.target) {
    osmb.highlight(e.target.id, '#f08000');
  } else {
    osmb.highlight(null);
  }
});
~~~
