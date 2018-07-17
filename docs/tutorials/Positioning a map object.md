<link rel="stylesheet" href="https://raw.githubusercontent.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.css">
<link rel=stylesheet href=assets/tutorial_prep.css>
<script src=https://rawgit.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.js></script>

<div id='map'></div>

<script src=assets/tutorial_prep.js></script>

<script>
  osmb.setPosition({latitude: 52.52000, longitude: 13.37000});

  var geojson = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {
        color: '#ff0000',
        roofColor: '#cc0000',
        height: 50,
        minHeight: 0
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [13.37000, 52.52000],
            [13.37010, 52.52000],
            [13.37010, 52.52010],
            [13.37000, 52.52010],
            [13.37000, 52.52000]
          ]
        ]
      }
    }]
  };
  var obj = osmb.addGeoJSON(geojson);

  /*
   * ## Key codes for object positioning ##
   * Cursor keys: move
   * +/- : scale
   * w/s : elevate
   * a/d : rotate
   *
   * Pressing Alt the same time accelerates
   */
  document.addEventListener('keydown', function(e) {
    var transInc = e.altKey ? 0.0002 : 0.00002;
    var scaleInc = e.altKey ? 0.1 : 0.01;
    var rotaInc = e.altKey ? 10 : 1;
    var eleInc = e.altKey ? 10 : 1;

    switch (e.which) {
      case 37: obj.position.longitude -= transInc; break;
      case 39: obj.position.longitude += transInc; break;
      case 38: obj.position.latitude += transInc; break;
      case 40: obj.position.latitude -= transInc; break;
      case 187: obj.scale += scaleInc; break;
      case 189: obj.scale -= scaleInc; break;
      case 65: obj.rotation += rotaInc; break;
      case 68: obj.rotation -= rotaInc; break;
      case 87: obj.altitude += eleInc; break;
      case 83: obj.altitude -= eleInc; break;
      default: return;
    }
    console.log(JSON.stringify({
      position: {
        latitude: parseFloat(obj.position.latitude.toFixed(5)),
        longitude: parseFloat(obj.position.longitude.toFixed(5))
      },
      altitude: parseFloat(obj.altitude.toFixed(2)),
      scale: parseFloat(obj.scale.toFixed(2)),
      rotation: parseInt(obj.rotation, 10)
    }));
  });
</script>

### Position a map object

````javascript
var obj = osmb.addGeoJSON(geojson);

/*
 * ## Key codes for object positioning ##
 * Cursor keys: move
 * +/- : scale
 * w/s : elevate
 * a/d : rotate
 *
 * Pressing Alt the same time accelerates
 */
document.addEventListener('keydown', function(e) {
  var transInc = e.altKey ? 0.0002 : 0.00002;
  var scaleInc = e.altKey ? 0.1 : 0.01;
  var rotaInc = e.altKey ? 10 : 1;
  var eleInc = e.altKey ? 10 : 1;

  switch (e.which) {
    case 37: obj.position.longitude -= transInc; break;
    case 39: obj.position.longitude += transInc; break;
    case 38: obj.position.latitude += transInc; break;
    case 40: obj.position.latitude -= transInc; break;
    case 187: obj.scale += scaleInc; break;
    case 189: obj.scale -= scaleInc; break;
    case 65: obj.rotation += rotaInc; break;
    case 68: obj.rotation -= rotaInc; break;
    case 87: obj.altitude += eleInc; break;
    case 83: obj.altitude -= eleInc; break;
    default: return;
  }
  console.log(JSON.stringify({
    position:{
      latitude: parseFloat(obj.position.latitude.toFixed(5)),
      longitude: parseFloat(obj.position.longitude.toFixed(5))
    },
    altitude: parseFloat(obj.altitude.toFixed(2)),
    scale: parseFloat(obj.scale.toFixed(2)),
    rotation: parseInt(obj.rotation, 10)
  }));
});
````
