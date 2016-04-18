### Calculate bounding box on screen for a feature

````javascript
var METERS_PER_LEVEL = 3;
var DEFAULT_HEIGHT = 10;

function getBoundingBox(osmb, feature) {
    var bounds = {
      left: Infinity,
      top: Infinity,
      right: -Infinity,
      bottom: -Infinity
    };
    var pos;
    var height = feature.properties.height || 
        (feature.properties.levels ? feature.properties.levels*METERS_PER_LEVEL : DEFAULT_HEIGHT);
    for (var coord of feature.geometry.coordinates[0]) {
      for (var lat=0; lat <= height; lat += height) {
          pos = osmb.project(coord[1], coord[0], lat);
          if (pos.x < bounds.left) {
            bounds.left = pos.x;
          } else if (pos.x > bounds.right) {
            bounds.right = pos.x;
          }
          if (pos.y < bounds.top) {
            bounds.top = pos.y;
          } else if (pos.y > bounds.bottom) {
            bounds.bottom = pos.y;
          }
      }
    }
    return bounds;
}
````
