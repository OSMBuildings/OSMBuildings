# OSM Buildings

<img src="http://osmbuildings.org/logo.svg" width="100" height="88"/>

OSM Buildings is a JavaScript library for visualizing OpenStreetMap building geometry on 2D and 3D maps.

**Please note: we are a very small team with little time for the project and limited funds.
You could help us a lot in advancing the project with spreading the word, donations, code contributions and testing.**

The library version in this repository is a WebGL only variant of OSM Buildings.
At some point it will fully integrate the Classic 2.5D version.

[Example](http://osmbuildings.org/gl/?lat=40.70614&lon=-74.01039&zoom=17.00&rotation=0&tilt=40)

For the latest information about the project [follow us on Twitter](https://twitter.com/osmbuildings), read [our blog](http://blog.osmbuildings.org), or just mail us at mail@osmbuildings.org.

**Not sure which version to use?**

## Classic 2.5D

Source: https://github.com/kekscom/osmbuildings

Best for:
- great device compatibility
- good performance on older hardware
- shadow simulation
- full integration with Leaflet or OpenLayers 2

## Modern 3D

Best for:
- great performance on modern graphics hardware
- huge amounts of objects
- combining various data sources

This version uses GLMap for any events and layers logic.

## Get the files ##

Checking in built versions causes a lot of trouble during development. So we decided to use the Github release system instead.

Just pick the latest version from here: https://github.com/OSMBuildings/OSMBuildings/releases

## Documentation

All geo coordinates are in EPSG:4326.

### Quick integration

Link all required libraries in your HTML head section. Files are provided in folder `/dist`.

~~~ html
<head>
  <link rel="stylesheet" href="OSMBuildings/OSMBuildings.css">
  <script src="OSMBuildings/OSMBuildings.js"></script>
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


// add OSM Buildings to the map and let it load data tiles.

  var osmb = new OSMBuildings({
    minZoom: 15,
    maxZoom: 22
  }).addTo(map);

  osmb.addMapTiles(
    'https://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png',
    {
      attribution: '© Data <a href="http://openstreetmap.org/copyright/">OpenStreetMap</a> · © Map <a href="http://mapbox.com">MapBox</a>'
    }
  );

  osmb.addGeoJSONTiles('http://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
~~~

### GLMap Options

option | value | description
--- | --- | ---
position | object | geo position of map center
zoom | float | map zoom
rotation | float | map rotation
tilt | float | map tilt
bend | float | map bend
disabled | boolean | disables user input, default false
minZoom | float | minimum allowed zoom
maxZoom | float | maximum allowed zoom
bounds | object | n, e, s, w coordinates of bounds where the map can be moved within
attribution | string | attribution, optional
state | boolean | stores map position/rotation in url, default false


### GLMap methods

method | parameters | description
--- | --- | ---
on | type, function | add an event listener, types are: change, resize, pointerdown, pointermove, pointerup
off | type, fn | remove event listener
setDisabled | boolean | disables any user input
isDisabled | | check wheether user input is disabled
getBounds | | returns coordinates of current map view, respects tilt and rotation but ignores perspective
setZoom | float | sets current zoom
getZoom | | gets current zoom
setPosition | object | sets current geo position of map center
getPosition | | gets current geo position of map center
setSize | object | {width,height} sets current map size in pixels
getSize |  | gets current map size in pixels
setRotation | float | sets current rotation
getRotation | | gets current rotation
setTilt | float | sets current tilt
getTilt | | gets current tilt


### OSM Buildings options

option | value | description
--- | --- | ---
baseURL | string | for locating assets, this is relative to calling page
minZoom | float | minimum allowed zoom
maxZoom | float | maximum allowed zoom
attribution | string | attribution, optional
showBackfaces | boolean | render front and backsides of polygons. false increases performance, true might be needed for bad geometries, default false
fogColor | string | color to be used for sky gradients and distance fog.
backgroundColor | string | overall background color
fastMode | boolean | enables faster rendering at cost of image quality, consider also removing any effects
effects | date | date for shadow calculation
project | latitude, longitude, elevation | transforms a geo coordinate + elevation to screen position
unproject | x, y | transforms a screen position into a geo coordinate with elevation 0


### OSM Buildings methods

method | parameters | description
--- | --- | ---
addTo | map | adds it as a layer to a GLMap instance
addOBJ | url, position, options | adds an OBJ file, specify a geo position and options {scale, rotation, elevation, id, color}
addGeoJSON | url, options | add a GeoJSON file or object and specify options {scale, rotation, elevation, id, color, modifier}. modifier(id, properties) allows to manipulate feature properties once
addGeoJSONTiles | url, options | add a GeoJSON tile set and specify options {bounds, scale, rotation, elevation, id, color, modifier}. modifier(id, properties) allows to manipulate feature properties once
addTileLayer | url, options | add a map tile set and specify options {bounds}
getTarget | x, y, function | get a building id at position. You need to provide a callback function do receive the data.
highlight | id, color | highlight a given building by id, this can only be one, set color = null in order to un-highlight
show | function, duration | shows buildings according to a selector function. That function receives parameters id, data of an item
hide | function, duration | hides buildings according to a selector function. That function receives parameters id, data of an item
screenshot | function | creates a screenshot from current view and returns it as data url. You need to provide a callback function do receive the data.
setDate | date | sets a date for shadow calculations


### OSM Buildings server

There is also documentation of OSM Buildings Server side. See https://github.com/OSMBuildings/OSMBuildings/blob/master/docs/server.md


## Examples
- [Moving Label](examples/moving_label.md)
- [Highlight Buildings](examples/highlight_buildings.md)
- [Map Control Buttons](examples/map_control_buttons.md)
- [Adding arbitrary GeoJSON](examples/geojson.md)
- [Position A Map Object](examples/position_a_map_object.md)

# Contributing
We are happy to receive pull requests and issues

## Development environment
Here's how to get your development environment set up:

1. Clone the repo (`git clone git@github.com:OSMBuildings/OSMBuildings.git`)
1. Install dependencies with `npm install`
1. After making changes, you can try them out by running `grunt`, which will output a `dist/OSMBuildings/OSMBuildings.debug.js` file that you can include like normal
