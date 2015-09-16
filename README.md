
<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIHN0cm9rZT0iZ3JlZW4iIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ieWVsbG93Ii8+PC9zdmc+"/>

<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow"/></svg>

<img src="http://osmbuildings.org/logo.svg" width="100" height="88">

OSM Buildings is a JavaScript library for visualizing OpenStreetMap building geometry on 2D and 3D maps.

This version is using a custom WebGL base map for any event and tile logic.

Example: [http://osmbuildings.org/gl/](http://osmbuildings.org/gl/?lat=40.70614&lon=-74.01039&zoom=17.00&rotation=0&tilt=40)

It is the very first public version of OSM Buildings using a WebGL renderer.

There are many known issues, performance bottlenecks and missing features.
I'm trying hard to achieve the best but always lacking time and other resources.

If you're willing to support, I'm grateful for any contribution.
Thank you very much.

=> mail@osmbuildings.org

There is also documentation of OSM Buildings Server side:
https://github.com/OSMBuildings/OSMBuildings/blob/master/docs/server.md







**Example** http://osmbuildings.org/gl

**For the new WebGL version, check out https://github.com/OSMBuildings/OSMBuildings
All versions will eventually land over there.**


## Deprecated methods and their replacements

  - `loadData()` => `load()`
  - `setData()` => `data()`
  - `setStyle()` => `style()`
  - `setDate()` => `date()`
  - `screenshot()` => no replacement
  - `getDetails()` => no replacement

**Example** http://osmbuildings.org/

It's safe use the [master branch](https://github.com/kekscom/osmbuildings/tree/master/dist/) for production.

For further information visit http://osmbuildings.org, follow [@osmbuildings](https://twitter.com/osmbuildings/) on Twitter or report issues [here on Github](https://github.com/kekscom/osmbuildings/issues/).


## Documentation

### Integration with Leaflet

Link Leaflet and OSM Buildings files in your HTML head section.

~~~ html
<head>
  <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css">
  <script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
  <script src="OSMBuildings-Leaflet.js"></script>
</head>
~~~

Initialize the map engine and add a map tile layer.<br>
Position is set to Berlin at zoom level 17, I'm using MapBox tiles here.

~~~ javascript
var map = new L.Map('map').setView([52.52020, 13.37570], 17);
new L.TileLayer('http://{s}.tiles.mapbox.com/v3/<YOUR KEY HERE>/{z}/{x}/{y}.png',
  { attribution: 'Map tiles &copy; <a href="http://mapbox.com">MapBox</a>', maxZoom: 17 }).addTo(map);
~~~

Add the buildings layer.

~~~ javascript
new OSMBuildings(map).load();
~~~

As a popular alternative, you could pass a <a href="http://www.geojson.org/geojson-spec.html">GeoJSON</a> FeatureCollection object.<br>
Geometry types Polygon, Multipolygon and GeometryCollection are supported.<br>
Make sure the building coordinates are projected in <a href="http://spatialreference.org/ref/epsg/4326/">EPSG:4326</a>.<br>
Height units m, ft, yd, mi are accepted, no given unit defaults to meters.

~~~ javascript
var geoJSON = {
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "id": 134,
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [13.37356, 52.52064],
        [13.37350, 52.51971],
        [13.37664, 52.51973],
        [13.37594, 52.52062],
        [13.37356, 52.52064]
      ]]
    },
    "properties": {
      "wallColor": "rgb(255,0,0)",
      "roofColor": "rgb(255,128,0)",
      "height": 500,
      "minHeight": 0
    }
  }]
};

new OSMBuildings(map).set(geoJSON);
~~~


### Integration with OpenLayers

Link OpenLayers and OSM Buildings files in your HTML head section.

~~~ html
<head>
  <script src="http://www.openlayers.org/api/OpenLayers.js"></script>
  <script src="OSMBuildings-OpenLayers.js"></script>
</head>
~~~

Initialize the map engine and add a map tile layer.<br>
Position is set to Berlin at zoom level 17.

~~~ javascript
var map = new OpenLayers.Map('map');
map.addControl(new OpenLayers.Control.LayerSwitcher());

var osm = new OpenLayers.Layer.OSM();
map.addLayer(osm);

map.setCenter(
  new OpenLayers.LonLat(13.37570, 52.52020)
    .transform(
      new OpenLayers.Projection('EPSG:4326'),
      map.getProjectionObject()
    ),
  17
);
~~~

Add the buildings layer.

~~~ javascript
new OSMBuildings(map).load();
~~~


## API

### Constructors

<table>
<tr>
<th>Constructor</th>
<th>Description</th>
</tr>

<tr>
<td>new OSMBuildings(map)</td>
<td>Initializes the buildings layer for a given map engine.<br>
Currently Leaflet and OpenLayers are supported.</td>
</tr>
</table>

Constants

<table>
<tr>
<th>Option</th>
<th>Type</th>
<th>Description</th>
</tr>

<tr>
<td>ATTRIBUTION</td>
<td>String</td>
<td>Holds OSM Buildings copyright information.</td>
</tr>

<tr>
<td>VERSION</td>
<td>String</td>
<td>Holds current version information.</td>
</tr>
</table>

Methods

<table>
<tr>
<th>Method</th>
<th>Description</th>
</tr>

<tr>
<td>style({Object})</td>
<td>Set default styles. See below for details.</td>
</tr>

<tr>
<td>date(new Date(2015, 15, 1, 10, 30)))</td>
<td>Set date/time for shadow projection.</td>
</tr>

<tr>
<td>each({Function})</td>
<td>A callback wrapper to override each feature's properties on read. Return false in order to skip a particular feature.<br>
Callback receives a feature object as argument.</td>
</tr>

<tr>
<td>click({Function})</td>
<td>A callback wrapper to handle click events on features.<br>
Callback receives an object { featureId{number,string}, lat{float}, lon{float} } as argument.</td>
</tr>

<tr>
<td>set({GeoJSON FeatureCollection})</td>
<td>Just add GeoJSON data to your map.</td>
</tr>

<tr>
<td>load({Provider})</td>
<td>Without parameter, it loads OpenStreetMap data tiles via an OSM Buildings proxy. This proxy enables transparent data filtering and caching.
Interface of such provider is to be published.</td>
</tr>
</table>

Styles

<table>
<tr>
<th>Option</th>
<th>Type</th>
<th>Description</th>
</tr>

<tr>
<td>color/wallColor</td>
<td>String</td>
<td>Defines the objects default primary color. I.e. #ffcc00, rgb(255,200,200), rgba(255,200,200,0.9)</td>
</tr>

<tr>
<td>roofColor</td>
<td>String</td>
<td>Defines the objects default roof color.</td>
</tr>

<tr>
<td>shadows</td>
<td>Boolean</td>
<td>Enables or disables shadow rendering, default: enabled</td>
</tr>
</table>
