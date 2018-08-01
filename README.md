# <img src="http://osmbuildings.org/logo.svg" width="100" height="88"/> OSM Buildings

OSM Buildings is a library for visualizing 3d building geometry.

<img src='http://i.imgur.com/pxh2Cpt.png' width='100%' />

- [Documentation](https://osmbuildings.org/documentation/)
- [Example](http://osmbuildings.org)

### Quick integration

Link all required libraries in your HTML head section. Files are provided in folder `/dist`.

````html
<head>
  <link href="https://cdn.osmbuildings.org/4.0.0/OSMBuildings.css" rel="stylesheet">
  <script src="https://cdn.osmbuildings.org/4.0.0/OSMBuildings.js"></script>
</head>

<body>
  <div id="map"></div>
````
In a script section initialize OSM Buildings and add it to a DOM container.

```` javascript
  var osmb = new OSMBuildings({
    container: 'map',
    position: { latitude: 52.52000, longitude: 13.41000 },
    zoom: 16,
    minZoom: 15,
    maxZoom: 22
  });

  osmb.addMapTiles(
    'https://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png',
    {
      attribution: '© Data <a href="http://openstreetmap.org/copyright/">OpenStreetMap</a> · © Map <a href="http://mapbox.com">Mapbox</a>'
    }
  );

  osmb.addGeoJSONTiles('http://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
````

### OSM Buildings server

There is also documentation of OSM Buildings Server side. See https://github.com/OSMBuildings/OSMBuildings/blob/master/docs/server.md
