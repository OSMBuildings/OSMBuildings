
var PI = Math.PI;

var TILE_SIZE = 256;

var DATA_KEY = 'anonymous';
var DATA_SRC = 'http://{s}.data.osmbuildings.org/0.2/{k}/tile/{z}/{x}/{y}.json';

var DEFAULT_HEIGHT = 10;
var HEIGHT_SCALE = 0.7;

var DEFAULT_COLOR = Color.parse('rgb(220, 210, 200)').toRGBA(true);
var DEFAULT_HIGHLIGHT_COLOR = Color.parse('#f08000').toRGBA(true);

var FOG_COLOR = Color.parse('#f0f8ff').toRGBA(true);

var document = global.document;

var EARTH_RADIUS = 6378137;
var EARTH_CIRCUMFERENCE = EARTH_RADIUS*Math.PI*2;
