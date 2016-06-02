# <img src="http://osmbuildings.org/logo.svg" width="100" height="88"/> OSM Buildings

OSM Buildings is a JavaScript library for visualizing OpenStreetMap building geometry on 2D and 3D maps.

<img src='http://i.imgur.com/pxh2Cpt.png' width='100%' />

- [Documentation](http://osmbuildings.github.io/OSMBuildings)
- [Github](http://github.com/OSMBuildings/OSMBuildings)
- [Example](http://osmbuildings.org)

## Info

The library version in this repository is a WebGL only variant of OSM Buildings.
At some point it will fully integrate the Classic 2.5D version.

For the latest information about the project [follow us on Twitter](https://twitter.com/osmbuildings), read [our blog](http://blog.osmbuildings.org), or just mail us at mail@osmbuildings.org.

### Not sure which version to use?

#### Classic 2.5D

Source: https://github.com/kekscom/osmbuildings

Best for:
- great device compatibility
- good performance on older hardware
- shadow simulation
- full integration with Leaflet or OpenLayers 2

#### Modern 3D

Best for:
- great performance on modern graphics hardware
- huge amounts of objects
- combining various data sources

This version uses GLMap for any events and layers logic.

##### Compatibility

Runs likely on earlier versons than listed below, but this is our baseline for tests.

- Win7: latest Chrome (MSIE11 not running, Firefox TBD)
- Win10: TBD
- OSX: latest Crome, Safari, Firefox
- Linux: TBD
- Android 5.0
- iOS 9.3

## Get the files

Checking in built versions causes a lot of trouble during development. So we decided to use the Github release system instead.

Just pick the latest version from here: https://github.com/OSMBuildings/OSMBuildings/releases

## Documentation

All geo coordinates are in EPSG:4326.

### Quick integration

Link all required libraries in your HTML head section. Files are provided in folder `/dist`.

````html
<head>
  <link rel="stylesheet" href="OSMBuildings/OSMBuildings.css">
  <script src="OSMBuildings/OSMBuildings.js"></script>
</head>

<body>
  <div id="map"></div>
````
In a script section initialize OSM Buildings and add it to a DOM container.

```` javascript
  var osmb = new OSMBuildings({
    position: { latitude:52.52000, longitude:13.41000 },
    zoom: 16,
    minZoom: 15,
    maxZoom: 22
  });

  osmb.appendTo('map');

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

# Contributing
**Please note: We are a very small team with little time for the project and limited funds.
You could help us a lot in advancing the project with spreading the word, donations, code contributions and testing.**
We are happy to receive pull requests and issues

## Development environment
Here's how to get your development environment set up:

1. Clone the repo (`git clone git@github.com:OSMBuildings/OSMBuildings.git`)
1. Install dependencies with `npm install`
1. After making changes, you can try them out by running `grunt release`, which will output a `dist/OSMBuildings/OSMBuildings.debug.js` file that you can include like normal
