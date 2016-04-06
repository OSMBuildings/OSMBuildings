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

Option | Value | Description
------ | ----- | -----------
`position` | object | Geo position of map center
`zoom` | float | Map zoom
`rotation` | float | Map rotation
`tilt` | float | Map tilt
`bend` | float | Map bend
`disabled` | boolean | Disables user input, default false
`minZoom` | float | Minimum allowed zoom
`maxZoom` | float | Maximum allowed zoom
`bounds` | {n, s, e, w} | Coordinates of bounds where the map can be moved within *Doesn't currently work*
`attribution` | string | Attribution, optional
`state` | boolean | Stores map position/rotation in url, default false


### GLMap methods

Method | Parameters | Description
------ | ---------- | -----------
`on` | type, function | Listen to a [map event](#map-events)
`off` | type, fn | Remove event listener
`setDisabled` | boolean | Disables any user input
`isDisabled` | | Check whether user input is disabled
`getBounds` | | Returns coordinates of current map view, respects tilt and rotation but ignores `perspective`
`setZoom` | float | Sets current zoom
`getZoom` | | Gets current zoom
`setPosition` | object | Sets current geo position of map center
`getPosition` | | Gets current geo position of map center
`setSize` | {width, height} | Sets current map size in pixels
`getSize` |  | Gets current map size in pixels
`setRotation` | float | Sets current rotation
`getRotation` | | Gets current rotation
`setTilt` | float | Sets current tilt
`getTilt` | | Gets current tilt

### Map events

Event | Description
----- | -----------
`mousedown` | Fired when the user pushes the mouse button on the map
`mouseup` | Fired when the user releases the mouse button on the map
`mousemove` | Fired when the user moves the mouse on the map
`dblclick` | Fired when the user double clicks on the map
`mousewheel` | Fired when wheel button of a pointing device is rotated
`DOMMouseScroll` | Fired when wheel button of a pointing device is rotated
`touchstart` | Fired when the user touches the map on a touch screen
`touchmove` | Fired when a touch point is moved along the map
`touchend` | Fired when the user releases the map on a touch screen
`gesturechange` | ???


### OSM Buildings options

Option | Value | Description
------ | ----- | -----------
`baseURL` | string | For locating assets, this is relative to calling page
`minZoom` | float | Minimum allowed zoom
`maxZoom` | float | Maximum allowed zoom
`attribution` | string | Attribution, optional
showBackfaces | boolean | Render front and backsides of polygons. false increases performance, `true` might be needed for bad geometries, default false
`fogColor` | string | Color to be used for sky gradients and distance fog.
`backgroundColor` | string | Overall background color
fastMode | boolean | Enables faster rendering at cost of image quality, consider also removing `any` effects
`effects` | date | Date for shadow calculation
project | latitude, longitude, elevation | Transforms a geo coordinate + elevation to screen `position`
`unproject` | x, y | Transforms a screen position into a geo coordinate with elevation 0


### OSM Buildings methods

Method | Parameters | Description
------ | ---------- | -----------
`addTo` | map | Adds it as a layer to a GLMap instance
addOBJ | url, position, options | Adds an OBJ file, specify a geo position and options {scale, `rotation`, elevation, id, color}
addGeoJSON | url, options | Add a GeoJSON file or object and specify options {scale, rotation, elevation, id, color, modifier}. modifier(id, properties) allows to manipulate feature `properties` once
addGeoJSONTiles | url, options | Add a GeoJSON tile set and specify options {bounds, scale, rotation, elevation, id, color, modifier}. modifier(id, properties) allows to manipulate `feature` properties once
`addTileLayer` | url, options | Add a map tile set and specify options {bounds}
getTarget | x, y, function | Get a building id at position. You need to provide a callback `function` do receive the data.
highlight | id, color | Highlight a given building by id, this can only be one, set color = `null` in order to un-highlight
show | function, duration | Shows buildings according to a selector function. That function `receives` parameters id, data of an item
hide | function, duration | Hides buildings according to a selector function. That function `receives` parameters id, data of an item
screenshot | function | Creates a screenshot from current view and returns it as data url. You `need` to provide a callback function do receive the data.
`setDate` | date | Sets a date for shadow calculations


### OSM Buildings server

There is also documentation of OSM Buildings Server side. See https://github.com/OSMBuildings/OSMBuildings/blob/master/docs/server.md


## Examples
- [Moving Label](examples/moving_label.md)
- [Highlight Buildings](examples/highlight_buildings.md)
- [Map Control Buttons](examples/map_control_buttons.md)
- [Adding arbitrary GeoJSON](examples/geojson.md)
- [Position A Map Object](examples/position_a_map_object.md)
- [Adding an 3D model, via OBJ](examples/obj.md)

# Contributing
We are happy to receive pull requests and issues

## Development environment
Here's how to get your development environment set up:

1. Clone the repo (`git clone git@github.com:OSMBuildings/OSMBuildings.git`)
1. Install dependencies with `npm install`
1. After making changes, you can try them out by running `grunt`, which will output a `dist/OSMBuildings/OSMBuildings.debug.js` file that you can include like normal
