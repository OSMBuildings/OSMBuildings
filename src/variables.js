
const
  // MIN_ZOOM = 11,
  MIN_ZOOM = 14.5,
  MAX_ZOOM = 22,

  // MAX_TILT = 75;
  MAX_TILT = 55;


var TILE_SIZE = 256;

var DEFAULT_HEIGHT = 10;

var MAX_USED_ZOOM_LEVEL = 25;
var DEFAULT_COLOR = Qolor.parse('rgb(220, 210, 200)').toArray();

// #E8E0D8 is the background color of the current OSMBuildings map layer,
// and thus a good fog color to blend map tiles and buildings close to horizon into
var FOG_COLOR = '#e8e0d8';
//var FOG_COLOR = '#f0f8ff';
var BACKGROUND_COLOR = '#efe8e0';

var document = window.document;

var EARTH_RADIUS_IN_METERS = 6378137;
var EARTH_CIRCUMFERENCE_IN_METERS = EARTH_RADIUS_IN_METERS * Math.PI * 2;
var METERS_PER_DEGREE_LATITUDE = EARTH_CIRCUMFERENCE_IN_METERS / 360;

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

//the Marker texture as a data url
var MARKER_TEXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH4gUHDxACbf+ToAAABKBJREFUeNrt3YFtKjEURFGWBmiE/iuhka0AOgCxWpDte04DP/nxG88zkbJdWMLjdnv+89+77/vmf31+foiGXDgIAAy8QBAAGHiBIAAw9MJAAGDohYEAwNALAwGAwRcEAgCDLwgEAAZfEAgADL4gEAAGH0EgAAw+gkAAGHwEgQAw/AgBAWDwEQQCwPAjBASA4UcICACDjyAQAIYfISAADD9CQAAYfoSAADD4CAIBYPgRAgLA8CMEBIDhRwgIAMOPEBAAhh8hcIqrHzd0ZZLO7Y8WEA0Aw48QiAaA4UcIRAPA8CMEogFg+BECn/kUAMKWTDW3P1pANAAMP0LACgDUGoDbHy0gGgCGHyFgBQBqDcDtjxagAQC1BuD2RwvQAIBaA3D7owVoAECtAbj90QI0AKDWANz+aAEaAFBrAG5/tAANABAAQGYFUP+xBmgAgAAAMiuA+o81QAMABACQWQHUf6wBGgAgAAABAKz/BmD/xzuABgAIAEAAAOu/Adj/8Q6gAQACABAAgAAABAAgAIAjhv14wkeArGTUjwI1ALACAAIAEACAAAAEACAAAAEACABAAAACABAAgAAABAAgAAABAAgAQAAAAgAQAIAAAAQAIAAAAQD8zjbyF+ePg7CCUf8oiAYAVgBAAAACAOjYRv8CPQQys5EfADUAsAIAAgDwBuAdABr7vwYAVgDACmANgFT91wDACgAIAJUKBADQuawEAIRNV6t9GoDbXwMABACQWgGsAaj/GgBQDQC/EwAaALiUBABw1NRV2mMgbn8NACgGgMdA0ADAJSQAgG8tUaE9BuL21wCAYgPQAnD7awBAtQFoAbj9NQCgGgB+MQg0AHDJVANACwANAFwuAgB4Z9m67CNB3P4aAFBsAFoAbn8NAKg2AC0At78GAFQbgBaA218DAKoNQAvA7R8PACGA4bcCANUGoAXg9tcAgGoD0AJw+2sAQLUBaAG4/TUA0ADK37wWQPn21wBAA2jTAtz+5e9fA8DwCwCHAKwAVgEEvwYAaABaAG5/DQDQALQA3P4aABh+AeCQgBXAKoBg1wAADUALwO2vAYDhFwAOD1gBrAIIcA0A0AC0ANz+GgAYfgHgUIEAAEEtABwu+DMH+gAPggJaAwDDLwAcNrACWAUQyBoAGH4B4PCBAAAB7A3AWwCGXwNwGEEAgMAVAA4leAPwHoCg1QDA8AsAhxSsAFYBBKsGAIZfADi0IAAQpHgD8BZg+NEAHGIQAAhOrABWAcOPBuBQgwBAUGIFsAoYfjQAhxwEAIIRK4BVwPCjATj0IAAQhFYArAKGXwPAECAAQPBZAbAKGH4BgBAw/FYADAcCAAScFQCrgOHXADAsCAAQaFYArAKGXwPA8CAAQIBZAciuAoZfABANAcNvBcBQIQAQVFgBSKwChl8DwJAhABBMWAFIrAKGXwAQDQHDbwXA8CEAEEBYAUisAoZfA8BNjABA4GAFILEKGH4BQDQEDL8VAPUcAYBgwQpAYhUw/AKAaAgYfisAajsaALUmIEA0ALQHBACGGSsAiVVAYAgAoiFg+K0AWBUQABhyrAAkVgHBAMEQmPEPj3KeFy7fLVanpR7MAAAAAElFTkSuQmCC';
