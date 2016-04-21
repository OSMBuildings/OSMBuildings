<link rel="stylesheet" href="https://raw.githubusercontent.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.css">
<link rel=stylesheet href=assets/tutorial_prep.css>
<script src=https://rawgit.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.js></script>

<div id='map'></div>

<script src=assets/tutorial_prep.js></script>

<script>
  map.setPosition({latitude: 52.52000, longitude: 13.37000});
  
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
  osmb.addGeoJSON(geojson);
</script>

GeoJSON features can be displayed with `addGeoJSON`

````javascript
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
osmb.addGeoJSON(geojson);
````
