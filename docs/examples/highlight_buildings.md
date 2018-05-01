### Highlight buildings

~~~ javascript
osmb.on('pointerup', e => {
  if (e.target) {
    osmb.highlight(e.target.id, '#f08000');
  } else {
    osmb.highlight(null);
  }
});
~~~
