var GL, Map;
var WIDTH = 0, HEIGHT = 0;

var OSMBuildingsGL = function(containerId, options) {
  options = options || {};

  var container = document.getElementById(containerId);
  container.classList.add('osmb-container');

  WIDTH = container.offsetWidth;
  HEIGHT = container.offsetHeight;
  GL = new glx.View(container, WIDTH, HEIGHT);

  Renderer.start({
    fogColor: options.fogColor,
    showBackfaces: options.showBackfaces
  });

  Interaction.initShader();
  Map = Adapter.initMap(container, options);

  this.setDisabled(options.disabled);
  if (options.style) {
    this.setStyle(options.style);
  }

  TileGrid.setSource(options.tileSource);
  DataGrid.setSource(options.dataSource, options.dataKey || DATA_KEY);

  if (options.attribution !== null && options.attribution !== false && options.attribution !== '') {
    var attribution = document.createElement('DIV');
    attribution.className = 'osmb-attribution';
    attribution.innerHTML = options.attribution || OSMBuildingsGL.ATTRIBUTION;
    container.appendChild(attribution);
  }
};

OSMBuildingsGL.VERSION = '0.1.8';
OSMBuildingsGL.ATTRIBUTION = '© OSM Buildings (http://osmbuildings.org)';
OSMBuildingsGL.ATTRIBUTION_HTML = '&copy; <a href="http://osmbuildings.org">OSM Buildings</a>';

OSMBuildingsGL.prototype = {

  setStyle: function(style) {
    var color = style.color || style.wallColor;
    if (color) {
      // TODO: move this to Renderer
      DEFAULT_COLOR = Color.parse(color).toRGBA(true);
    }
    return this;
  },

  addOBJ: function(url, position, options) {
    return new mesh.OBJ(url, position, options);
  },

  addGeoJSON: function(url, options) {
    return new mesh.GeoJSON(url, options);
  },

  on: function(type, fn) {
    Events.on(type, fn);
    return this;
  },

  off: function(type, fn) {
    Events.off(type, fn);
    return this;
  },

  setDisabled: function(flag) {
    Map.setDisabled(flag);
    return this;
  },

  isDisabled: function() {
    return Map.isDisabled();
  },

  setZoom: function(zoom) {
    Map.setZoom(zoom);
    return this;
  },

  getZoom: function() {
    return Map.zoom;
  },

  setPosition: function(position) {
    Map.setPosition(position);
    return this;
  },

  getPosition: function() {
    return Map.position;
  },

  getBounds: function() {
    var
      center = Map.center,
      halfWidth  = WIDTH/2,
      halfHeight = HEIGHT/2,
      maxY = center.y + halfHeight,
      minX = center.x - halfWidth,
      minY = center.y - halfHeight,
      maxX = center.x + halfWidth,
      worldSize = TILE_SIZE*Math.pow(2, Map.zoom),
      nw = unproject(minX, minY, worldSize),
      se = unproject(maxX, maxY, worldSize);

    return {
      n: nw.latitude,
      w: nw.longitude,
      s: se.latitude,
      e: se.longitude
    };
  },

  setSize: function(size) {
    if (size.width !== WIDTH || size.height !== HEIGHT) {
      GL.canvas.width = WIDTH = size.width;
      GL.canvas.height = HEIGHT = size.height;
      Events.emit('resize');
    }
    return this;
  },

  getSize: function() {
    return { width: WIDTH, height: HEIGHT };
  },

  setRotation: function(rotation) {
    Map.setRotation(rotation);
    return this;
  },

  getRotation: function() {
    return Map.rotation;
  },

  setTilt: function(tilt) {
    Map.setTilt(tilt);
    return this;
  },

  getTilt: function() {
    return Map.tilt;
  },

  transform: function(latitude, longitude, elevation) {
    var mapCenter = Map.center;
    var pos = project(latitude, longitude, TILE_SIZE*Math.pow(2, Map.zoom));
    return transform(pos.x-mapCenter.x, pos.y-mapCenter.y, elevation);
  },

  highlight: function(id, color) {
    Buildings.highlightColor = color ? id && Color.parse(color).toRGBA(true) : null;
    Buildings.highlightID = id ? Interaction.idToColor(id) : null;
  },

  destroy: function() {
    glx.destroy(GL);
    Renderer.destroy();
    TileGrid.destroy();
    DataGrid.destroy();
  }
};

//*****************************************************************************

if (typeof global.define === 'function') {
  global.define([], OSMBuildingsGL);
} else if (typeof global.exports === 'object') {
  global.module.exports = OSMBuildingsGL;
} else {
  global.OSMBuildingsGL = OSMBuildingsGL;
}



<!DOCTYPE html>
<html>
<head>
  <title>OSM Buildings GL</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }

    #map {
      width: 100%;
      height: 100%;
    }

    .control {
      position: absolute;
      left: 0;
      z-index: 1000;
    }

    .control.tilt {
      top: 0;
    }

    .control.rotation {
      top: 45px;
    }

    .control.zoom {
      top: 90px;
    }

    .control.zoom button{
      font-weight: normal;
    }

    .control button {
      width: 30px;
      height: 30px;
      margin: 15px 0 0 15px;
      border: 1px solid #999999;
      background: #ffffff;
      opacity: 0.6;
      border-radius: 5px;
      box-shadow: 0 0 5px #666666;
      font-weight: bold;
      text-align: center;
    }

    .control button:hover {
      opacity: 1;
      cursor: pointer;
    }
  </style>
  <link rel="stylesheet" href="OSMBuildingsGL.css">
  <script src="loader.js"></script>
</head>

<body>
<div id="map"></div>

<div id="label" style="width:10px;height:10px;position:absolute;z-Index:1000;border:3px solid red;"></div>

<div style="position:absolute;left:100px;top:20px;border:1px solid #ff8888; background:#fff;font-family:sans-serif;padding:10px;font-size:12px;}">Clicks here should not change the map.</div>

<div class="control tilt">
  <button class="dec">&#8601;</button>
  <button class="inc">&#8599;</button>
</div>

<div class="control rotation">
  <button class="inc">&#8630;</button>
  <button class="dec">&#8631;</button>
</div>

<div class="control zoom">
  <button class="dec">-</button>
  <button class="inc">+</button>
</div>

<script>
  /*
   * ## Key codes for object positioning ##
   * Cursor keys: move
   * +/- : scale
   * w/s : elevate
   * a/d : rotate
   *
   * Pressing Alt the same time accelerates
   */
  function positionOnMap(obj) {
    document.addEventListener('keydown', function(e) {
      var transInc = e.altKey ? 0.0002 : 0.00002;
      var scaleInc = e.altKey ? 0.1 : 0.01;
      var rotaInc = e.altKey ? 10 : 1;
      var eleInc = e.altKey ? 10 : 1;

      switch (e.which) {
        case 37: obj.position.longitude -= transInc; break;
        case 39: obj.position.longitude += transInc; break;
        case 38: obj.position.latitude += transInc; break;
        case 40: obj.position.latitude -= transInc; break;
        case 187: obj.scale += scaleInc; break;
        case 189: obj.scale -= scaleInc; break;
        case 65: obj.rotation += rotaInc; break;
        case 68: obj.rotation -= rotaInc; break;
        case 87: obj.elevation += eleInc; break;
        case 83: obj.elevation -= eleInc; break;
        default: return;
      }
      console.log(JSON.stringify({
        position:{
          latitude:parseFloat(obj.position.latitude.toFixed(5)),
          longitude:parseFloat(obj.position.longitude.toFixed(5))
        },
        elevation:parseFloat(obj.elevation.toFixed(2)),
        scale:parseFloat(obj.scale.toFixed(2)),
        rotation:parseInt(obj.rotation, 10)
      }));
    });
  }

  //*************************************************************************

  var map = new OSMBuildingsGL('map', {
    position: { latitude:52.52000, longitude:13.41000 },
    zoom: 16,
    // rotation: 0, // optional
    // tilt: 0, // optional
    // disabled: true, // disables user input - optional
    minZoom: 12,
    maxZoom: 22,
    state: true,
    // tileSource: 'http://{s}.tiles.mapbox.com/v3/osmbuildings.lgh43kca/{z}/{x}/{y}.png',
    tileSource: 'http://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png',
    // tileSource: 'http://tile.stamen.com/toner/{z}/{x}/{y}.png',
    // dataSource: null, // null disables default OSM data,
    // dataSource: 'http://{s}.data.qa.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json',
    // showBackfaces: true, // render front and backsides of polygons. false increases performance, true might be needed for bad geometries
    // fogColor: '#ff0000',
    attribution: '© Data <a href="http://osmbuildings.org/copyright/">OpenStreetMap</a> © Map <a href="http://mapbox.com">MapBox</a> © 3D <a href="http://osmbuildings.org">OSM Buildings</a>'
  });

/***
  map.addTileLayer(
//  'http://{s}.tiles.mapbox.com/v3/osmbuildings.lgh43kca/{z}/{x}/{y}.png',
//  'http://tile.stamen.com/toner/{z}/{x}/{y}.png',
    'http://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png',
    {
//    attribution: '© Data <a href="http://osmbuildings.org/copyright/">OpenStreetMap</a> © Map <a href="http://mapbox.com">MapBox</a>'
      attribution: '© Map <a href="http://mapbox.com">MapBox</a>'
    }
  );

  map.addGeoJSONLayer(
    // 'http://{s}.data.qa.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json',
    {
//    attribution: '© Data <a href="http://osmbuildings.org/copyright/">OpenStreetMap</a> © 3D <a href="http://osmbuildings.org">OSM Buildings</a>'
      attribution: '© Data <a href="http://osmbuildings.org/copyright/">OpenStreetMap</a>'
   // showBackfaces: true, // render front and backsides of polygons. false increases performance, true might be needed for bad geometries
      buffer:
      bgColor:
    }
  );

  map.addOSMLayer();
***/

//  map.addOBJ('../dist/data/Fernsehturm_Berlin.obj', { latitude:52.51923, longitude:13.40371 }, { id:'Fernsehturm', scale:0.1, elevation:8, rotation:51 });

  // map.addGeoJSON('data/ESB_light_GeoJSON.json');
  // map.setPosition({ latitude:40.7484625, longitude:-73.9852667 });

  var gj = { type: 'FeatureCollection', features: [
    { type: 'Feature', properties: { color: '#ff0000', roofColor: '#cc0000', height: 55, minHeight: 50 }, geometry:
    { type: 'Polygon', coordinates: [[
      [ 13.37000, 52.52000 ],
      [ 13.37010, 52.52000 ],
      [ 13.37010, 52.52010 ],
      [ 13.37000, 52.52010 ],
      [ 13.37000, 52.52000 ]
    ]] }
    }
  ] };

  map.addGeoJSON(gj);

  //map.addGeoJSON('data/o2_nach_90.geo.json');
  //map.addGeoJSON('data/w1-o4.geo.json');

  if (typeof obj !== 'undefined') positionOnMap(obj);
  // map.addMesh('data/Lichtenberg1.gml');

  var label = document.getElementById('label');

  var nw = label.cloneNode(true);
  var se = label.cloneNode(true);
  document.body.appendChild(nw);
  document.body.appendChild(se);
  nw.style.borderColor = 'blue';
  se.style.borderColor = 'green';

  map.on('change', function() {
    var pos = map.transform(52.52, 13.37, 50);
    label.style.left = Math.round(pos.x) + 'px';
    label.style.top = Math.round(pos.y) + 'px';

//    var b = map.getBounds();
//
//    var pos = map.transform(b.n, b.w, 0);
//    nw.style.left = Math.round(pos.x+5) + 'px';
//    nw.style.top  = Math.round(pos.y+5) + 'px';
//
//    var pos = map.transform(b.s, b.e, 0);
//    se.style.left = Math.round(pos.x-5) + 'px';
//    se.style.top  = Math.round(pos.y-5) + 'px';
  });

  map.on('pointermove', function(e) {
    if (e.target) {
      document.body.style.cursor = 'pointer';
      map.highlight(e.target.id, '#f08000');
    } else {
      document.body.style.cursor = 'default';
      map.highlight(null);
    }
  });

  //*************************************************************************

  map.on('idle', function() {
    console.log('IDLE');
  });

  map.on('busy', function() {
    console.log('BUSY');
  });

  //*************************************************************************

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
</script>
</body>
</html>
