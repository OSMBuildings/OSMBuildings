
var PI = Math.PI;

var MIN_ZOOM = 14.5;

var TILE_SIZE = 256;

var DATA_KEY = 'anonymous';
var DATA_SRC = 'http://{s}.data.osmbuildings.org/0.2/{k}/tile/{z}/{x}/{y}.json';

var DEFAULT_HEIGHT = 10;

var DEFAULT_COLOR = Color.parse('rgb(220, 210, 200)').toRGBA();
var STYLE = {
  zoomAlpha: {
    min: { zoom: 17, alpha: 1.0 },
    max: { zoom: 20, alpha: 1.0 }
  }
};

var document = global.document;

var EARTH_RADIUS = 6378137;
var EARTH_CIRCUMFERENCE = EARTH_RADIUS*Math.PI*2;
