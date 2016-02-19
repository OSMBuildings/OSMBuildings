
# Changelog

## 2.3.0 @ 2016-02-20

### New

- shadow casting on buildings and basemap
- sky added
- horizon fog added
- building windows added
- options to control effects and overall quality
- methods for 3d projection/unprojection: transforms a point on 2d screen into 3d space and vice versa
- screenshot() method

### Changed

- internal coordinate system now based on meters instead of pixel+zoom representation
- zoom logic changed from scale-the-world to move-away
- events using much less abstraction code
- JS files of GLMap and OSM Buildings are combined into one
- default data tile zoom set to 15
- whole rewrite of backend from PHP to NodeJS
- improved object picking performance
- distance based model for combining map tiles, increases performance

### Fixed

- OBJ files didn't work properly for picking
- not re-retrieving uniform and attribute locations on shader switch
- mouse events are now passed through, even if map is disabled
- CustomEvent polyfill had always been in effect
- potentially diverged animation frames fixed


## 2.2.0 skipped


## 2.1.0 @ 2015-11-03

- roofHeight for unsupported shapes fixed
- data read operations optimized
- timeline based animation support added
- buildings grow in on load
- populating buffers fixed for large OBJ files
- more destructor fixes
- new show() / hide() methods with custom selectors and optional duration
- SSAO added
- whole Color API rewritten
- restored idle/busy events
- more optimization to detect visible tiles
- artifacts at basemap tile edges fixed
- better basemap tile blending on zoom level switch 


## 2.0.0 @ 2015-10-16

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

## 1.0.0 @ 2015-09-17

First stable public release.
Uses semantic versioning.
