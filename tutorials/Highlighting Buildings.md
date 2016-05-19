<link rel="stylesheet" href="https://raw.githubusercontent.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.css">
<link rel=stylesheet href=assets/tutorial_prep.css>
<script src=https://rawgit.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.js></script>

<div id='map'></div>

<script src=assets/tutorial_prep.js></script>

<script>
  // NOTE: The highlight functionality is built into the prep code.
</script>

This code will highlight a building on hover.

````javascript
map.on('pointermove', function(e) {
  var id = osmb.getTarget(e.detail.x, e.detail.y, function(id) {
    if (id) {
      osmb.highlight(id, '#f08000');
    } else {
      osmb.highlight(null);
    }
  });
});
````
