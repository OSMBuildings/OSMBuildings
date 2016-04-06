### Position a map object

~~~javascript
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
    case 87: obj.elevation += eleInc; break;
    case 83: obj.elevation -= eleInc; break;
    default: return;
  }
  console.log(JSON.stringify({
    position:{
      latitude:parseFloat(obj.position.latitude.toFixed(5)),
      longitude:parseFloat(obj.position.longitude.toFixed(5))
    },
    elevation:parseFloat(obj.elevation.toFixed(2)),
    scale:parseFloat(obj.scale.toFixed(2)),
    rotation:parseInt(obj.rotation, 10)
  }));
});
~~~
