
# 2.1.0 @ 2015-11-03 #

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

# 2.0.0 @ 2015-10-16 #

- transform() method moved from GLMap to OSMBuildings
- improved calculation of visible tiles
- simplified internal grid handling
- proper destruction of objects
- added variance for default color
- resizing fixed
- baseURL option returned, makes locating assets much easier 
- fixed minZoom/maxZoom options for GLMap
- added minZoom/maxZoom options for OSM Buildings, all geometry items and tile layers
- added fixedZoom option for GeoJSONTiles

# 1.0.0 @ 2015-09-17 #

First stable public release.
Uses semantic versioning.
