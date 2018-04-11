<link rel="stylesheet" href="https://raw.githubusercontent.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.css">
<link rel=stylesheet href=assets/tutorial_prep.css>
<script src=https://rawgit.com/OSMBuildings/OSMBuildings/master/dist/OSMBuildings/OSMBuildings.js></script>

<div id='map'></div>

<script src=assets/tutorial_prep.js></script>

<script>
var HIGHLIGHT_COLOR = '#f08000';
var buildings = {};
var selected = {};

function isHighlighted(id) {
  return (id in selected);
}

// Store the buildings as they are loaded for later use
osmb.on('loadfeature', e => {
    var b = e;
    if (b.id.indexOf('highlight_') === -1) {
      var id = b.properties.relationId || b.id || b.properties.id;
      b.properties.color = HIGHLIGHT_COLOR;
      b.properties.roofColor = HIGHLIGHT_COLOR;
      b.properties.relationId = '';
      b.id = 'highlight_' + b.id;
      if (id in buildings) {
        buildings[id].push(b);
      } else {
        buildings[id] = [b];
      }
    }
});

var geojsonHighlight;
function highlightBuildings(buildingsByID) {
    // Clear previous highlight
    if (geojsonHighlight) {
        osmb.show(isHighlighted);
        geojsonHighlight.destroy();
    }
    // Add any new selections
    if (buildingsByID) {
        var geojson = {
            id: 'highlighted',
            type: 'FeatureCollection',
            features: []
        };
        for (var id in buildingsByID) {
            geojson.features.push.apply(geojson.features, buildingsByID[id]);
        }
        // Add your own "highlighted" copies
        geojsonHighlight = osmb.addGeoJSON(geojson);
        // Hide the original buildings
        osmb.hide(isHighlighted);
    }
}

var shiftDown = false;
function trackShift(e) {
    shiftDown = e.shiftKey
}
document.addEventListener('keyup', trackShift);
document.addEventListener('keydown', trackShift);

function buildingSelected(id) {
   if (id) {
      // If shift not depressed, start a new selection
      if (!shiftDown) {
        highlightBuildings(null);
        selected = {};
      }
      selected[id] = buildings[id];
      highlightBuildings(selected);
    } else {
      highlightBuildings(null);
      selected = {};
    } 
}

var mousePos;
map.on('pointerdown', e => {
  mousePos = {x: e.x, y: e.y};
});

map.on('pointerup', e => {
  if (e.x === mousePos.x && e.y === mousePos.y) {
    // Add highlight if this wasn't a map drag/pan
    osmb.getTarget(e.x, e.y, buildingSelected);
  }
});
</script>

This code demonstrates highlight of multiple buildings. Hold down shift as you click on additional buildings to add them to the selection.

_Note: this is a workaround until multiple highlight support is a builtin feature; this method is not nearly as efficient as the highlight-by-color- picking method used in the single-highlight hover example._

````javascript
var HIGHLIGHT_COLOR = '#f08000';
var buildings = {};
var selected = {};

function isHighlighted(id) {
  return (id in selected);
}

// Store the buildings as they are loaded for later use
osmb.on('loadfeature', e => {
    var b = e;
    if (b.id.indexOf('highlight_') === -1) {
      var id = b.properties.relationId || b.id || b.properties.id;
      b.properties.color = HIGHLIGHT_COLOR;
      b.properties.roofColor = HIGHLIGHT_COLOR;
      b.properties.relationId = '';
      b.id = 'highlight_' + b.id;
      if (id in buildings) {
        buildings[id].push(b);
      } else {
        buildings[id] = [b];
      }
    }
});

var geojsonHighlight;
function highlightBuildings(buildingsByID) {
    // Clear previous highlight
    if (geojsonHighlight) {
        osmb.show(isHighlighted);
        geojsonHighlight.destroy();
    }
    // Add any new selections
    if (buildingsByID) {
        var geojson = {
            id: 'highlighted',
            type: 'FeatureCollection',
            features: []
        };
        for (var id in buildingsByID) {
            geojson.features.push.apply(geojson.features, buildingsByID[id]);
        }
        // Add your own "highlighted" copies
        geojsonHighlight = osmb.addGeoJSON(geojson);
        // Hide the original buildings
        osmb.hide(isHighlighted);
    }
}

var shiftDown = false;
function trackShift(e) {
    shiftDown = e.shiftKey
}
document.addEventListener('keyup', trackShift);
document.addEventListener('keydown', trackShift);

function buildingSelected(id) {
   if (id) {
      // If shift not depressed, start a new selection
      if (!shiftDown) {
        highlightBuildings(null);
        selected = {};
      }
      selected[id] = buildings[id];
      highlightBuildings(selected);
    } else {
      highlightBuildings(null);
      selected = {};
    } 
}

var mousePos;
map.on('pointerdown', e => {
  mousePos = {x: e.x, y: e.y};
});

map.on('pointerup', e => {
  if (e.x === mousePos.x && e.y === mousePos.y) {
    // Add highlight if this wasn't a map drag/pan
    osmb.getTarget(e.x, e.y, buildingSelected);
  }
});
  
````
