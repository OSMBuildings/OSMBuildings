<link rel="stylesheet" href="https://raw.githubusercontent.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.css">
<link rel=stylesheet href=assets/tutorial_prep.css>
<script src=https://rawgit.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.js></script>

<div id='map'></div>
<div id="label">Label</div>

<script src=assets/tutorial_prep.js></script>

<style>
  #label {
    width:10px;
    height:10px;
    position:absolute;
    z-Index:10;
    border:3px solid red;
  }
</style>

<script>
  map.setPosition({latitude: 52.52, longitude: 13.37});
  
  var label = document.getElementById('label');
  map.on('change', function() {
    var pos = osmb.project(52.52, 13.37, 50);
    label.style.left = Math.round(pos.x) + 'px';
    label.style.top = Math.round(pos.y) + 'px';
  });
</script>

### Moving label

This label moves virtually in space.

````xml
<div id="label">Label</div>
````

````css
#label {
  width:100px;
  height:10px;
  position:absolute;
  z-Index:10;
  border:3px solid red;
}
````

````javascript
var label = document.getElementById('label');
map.on('change', function() {
  var pos = osmb.project(52.52, 13.37, 50);
  label.style.left = Math.round(pos.x) + 'px';
  label.style.top = Math.round(pos.y) + 'px';
});
````
