
var osmb = new OSMBuildings({
  position: { latitude:52.519991, longitude:13.406453 },
  zoom: 15,
  tilt: 30,
  state: false,
  minZoom: 14,
  maxZoom: 20,
  attribution: '© 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'
});

osmb.appendTo('map');

osmb.addMapTiles(
  'https://api.mapbox.com/styles/v1/osmbuildings/cjt9gq35s09051fo7urho3m0f/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYnVpbGRpbmdzIiwiYSI6IjNldU0tNDAifQ.c5EU_3V8b87xO24tuWil0w',
  {
    attribution: '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> · © Map <a href="http://mapbox.com">Mapbox</a>'
  }
);

osmb.addGeoJSONTiles('https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');

//***************************************************************************

osmb.on('pointerup', e => {
  if (e.target) {
    osmb.highlight(e.target.id, '#f08000');
  } else {
    osmb.highlight(null);
  }
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
      osmb['set'+ property](osmb['get'+ property]()+increment);
    }
  });
}