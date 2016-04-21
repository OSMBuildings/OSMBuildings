var map = new GLMap('map', {
  position: { latitude:52.519991, longitude:13.406453 },
  zoom: 15,
  minZoom: 12,
  maxZoom: 20,
  tilt: 30,
  state: false
});

var osmb = new OSMBuildings({
  baseURL: './OSMBuildings',
  minZoom: 15,
  maxZoom: 22,
  effects: ['shadows'],
  attribution: '© 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'
}).addTo(map);

osmb.addMapTiles(
  'https://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png',
  {
    attribution: '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> · © Map <a href="http://mapbox.com">Mapbox</a>'
  }
);

osmb.addGeoJSONTiles('https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');

//***************************************************************************

map.on('pointermove', function(e) {
  var id = osmb.getTarget(e.x, e.y, function(id) {
    if (id) {
      document.body.style.cursor = 'pointer';
      osmb.highlight(id, '#f08000');
    } else {
      document.body.style.cursor = 'default';
      osmb.highlight(null);
    }
  });
});

//***************************************************************************

var controlButtons = document.querySelectorAll('.control button');

for (var i = 0, il = controlButtons.length; i < il; i++) {
  controlButtons[i].addEventListener('click', function(e) {
    var button = this;
    var parentClassList = button.parentNode.classList;
    var direction = button.classList.contains('inc') ? 1 : -1;
    var increment;
    var property;

    if (parentClassList.contains('tilt')) {
      property = 'Tilt';
      increment = direction*10;
    }
    if (parentClassList.contains('rotation')) {
      property = 'Rotation';
      increment = direction*10;
    }
    if (parentClassList.contains('zoom')) {
      property = 'Zoom';
      increment = direction*1;
    }
    if (property) {
      map['set'+ property](map['get'+ property]()+increment);
    }
  });
}