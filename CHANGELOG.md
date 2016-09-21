
# 3.2.1 @ 2016-09-21

## Changed

- extended OSM roof shape support: Skillion, Gabled, Onion + Gabled as fallback for Hipped, Half-Hipped, Gambrel
- triangulatuion integrated from external module

## Fixed

- fixed fadeIn option for GeoJSON tiles
- minZoom/maxZoom behavior fixed


# 3.1.0 @ 2016-07-27

## Changed

- protocol changes to https
- check for currently loading files removed - enables duplicates
- enabled 'loadfeature' event to act like 'modifier' option of objects (breaking compatibility)

## Fixed

- dynamic highlightColor restored for 'highlight(id, color)'


# 3.0.0 @ 2016-06-24

## Changed

- all OSM id's now have a prefix for their type to make them truly unique (breaking compatibility)
- GLMap and OSMBuildings are now integrated to one package (breaking compatibility)
- added 'fadeIn' option for adding GeoJSON or OBJ
- aligned pointer event positioning

## Fixed

- animation timing
- FOV calculation


# 2.4.3 @ 2016-05-09

## New

- Touch gesture for map tilt (2 finger vertical swipe)

## Changed

- internal GL tools reorganized
- Basemap now using native events


# 2.4.2 @ 2016-04-21

## Changed

Updates for CI automation


# 2.4.1 @ 2016-04-18

## New

- render effect 'outline'
- bower.json added
- option 'modifier' when adding GeoJSON or OBJ to change all properties upon load
- map events for move, zoom, rotate, tilt, rightclick, contextmenu
- OSM Buildings event for loadfeature

## Changed

- picking precision improved
- first steps in new documentation setup
- initial steps in CI
- geometry processing rewritten
- switch from color-coded depth calculation to depth textures
- don't render walls for building=roof
- code examples reorganized

## Fixed

- disable effects if GPU does not support them, fixes broken MSIE 11 on old machines
- pointerup event when releasing a finger
- map.getBounds() fixed, return format changed
- several destroy() methods fixed
- polyfill for Android gestures added
- pointer coordinates adjusted for maps with offset
- sun direction fixed
- several shadow Moire effects
- missing texture coordinates for OBJ


# 2.3.0 @ 2016-02-24

## New

- SSAO finished
- shadow casting on buildings and basemap
- sky added
- horizon fog added
- building windows added
- options to control effects and overall quality

## Changed

- zoom logic changed from scale-the-world to move-away

## Fixed

- OBJ files didn't work properly for picking
- CustomEvent polyfill had always been in effect
- potentially diverged animation frames fixed


# 2.2.1 @ 2015-11-18

## New

- timeline based animation support added
- buildings grow in on load
- new show() / hide() methods with custom selectors and optional duration
- map.setState() for setting position, zoom, rotation etc. all at once
- configuration option 'optimize' in order to switch anistrophic filtering and SSAO
- methods for 3d projection/unprojection: transforms a point on 2d screen into 3d space and vice versa
- screenshot() method

## Changed

- internal coordinate system now based on meters instead of pixel+zoom representation
- events using much less abstraction code
- JS files of GLMap and OSM Buildings are combined into one
- default data tile zoom set to 15
- whole rewrite of backend from PHP to NodeJS
- improved object picking performance
- distance based model for combining map tiles, increases performance
- data read operations optimized
- whole Color API rewritten
- better basemap tile blending on zoom level switch
- more optimization to detect visible tiles

## Fixed

- uniform and attribute locations on shader switch
- mouse events are now passed through, even if map is disabled
- roofHeight for unsupported shapes fixed
- populating buffers fixed for large OBJ files
- more destructor fixes
- restored idle/busy events
- artifacts at basemap tile edges fixed


# 2.0.0 @ 2015-10-16

- transform() method moved from GLMap to OSM Buildings
- improved calculation of visible tiles
- simplified internal grid handling
- proper destruction of objects
- added variance for default color
- resizing fixed
- baseURL option returned, makes locating assets much easier
- fixed minZoom/maxZoom options for GLMap
- added minZoom/maxZoom options for OSM Buildings, all geometry items and tile layers
- added fixedZoom option for GeoJSONTiles


# 1.0.0 @ 2015-09-17

First stable public release.
Uses semantic versioning.
