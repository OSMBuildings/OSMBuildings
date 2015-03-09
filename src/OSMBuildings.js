
var OSMBuildings = function(options) {
  options = options || {};

  Data = new Grid(options.src || DATA_SRC.replace('{k}', options.dataKey || DATA_KEY), { fixedZoom: 16 });

  if (options.map) {
    this.addTo(options.map);
  }

  if (options.style) {
    this.setStyle(options.style);
  }
};

(function() {

  function onMapChange() {
    Data.updateTileBounds();
    Data.update(100);
  }

  function onMapResize() {
    Data.updateTileBounds();
    Data.update();
    Renderer.resize();
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
      Data.destroy();
    },

    setStyle: function(style) {
      var color = style.color || style.wallColor;
      if (color) {
        DEFAULT_COLOR = Color.parse(color).toRGBA();
      }
      return this;
    },

    addObject: function(type, url, position) {
      DataObjects.load(type, url, position);
      return this;
    }
  };

}());
