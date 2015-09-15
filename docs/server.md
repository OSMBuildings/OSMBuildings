# OSM Buildings Server #

Code for OSM Buildings data service ist not public.
However, you may use our service for *free*.

Before hitting us with heavy load, please get in touch at support@osmbuildings.org

The built in default server URL schema is `http://{s}.data.osmbuildings.org/0.2/{k}/tile/{z}/{x}/{y}.json`

Placeholder and adressing schema is described here:
http://wiki.osgeo.org/wiki/Tile_Map_Service_Specification#Tile_Resources

`{s}` in our case stands for a subdomain (a,b,c,d) to extend the number of browser requests per domain.

## Data Source ##

We are pulling OpenStreetMap data from Overpass API (http://overpass-turbo.eu/).
That way we are very flexible in terms of querying and data freshness.
For retrieving building data, we convert TMS adressed tiles to geographic bounding boxes (projection EPSG 4326) and opted for a JSON formatted response.

## GeoJSON Properties ##

OSM Buildings Server does a lot of alignments, optimizations and caching and finally returns GeoJSON.
The result is fully compatible but has a few conventions, see below.

<table>
<tr>
<th>GeoJSON property</th>
<th>OSM Tags</th>
</tr>

<tr>
<td>height</td>
<td>height, building:height, levels, building:levels</td>
</tr>

<tr>
<td>minHeight</td>
<td>min_height, building:min_height, min_level, building:min_level</td>
</tr>

<tr>
<td>color/wallColor</td>
<td>building:color, building:colour</td>
</tr>

<tr>
<td>material</td>
<td>building:material, building:facade:material, building:cladding</td>
</tr>

<tr>
<td>roofColor</td>
<td>roof:color, roof:colour, building:roof:color, building:roof:colour</td>
</tr>

<tr>
<td>roofMaterial</td>
<td>roof:material, building:roof:material</td>
</tr>

<tr>
<td>shape</td>
<td>building:shape[=cylinder,sphere]</td>
</tr>

<tr>
<td>roofShape</td>
<td>roof:shape[=dome]</td>
</tr>

<tr>
<td>roofHeight</td>
<td>roof:height</td>
</tr>
</table>

## Sample Implementation ##

Code by Michael Meier (michael.meier@fau.de)

http://git.rrze.uni-erlangen.de/gitweb/?p=osmrrze.git;a=blob;f=scripts/osmbuildings-json-generator.pl
