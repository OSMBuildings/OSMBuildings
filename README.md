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

Option | Type | Default | Description
------ | ----- | ------- | -----------
`position` | Object | { latitude: 52.520000, longitude: 13.410000 } | Geo position of map center
`zoom` | Float | minZoom | Initial map zoom
`rotation` | Float | 0 | Map rotation
`tilt` | Float | 0 | Map tilt
`bend` | Float | 0 | Map bend
`disabled` | Boolean | false | Disables user input
`minZoom` | Float | 10 | Minimum allowed zoom
`maxZoom` | Float | 20 | Maximum allowed zoom
`bounds` | Object | {} | Coordinates of bounds where the map can be moved within **Doesn't currently work**
`attribution` | String | null | Attribution, optional
`state` | Boolean | false | Stores map position/rotation in url


### GLMap methods

Method | Parameters | Description
------ | ---------- | -----------
`on` | (String) event, (Function) callback | Listen for a [map event](#map-events)
`off` | (String) event, (Function) callback | Removes all event listeners for the given event. If callback is given, it only returns that function
`setDisabled` | (Boolean) flag | Disables any user input (if flag is `true`, enables user input)
`isDisabled` | | Check whether user input is disabled
`getBounds` | | Returns coordinates of current map view, respecting tilt and rotation but ignoring `perspective`
`setZoom` | (Float) zoom_level | Sets current zoom
`getZoom` | | Gets current zoom
`setPosition` | (Object) {latitude, longitude} | Sets current geo position of map center
`getPosition` | | Gets current geo position of map center
`setSize` | (Object) {width, height} | Sets current map size in pixels
`getSize` |  | Gets current map size in pixels
`setRotation` | (Float) rotation | Sets current rotation
`getRotation` | | Gets current rotation
`setTilt` | (Float) tilt | Sets current tilt
`getTilt` | | Gets current tilt

### Map events

Event | Data | Description
----- | ---- | -----------
`pointerdown` | {x, y, button} | Fired when the user pushes the mouse button on the map
`pointerup` | {x, y, button} | Fired when the user releases the mouse button on the map
`pointermove` | {x, y} | Fired when the user moves the mouse on the map
`contextmenu` | {x, y} | Fired when the user right clicks the map
`doubleclick` | {x, y, button} | Fired when the user double clicks on the map
`mousewheel` | {delta} | Fired when wheel button of a pointing device is rotated
`gesture` | ??? | Fired when the user performs a gesture on a touch screen
`resize` | {width, height} | Fired when the size of the map is changed
`move` | {latitude, longitude} | Fired on any movement of the map view
`zoom` | {zoom} | Fired when the zoom level changes
`rotate` | {rotation} | Fired when the map is rotated

### OSM Buildings options

Option | Type | Default | Description
------ | ---- | ------- | -----------
`baseURL` | String | '.' | For locating assets. This is relative to calling page
`minZoom` | Float | 15 | Minimum allowed zoom
`maxZoom` | Float | 22 | Maximum allowed zoom
`attribution` | String | '`<a href="http://osmbuildings.org">© OSM Buildings</a>`' | Attribution
`showBackfaces` | Boolean | false | Render front and backsides of polygons. false increases performance, true might be needed for bad geometries
`fogColor` | String | '#e8e0d8' | Color to be used for sky gradients and distance fog
`backgroundColor` | String | '#efe8e0' | Overall background color
`fastMode` | Boolean | false | Enables faster rendering at cost of image quality. If performance is an issue, consider also removing effects
`effects` | Array | [] | Which effects to enable. The only effect at the moment is 'shadows'
`style` | Object | { color: 'rgb(220, 210, 200)' } | Sets the default building style

### OSM Buildings methods

Method | Parameters | Description
------ | ---------- | -----------
`on` | (String) event, (Function) callback | Listen for a [buildings event](#map-events)
`off` | (String) event, (Function) callback | Removes all event listeners for the given event. If callback is given, it only returns that function
`addTo` | (GLMap) map | Adds it as a layer to the given map
`addOBJ` | (String) url, (Object) {latitude, longitude}, (Object) {scale, rotation, elevation, id, color} | Adds an OBJ file to the scene
`addGeoJSON` | (String) url, (Object) {scale, rotation, elevation, id, color, modifier} | Add a GeoJSON file or object and specify options. modifier(id, properties) allows to manipulate feature `properties` once
`addGeoJSONTiles` | url, options | Add a GeoJSON tile set and specify options {bounds, scale, rotation, elevation, id, color, modifier}. modifier(id, properties) allows to manipulate `feature` properties once
`addTileLayer` | (String) url, (Object) {bounds} | Add a map tile set and specify options
`getTarget` | (Float) x, (Float) y, (Function) callback | Get a building id at position
`highlight` | (Integer) id, (String) color | Highlight a given building by id, this can only be one, set color = `null` in order to un-highlight
`show` | (Function) selector, (Integer) duration | Shows buildings according to a `selector(id, data)` function
`hide` | (Function) selector, (Integer) duration | Hides buildings according to a `selector(id, data)` function
`screenshot` | (Function) callback | Creates a screenshot from current view and returns it as data url
`setDate` | (Date) date | Sets a date for shadow calculations
`project` | (Object) {latitude, longitude, elevation}| Transforms a geo coordinate + elevation to screen `position`
`unproject` | (Float) x, (Float) y | Transforms a screen position into a geo coordinate with elevation 0

### OSM Buildings events

Payload data is placed in e.detail

Event | Description
----- | -----------
`busy` | Fired when data loading starts
`idle` | Fired when data loading ends
`loadfeature` | Fired when a 3d object has been loaded


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
1. After making changes, you can try them out by running `grunt release`, which will output a `dist/OSMBuildings/OSMBuildings.debug.js` file that you can include like normal
