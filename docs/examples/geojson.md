### Add GeoJSON

~~~ javascript
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
~~~
