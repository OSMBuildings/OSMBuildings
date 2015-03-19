
var Map, Renderer;

var OSMBuildings = function(options) {
  options = options || {};

  Grid.fixedZoom = 16;

  // src=false and src=null would disable the data grid
  if (options.src === undefined) {
    Grid.src = DATA_SRC.replace('{k}', options.dataKey || DATA_KEY);
  } else if (typeof options.src === 'string') {
    Grid.src = options.src;
  }

  if (options.map) {
    this.addTo(options.map);
  }

  if (options.style) {
    this.setStyle(options.style);
  }
};

(function() {

  function onMapChange() {
    Grid.onMapChange();
  }

  function onMapResize() {
    Grid.onMapResize();
    Renderer.onMapResize();
  }

  OSMBuildings.VERSION     = '0.1.5';
  OSMBuildings.ATTRIBUTION = '&copy; <a href="http://osmbuildings.org">OSM Buildings</a>';

  OSMBuildings.prototype = {

    addTo: function(map) {
      map.addLayer(this);

      Map = {};

      map.on('change', function() {
        Map.zoom     = map.getZoom();
        Map.bounds   = map.getBounds();
        Map.origin   = map.getOrigin();
        Map.rotation = map.getRotation();
        Map.tilt     = map.getTilt();
        onMapChange();
      });

      map.on('resize', function() {
        Map.size   = map.getSize();
        Map.bounds = map.getBounds();
        onMapResize();
      });

  //  map.addAttribution(OSMBuildings.ATTRIBUTION);

      Map.size     = map.getSize();
      Map.zoom     = map.getZoom();
      Map.bounds   = map.getBounds();
      Map.origin   = map.getOrigin();
      Map.rotation = map.getRotation();
      Map.tilt     = map.getTilt();

      Renderer = new GLRenderer(map.getContext());

      onMapChange();
      onMapResize();

      return this;
    },

    remove: function() {},

    render: function() {
      Renderer.render();
      return this;
    },

    destroy: function() {
      Grid.destroy();
    },

    setStyle: function(style) {
      var color = style.color || style.wallColor;
      if (color) {
        DEFAULT_COLOR = Color.parse(color).toRGBA();
      }
      return this;
    },

    addMesh: function(url) {
      if (typeof url === 'object') {
        Data.add(new Mesh(url));
      } else {
        var mesh = new Mesh();
        Data.add(mesh);
        mesh.load(url);
      }
      return this;
    }
  };

}());
