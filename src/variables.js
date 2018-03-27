
var TILE_SIZE = 256;

var DEFAULT_HEIGHT = 10;
var HEIGHT_SCALE = 1.0;

var MIN_ZOOM = 14.5;
var MAX_ZOOM = 22;

var MAX_USED_ZOOM_LEVEL = 25;
var DEFAULT_COLOR = Qolor.parse('rgb(220, 210, 200)').toArray();
var HIGHLIGHT_COLOR = Qolor.parse('#f08000').toArray();
// #E8E0D8 is the background color of the current OSMBuildings map layer,
// and thus a good fog color to blend map tiles and buildings close to the horizont into
var FOG_COLOR = '#e8e0d8';
//var FOG_COLOR = '#f0f8ff';
var BACKGROUND_COLOR = '#efe8e0';

var document = window.document;

var EARTH_RADIUS_IN_METERS = 6378137;
var EARTH_CIRCUMFERENCE_IN_METERS = EARTH_RADIUS_IN_METERS * Math.PI * 2;
var METERS_PER_DEGREE_LATITUDE = EARTH_CIRCUMFERENCE_IN_METERS / 360;

/* the height of the skywall in meters */
var SKYWALL_HEIGHT = 2000.0;

/* For shadow mapping, the camera rendering the scene as seen by the sun has
 * to cover everything that's also visible to the user. For this to work 
 * reliably, we have to make assumptions on how high (in [m]) the buildings 
 * can become.
 * Note: using a lower-than-accurate value will lead to buildings parts at the
 * edge of the viewport to have incorrect shadows. Using a higher-than-necessary
 * value will lead to an unnecessarily large view area and thus to poor shadow
 * resolution. */
var SHADOW_MAP_MAX_BUILDING_HEIGHT = 100;

/* for shadow mapping, the scene needs to be rendered into a depth map as seen
 * by the light source. This rendering can have arbitrary dimensions -
 * they need not be related to the visible viewport size in any way. The higher
 * the resolution (width and height) for this depth map the smaller are
 * the visual artifacts introduced by shadow mapping. But increasing the
 * shadow depth map size impacts rendering performance */
var SHADOW_DEPTH_MAP_SIZE = 2048;

//the building wall texture as a data url
var BUILDING_TEXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAQMAAACQp+OdAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwCCAUQLpaUSQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAGUExURebm5v///zFES9kAAAAcSURBVCjPY/gPBQyUMh4wAAH/KAPCoFaoDnYGAAKtZsamTRFlAAAAAElFTkSuQmCC';
