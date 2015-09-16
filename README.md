
# OSM Buildings

<img src="http://osmbuildings.org/logo.svg" width="100" height="88"/>

OSM Buildings is a JavaScript library for visualizing OpenStreetMap building geometry on 2D and 3D maps.

The library version in this repository is a WebGL only variant of OSM Buildings.
At some point it will fully integrate the classic 2.5D version.

Example: http://osmbuildings.org/gl/?lat=40.70614&lon=-74.01039&zoom=17.00&rotation=0&tilt=40

Not sure which version to use?

## Classic 2.5D

Source: https://github.com/kekscom/osmbuildings

Best for:
- great device compatibility
- good performance on older hardware
- shadow simulation
- full integration with Leaflet or OpenLayers 2

## Modern 3D

Source: you are here

Best for:
- great performance on modern graphics hardware
- huge amounts of objects
- mixing various data sources

This version uses GLMap for any events and layers logic.


## Documentation

All geo coordinates are in EPSG:4326.

### Quick integration

Link all required libraries in your HTML head section. Files are provided in folder `/dist`.

~~~ html
<head>
  <link rel="stylesheet" href="GLMap/GLMap.css">
  <script src="GLMap/GLMap.js"></script>
  <script src="OSMBuildings/OSMBuildings-GLMap.js"></script>
</head>

<body>
  <div id="map"></div>
~~~

In a script section initialize the map and add a map tile layer.

~~~ javascript
  var map = new GLMap('map', {
    position: { latitude:52.52000, longitude:13.41000 },
    zoom: 16
  });

  new GLMap.TileLayer('http://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png').addTo(map);
~~~

Add OSM Buildings to the map and let it load data tiles.

~~~ javascript
  var osmb = new OSMBuildings().addTo(map);
  osmb.addGeoJSONTiles('http://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
~~~

### GLMap Options

This is just a brief overview. For more information see <a href="https://github.com/OSMBuildings/GLMap">https://github.com/OSMBuildings/GLMap</a>

~~~
position: { latitude:52.52000, longitude:13.41000 },
zoom: 16,
rotation: 0,
tilt: 0,
disabled: true, // disables user input
minZoom: 12,
maxZoom: 20,
attribution: 'GLMap',
state: true // stores map position/rotation in url
~~~

### GLMap Methods

~~~
  on | type, function | add an event listener, types are: change, resize, pointerdown, pointermove, pointerup 
  off | type, fn | remove event listener
  setDisabled | boolean | disables any user input
  isDisabled | | check wheether user input is disabled
  project | latitude, longitude, worldSize | transforms geo coordinates to world pixel coordinates (tile size << zoom)
  unproject | x, y, worldSize | transforms world (tile size << zoom) pixel coordinates to geo coordinates (EPSG:4326)
  transform | latitude, longitude, elevation | transforms a geo coordinate + elevation to screen position
  getBounds | | returns geocordinates of current map view, respects tilt and rotation but ignores perspective
  setZoom | float | sets current zoom
  getZoom | | gets current zoom
  getPosition | sets current geo position of map center
  setPosition | | | sets current geo position of map center
  getSize | | | gets current map size in pixels
  setSize | sets current map size in pixels
  setRotation | | sets current rotation
  getRotation | | sets current rotation
  setTilt | | sets current tilt
  getTilt | | sets current tilt
~~~



### Extras

