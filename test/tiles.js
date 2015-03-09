
var tileSize = 256;
var zoom = 16;
var srcFile = 'buildings-with-props.geojson';
var dstPath = 'tiles/';

//*****************************************************************************

var worldSize = tileSize <<zoom;
var tiles = {};
var properties = {};

//*****************************************************************************

function getTileBBox(polygon) {
  var
    minLon =  Infinity,
    maxLon = -Infinity,
    minLat =  Infinity,
    maxLat = -Infinity;

  for (var i = 0, il = polygon.length; i < il; i++) {
    minLon = Math.min(minLon, polygon[i][0]);
    maxLon = Math.max(maxLon, polygon[i][0]);
    minLat = Math.min(minLat, polygon[i][1]);
    maxLat = Math.max(maxLat, polygon[i][1]);
  }

  var minXY = project(maxLat, maxLon, worldSize);
  var maxXY = project(minLat, minLon, worldSize);

  return {
    minX: minXY.x/tileSize <<0,
    minY: minXY.y/tileSize <<0,
    maxX: Math.ceil(maxXY.x/tileSize),
    maxY: maxXY.y/tileSize <<0
  };
}

function addToTiles(feature, tileBBox) {
  var x, y, key;

  for (y = tileBBox.minY; y <= tileBBox.maxY; y++) {
    for (x = tileBBox.minX; x <= tileBBox.maxX; x++) {
      key = [x, y, zoom].join(',');
      if (!tiles[key]) {
        tiles[key] = {
          type: 'FeatureCollection',
          features: []
        };
      }
      tiles[key].features.push(feature);
    }
  }
}

function project(latitude, longitude, worldSize) {
  var
    x = longitude/360 + 0.5,
    y = Math.min(1, Math.max(0, 0.5 - (Math.log(Math.tan((Math.PI/4) + (Math.PI/2)*latitude/180)) / Math.PI) / 2));

  return { x: x*worldSize, y: y*worldSize };
}

//*****************************************************************************

var fs = require('fs');
var str = fs.readFileSync(srcFile, 'utf8');

var geojson = JSON.parse(str);

console.log('processing '+ geojson.features.length +' features...');

var feature, tileBBox, p;
for (var i = 0, il = geojson.features.length; i < il; i++) {
  feature = geojson.features[i];

  tileBBox = getTileBBox(feature.geometry.coordinates[0]);
  addToTiles(feature, tileBBox);

  for (var p in feature.properties) {
    properties[p] = properties[p] || 0;
    properties[p]++;
  }
}

for (var key in tiles) {
  console.log('writing tile '+ key + '.json, '+ tiles[key].features.length +' features');
  fs.writeFileSync(dstPath + key + '.json', JSON.stringify(tiles[key]));
}

console.log('used properties:');

for (var p in properties) {
  console.log(p +': '+ properties[p]);
}

console.log('Done.');
