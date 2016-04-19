<link rel="stylesheet" href="assets/OSMBuildings/OSMBuildings.css">
<link rel=stylesheet href=assets/tutorial_prep.css>
<script src=assets/OSMBuildings/OSMBuildings.js></script>

<div id='map'></div>

<script src=assets/tutorial_prep.js></script>

<script>
  map.setPosition({latitude: 52.519991, longitude: 13.406453});
  map.setTilt(30);
  map.setZoom(19);
  osmb.addOBJ('./assets/models/sphere.obj', { latitude: 52.519991, longitude: 13.406453 }, { id: "my_object_1", color: 'red'});
</script>

You can display custom 3D models in the map environment, with the following:

````javascript
osmb.addOBJ('sphere.obj', { latitude: 52.519991, longitude: 13.406453 }, { id: "my_object_1", color: 'red'});
````
