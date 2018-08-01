
const
  // MIN_ZOOM = 11,
  MIN_ZOOM = 15,
  MAX_ZOOM = 22,

  // MAX_TILT = 75;
  MAX_TILT = 45;


const TILE_SIZE = 256;

const DEFAULT_HEIGHT = 10;

const MAX_USED_ZOOM_LEVEL = 25;
let DEFAULT_COLOR = Qolor.parse('rgb(220, 210, 200)').toArray();

// #E8E0D8 is the background color of the current OSMBuildings map layer,
// and thus a good fog color to blend map tiles and buildings close to horizon into
const FOG_COLOR = '#e8e0d8';
//const FOG_COLOR = '#f0f8ff';
const BACKGROUND_COLOR = '#efe8e0';

const document = window.document;

const EARTH_RADIUS_IN_METERS = 6378137;
const EARTH_CIRCUMFERENCE_IN_METERS = EARTH_RADIUS_IN_METERS * Math.PI * 2;
const METERS_PER_DEGREE_LATITUDE = EARTH_CIRCUMFERENCE_IN_METERS / 360;
let METERS_PER_DEGREE_LONGITUDE = METERS_PER_DEGREE_LATITUDE; // variable

/* For shadow mapping, the camera rendering the scene as seen by the sun has
 * to cover everything that's also visible to the user. For this to work
 * reliably, we have to make assumptions on how high (in [m]) the buildings
 * can become.
 * Note: using a lower-than-accurate value will lead to buildings parts at the
 * edge of the viewport to have incorrect shadows. Using a higher-than-necessary
 * value will lead to an unnecessarily large view area and thus to poor shadow
 * resolution. */
const SHADOW_MAP_MAX_BUILDING_HEIGHT = 100;

/* for shadow mapping, the scene needs to be rendered into a depth map as seen
 * by the light source. This rendering can have arbitrary dimensions -
 * they need not be related to the visible viewport size in any way. The higher
 * the resolution (width and height) for this depth map the smaller are
 * the visual artifacts introduced by shadow mapping. But increasing the
 * shadow depth map size impacts rendering performance */
const SHADOW_DEPTH_MAP_SIZE = 2048;

// building wall texture as a data url
const BUILDING_TEXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAQMAAACQp+OdAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwCCAUQLpaUSQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAGUExURebm5v///zFES9kAAAAcSURBVCjPY/gPBQyUMh4wAAH/KAPCoFaoDnYGAAKtZsamTRFlAAAAAElFTkSuQmCC';

// TODO: automate
const DEFAULT_ICON = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="512px" height="512px" viewBox="0 0 512 512"><path d="M256,0C167.641,0,96,71.625,96,160c0,24.75,5.625,48.219,15.672,69.125C112.234,230.313,256,512,256,512l142.594-279.375C409.719,210.844,416,186.156,416,160C416,71.625,344.375,0,256,0z M256,256c-53.016,0-96-43-96-96s42.984-96,96-96c53,0,96,43,96,96S309,256,256,256z"/></svg>';
